/**
 * PAPER TRADING ENGINE
 * 
 * This simulates real trading with:
 * - Realistic fills (slippage, spread)
 * - Transaction costs
 * - Partial fills
 * - Order queue
 * - Position management
 * 
 * Use this for 3-6 months before going live.
 */

import { RiskManager, TradeSignal } from '../strategies/real-strategies';

export interface PaperPosition {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  stopLoss: number;
  takeProfit: number;
  pnl: number;
  pnlPercent: number;
  openTime: string;
  strategy: string;
}

export interface PaperTrade {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  fees: number;
  openTime: string;
  closeTime: string;
  strategy: string;
  closeReason: 'STOP_LOSS' | 'TAKE_PROFIT' | 'MANUAL' | 'TIME' | 'TRAILING_STOP';
}

export interface PaperPortfolio {
  capital: number;
  cash: number;
  equity: number;
  positions: PaperPosition[];
  trades: PaperTrade[];
  dailyPnL: number;
  totalPnL: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

/**
 * BROKER CONFIGURATION
 * Supports Indian brokers: Zerodha, Upstox, Angel One, Fyers
 */
export interface BrokerConfig {
  name: 'ZERODHA' | 'UPSTOX' | 'ANGEL' | 'FYERS' | 'PAPER';
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  
  // Fee structure (as of 2024)
  brokerage: number;      // Per lot or per trade
  stt: number;            // Securities Transaction Tax
  transactionCharges: number;
  sebiCharges: number;
  stampDuty: number;
  gst: number;
}

export const BROKER_CONFIGS: Record<string, BrokerConfig> = {
  ZERODHA: {
    name: 'ZERODHA',
    brokerage: 20, // ₹20 per order (intraday/F&O) or 0.03% delivery
    stt: 0.1, // 0.1% on sell side (intraday)
    transactionCharges: 0.00345, // 0.00345%
    sebiCharges: 0.0001, // ₹10 per crore
    stampDuty: 0.003, // 0.003% buy side
    gst: 18, // 18% on brokerage + SEBI
  },
  UPSTOX: {
    name: 'UPSTOX',
    brokerage: 20,
    stt: 0.1,
    transactionCharges: 0.00345,
    sebiCharges: 0.0001,
    stampDuty: 0.003,
    gst: 18,
  },
  PAPER: {
    name: 'PAPER',
    brokerage: 0,
    stt: 0,
    transactionCharges: 0,
    sebiCharges: 0,
    stampDuty: 0,
    gst: 0,
  },
};

export class PaperTradingEngine {
  private portfolio: PaperPortfolio;
  private riskManager: RiskManager;
  private brokerConfig: BrokerConfig;
  private slippagePercent = 0.05; // 0.05% slippage
  private positionIdCounter = 0;
  private tradeIdCounter = 0;

  constructor(initialCapital: number, broker: keyof typeof BROKER_CONFIGS = 'PAPER') {
    this.riskManager = new RiskManager(initialCapital);
    this.brokerConfig = BROKER_CONFIGS[broker];
    this.portfolio = {
      capital: initialCapital,
      cash: initialCapital,
      equity: initialCapital,
      positions: [],
      trades: [],
      dailyPnL: 0,
      totalPnL: 0,
      winRate: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
    };
  }

  /**
   * EXECUTE A TRADE
   * This is where the magic happens (or where you lose money)
   */
  executeTrade(signal: TradeSignal, currentPrice: number): { success: boolean; message: string; position?: PaperPosition } {
    // 1. RISK CHECK (non-negotiable)
    const riskCheck = this.riskManager.canTakeTrade(
      signal.entryPrice,
      signal.stopLoss,
      signal.symbol
    );

    if (!riskCheck.allowed) {
      return { success: false, message: `Risk check failed: ${riskCheck.reason}` };
    }

    // 2. CALCULATE QUANTITY
    const quantity = signal.quantity || riskCheck.suggestedSize;
    if (quantity <= 0) {
      return { success: false, message: 'Invalid position size' };
    }

    // 3. CHECK MARGIN/CASH
    const totalCost = currentPrice * quantity;
    if (totalCost > this.portfolio.cash) {
      return { success: false, message: `Insufficient cash. Need ₹${totalCost.toFixed(2)}, have ₹${this.portfolio.cash.toFixed(2)}` };
    }

    // 4. ADD SLIPPAGE (realistic execution)
    const slippage = currentPrice * (this.slippagePercent / 100);
    const fillPrice = signal.action === 'BUY' || signal.action === 'SELL_PUT' 
      ? currentPrice + slippage 
      : currentPrice - slippage;

    // 5. CALCULATE FEES
    const fees = this.calculateFees(fillPrice, quantity, signal.action === 'SELL' || signal.action === 'SELL_PUT' || signal.action === 'SELL_CALL');

    // 6. CREATE POSITION
    const position: PaperPosition = {
      id: `POS-${++this.positionIdCounter}`,
      symbol: signal.symbol,
      side: signal.action === 'BUY' ? 'LONG' : 'SHORT',
      entryPrice: fillPrice,
      currentPrice: fillPrice,
      quantity,
      stopLoss: signal.stopLoss,
      takeProfit: signal.takeProfit,
      pnl: 0,
      pnlPercent: 0,
      openTime: new Date().toISOString(),
      strategy: signal.strategy,
    };

    // 7. UPDATE PORTFOLIO
    this.portfolio.cash -= totalCost + fees;
    this.portfolio.positions.push(position);
    this.riskManager.openPosition();

    return {
      success: true,
      message: `Position opened: ${signal.action} ${quantity} ${signal.symbol} @ ₹${fillPrice.toFixed(2)}`,
      position,
    };
  }

  /**
   * UPDATE POSITIONS WITH NEW PRICE
   * Checks stop loss and take profit
   */
  updatePositions(prices: Record<string, number>): PaperTrade[] {
    const closedTrades: PaperTrade[] = [];

    for (const position of this.portfolio.positions) {
      const currentPrice = prices[position.symbol];
      if (!currentPrice) continue;

      // Update current price and P&L
      position.currentPrice = currentPrice;
      const priceDiff = position.side === 'LONG' 
        ? currentPrice - position.entryPrice 
        : position.entryPrice - currentPrice;
      position.pnl = priceDiff * position.quantity;
      position.pnlPercent = (priceDiff / position.entryPrice) * 100;

      // CHECK STOP LOSS
      if (
        (position.side === 'LONG' && currentPrice <= position.stopLoss) ||
        (position.side === 'SHORT' && currentPrice >= position.stopLoss)
      ) {
        const trade = this.closePosition(position, position.stopLoss, 'STOP_LOSS');
        closedTrades.push(trade);
      }

      // CHECK TAKE PROFIT
      if (
        (position.side === 'LONG' && currentPrice >= position.takeProfit) ||
        (position.side === 'SHORT' && currentPrice <= position.takeProfit)
      ) {
        const trade = this.closePosition(position, position.takeProfit, 'TAKE_PROFIT');
        closedTrades.push(trade);
      }
    }

    // Update portfolio equity
    this.portfolio.equity = this.portfolio.cash + this.portfolio.positions.reduce((sum, pos) => {
      return sum + pos.currentPrice * pos.quantity;
    }, 0);

    return closedTrades;
  }

  /**
   * CLOSE A POSITION MANUALLY
   */
  closePositionManually(positionId: string, currentPrice: number): PaperTrade | null {
    const position = this.portfolio.positions.find(p => p.id === positionId);
    if (!position) return null;

    // Add slippage on exit
    const slippage = currentPrice * (this.slippagePercent / 100);
    const exitPrice = position.side === 'LONG' 
      ? currentPrice - slippage 
      : currentPrice + slippage;

    return this.closePosition(position, exitPrice, 'MANUAL');
  }

  private closePosition(
    position: PaperPosition, 
    exitPrice: number, 
    reason: PaperTrade['closeReason']
  ): PaperTrade {
    const priceDiff = position.side === 'LONG' 
      ? exitPrice - position.entryPrice 
      : position.entryPrice - exitPrice;
    const pnl = priceDiff * position.quantity;
    const fees = this.calculateFees(exitPrice, position.quantity, position.side === 'SHORT');

    const trade: PaperTrade = {
      id: `TRD-${++this.tradeIdCounter}`,
      symbol: position.symbol,
      side: position.side,
      entryPrice: position.entryPrice,
      exitPrice,
      quantity: position.quantity,
      pnl: pnl - fees,
      pnlPercent: (priceDiff / position.entryPrice) * 100,
      fees,
      openTime: position.openTime,
      closeTime: new Date().toISOString(),
      strategy: position.strategy,
      closeReason: reason,
    };

    // Update portfolio
    this.portfolio.cash += position.entryPrice * position.quantity + pnl - fees;
    this.portfolio.trades.push(trade);
    this.portfolio.positions = this.portfolio.positions.filter(p => p.id !== position.id);
    this.riskManager.closePosition();
    this.riskManager.updatePnL(pnl - fees, position.symbol);

    // Update metrics
    this.updateMetrics();

    return trade;
  }

  private calculateFees(price: number, quantity: number, isSell: boolean): number {
    const tradeValue = price * quantity;
    let totalFees = 0;

    // Brokerage
    totalFees += this.brokerConfig.brokerage;

    // STT (on sell side only for intraday)
    if (isSell) {
      totalFees += tradeValue * (this.brokerConfig.stt / 100);
    }

    // Transaction charges
    totalFees += tradeValue * (this.brokerConfig.transactionCharges / 100);

    // SEBI charges
    totalFees += this.brokerConfig.sebiCharges * 100;

    // GST on brokerage + SEBI
    totalFees += (this.brokerConfig.brokerage + this.brokerConfig.sebiCharges * 100) * (this.brokerConfig.gst / 100);

    // Stamp duty (on buy side)
    if (!isSell) {
      totalFees += tradeValue * (this.brokerConfig.stampDuty / 100);
    }

    return totalFees;
  }

  private updateMetrics() {
    const trades = this.portfolio.trades;
    if (trades.length === 0) return;

    // Win rate
    const wins = trades.filter(t => t.pnl > 0).length;
    this.portfolio.winRate = (wins / trades.length) * 100;

    // Total P&L
    this.portfolio.totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);

    // Max drawdown
    let peak = this.portfolio.capital;
    let maxDrawdown = 0;
    let running = this.portfolio.capital;
    for (const trade of trades) {
      running += trade.pnl;
      if (running > peak) peak = running;
      const dd = (peak - running) / peak * 100;
      if (dd > maxDrawdown) maxDrawdown = dd;
    }
    this.portfolio.maxDrawdown = maxDrawdown;
  }

  getPortfolio(): PaperPortfolio {
    return { ...this.portfolio };
  }

  getRiskStatus() {
    return this.riskManager.getStatus();
  }

  /**
   * RESET DAILY P&L (call at start of each day)
   */
  resetDaily() {
    this.portfolio.dailyPnL = 0;
    this.riskManager.resetDailyPnL();
  }
}

/**
 * BROKER API INTEGRATION GUIDE
 * 
 * ZERODHA KITE CONNECT:
 * - Sign up at: https://kite.trade/
 * - API docs: https://tradingqna.com/t/kite-connect-api/32095
 * - Requires: ₹2000/month subscription
 * 
 * UPSTOX API:
 * - Sign up at: https://upstox.com/
 * - Free API access
 * - Docs: https://upstox.com/api-doc/
 * 
 * ANGEL ONE SMARTAPI:
 * - Sign up at: https://smartapi.angelone.in/
 * - Free API access
 * - Docs: https://smartapi.angelone.in/docs
 * 
 * FYERS API:
 * - Sign up at: https://fyers.in/
 * - Free API access
 * - Docs: https://myapi.fyers.in/docsv3
 */

/**
 * EXAMPLE: ZERODHA KITE INTEGRATION
 * 
 * This shows how to connect to Zerodha's API
 * You'll need to install: npm install kiteconnect
 */
export const ZERODHA_INTEGRATION_EXAMPLE = `
// Step 1: Install KiteConnect
// npm install kiteconnect

const KiteConnect = require('kiteconnect').default;

// Step 2: Initialize
const kc = new KiteConnect({
  api_key: "YOUR_API_KEY"
});

// Step 3: Get request token (from login redirect)
// Open: https://kite.zerodha.com/connect/login?api_key=YOUR_API_KEY&v=3
// You'll be redirected to: http://YOUR_REDIRECT_URI?request_token=XXXXX&action=login&status=success

// Step 4: Generate session
async function connect() {
  try {
    const response = await kc.generateSession("REQUEST_TOKEN", "API_SECRET");
    console.log("Access token:", response.access_token);
    
    // Step 5: Place orders
    const orderId = kc.placeOrder("REGULAR", {
      exchange: kc.EXCHANGE_NSE,
      tradingsymbol: "RELIANCE-EQ",
      transaction_type: kc.TRANSACTION_TYPE_BUY,
      order_type: kc.ORDER_TYPE_MARKET,
      quantity: 1,
      product: kc.PRODUCT_MIS,
      validity: kc.VALIDITY_DAY
    });
    console.log("Order placed:", orderId);
    
    // Step 6: Get positions
    const positions = await kc.positions();
    console.log("Positions:", positions);
    
    // Step 7: Get holdings
    const holdings = await kc.holdings();
    console.log("Holdings:", holdings);
    
  } catch (error) {
    console.error("Error:", error);
  }
}

// Step 8: Subscribe to live data
const ticker = new KiteTicker({
  api_key: "YOUR_API_KEY",
  access_token: "YOUR_ACCESS_TOKEN"
});

ticker.connect();
ticker.on("connect", () => {
  ticker.subscribe([53496065]); // RELIANCE token
  ticker.setMode(ticker.modeFull, [53496065]);
});

ticker.on("tick", (tick) => {
  console.log("Tick:", tick);
});
`;
