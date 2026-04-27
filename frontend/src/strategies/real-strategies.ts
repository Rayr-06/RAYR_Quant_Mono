/**
 * REAL TRADING STRATEGIES - Not YouTube BS
 * 
 * These are based on:
 * - Turtle Trading System (trend following)
 * - Mean Reversion with Bollinger Bands
 * - Momentum with volume confirmation
 * - Options selling strategies
 * 
 * RULES (non-negotiable):
 * 1. Risk max 1% per trade
 * 2. Minimum 2:1 risk-reward
 * 3. Only trade liquid instruments
 * 4. No revenge trading
 * 5. Stop loss is MANDATORY
 */

export interface TradeSignal {
  symbol: string;
  action: 'BUY' | 'SELL' | 'SHORT' | 'BUY_PUT' | 'SELL_PUT' | 'SELL_CALL' | 'CLOSE';
  quantity: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  strategy: string;
  confidence: number;
  timeframe: string;
  reason: string;
  timestamp: string;
}

export interface MarketData {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: string;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: { line: number; signal: number; histogram: number };
  bollingerBands: { upper: number; middle: number; lower: number };
  ema: { fast: number; slow: number; superTrend: number };
  atr: number;
  vwap: number;
  volumeSMA: number;
}

/**
 * THE ONLY STRATEGIES THAT ACTUALLY MAKE MONEY:
 * 
 * 1. TREND FOLLOWING (works in trending markets)
 *    - Enter on pullback to 20 EMA
 *    - Stop below recent swing low
 *    - Trail stop as trend continues
 *    - Win rate: ~35-45% but R:R is 3:1+
 * 
 * 2. MEAN REVERSION (works in range-bound markets)
 *    - Buy at lower Bollinger Band
 *    - Sell at upper Bollinger Band
 *    - Stop below lower band
 *    - Win rate: ~55-65% but R:R is 1.5:1
 * 
 * 3. BREAKOUT (works during volatility expansion)
 *    - Buy above resistance with volume
 *    - Stop below breakout level
 *    - Target = distance of consolidation
 *    - Win rate: ~40-50% but R:R is 2.5:1
 * 
 * 4. OPTIONS SELLING (works in any market)
 *    - Sell puts on strong stocks at support
 *    - Sell calls on weak stocks at resistance
 *    - Keep premium if price stays in range
 *    - Win rate: ~65-75% but limited upside
 */

export class RealTrendFollowingStrategy {
  private name = 'Trend Following (Real)';
  
  // CONFIGURATION (adjust based on your risk tolerance)
  private config = {
    fastEMA: 20,        // Fast moving average
    slowEMA: 50,        // Slow moving average
    trendEMA: 200,      // Long-term trend filter
    atrPeriod: 14,      // Average True Range period
    atrStopMultiple: 2, // Stop loss = 2x ATR
    maxRiskPercent: 1,  // Risk only 1% per trade
    minRRRatio: 2.5,    // Minimum risk-reward ratio
    volumeConfirm: 1.5, // Volume must be 1.5x average
  };

  /**
   * CRITICAL: This strategy ONLY works when:
   * 1. Price is above 200 EMA (uptrend) or below 200 EMA (downtrend)
   * 2. 20 EMA is above 50 EMA (momentum confirm)
   * 3. Volume is above average (real move, not fake)
   * 4. RSI is not overbought (>70) for longs or oversold (<30) for shorts
   */
  calculate(data: MarketData[], indicators: TechnicalIndicators): TradeSignal | null {
    const current = data[data.length - 1];
    const prev = data[data.length - 2];
    
    if (!current || !prev) return null;

    // TREND FILTER - Only trade in direction of major trend
    const isUptrend = current.close > indicators.ema.slow && current.close > indicators.ema.superTrend;
    const isDowntrend = current.close < indicators.ema.slow && current.close < indicators.ema.superTrend;

    // ENTRY CONDITIONS
    // Long: Price pulls back to 20 EMA, RSI > 50, Volume above average
    const longEntry = (
      isUptrend &&
      prev.close < indicators.ema.fast && // Previous candle was below 20 EMA (pullback)
      current.close > indicators.ema.fast && // Current candle closes above 20 EMA (bounce)
      indicators.rsi > 50 && indicators.rsi < 70 && // RSI confirms momentum but not overbought
      current.volume > indicators.volumeSMA * this.config.volumeConfirm && // Volume confirmation
      indicators.macd.histogram > 0 // MACD positive
    );

    // Short: Price pulls back up to 20 EMA, RSI < 50, Volume above average
    const shortEntry = (
      isDowntrend &&
      prev.close > indicators.ema.fast &&
      current.close < indicators.ema.fast &&
      indicators.rsi < 50 && indicators.rsi > 30 &&
      current.volume > indicators.volumeSMA * this.config.volumeConfirm &&
      indicators.macd.histogram < 0
    );

    if (longEntry) {
      const stopLoss = current.close - (indicators.atr * this.config.atrStopMultiple);
      const takeProfit = current.close + (indicators.atr * this.config.atrStopMultiple * 3); // 3:1 RR
      const riskReward = (takeProfit - current.close) / (current.close - stopLoss);

      if (riskReward >= this.config.minRRRatio) {
        return {
          symbol: current.symbol,
          action: 'BUY',
          quantity: 0, // Will be calculated based on risk
          entryPrice: current.close,
          stopLoss,
          takeProfit,
          strategy: this.name,
          confidence: Math.min(indicators.rsi / 50, 1),
          timeframe: '15min',
          reason: `Trend bounce off 20 EMA. RSI: ${indicators.rsi.toFixed(1)}, Volume: ${(current.volume / indicators.volumeSMA).toFixed(1)}x avg`,
          timestamp: current.timestamp,
        };
      }
    }

    if (shortEntry) {
      const stopLoss = current.close + (indicators.atr * this.config.atrStopMultiple);
      const takeProfit = current.close - (indicators.atr * this.config.atrStopMultiple * 3);
      const riskReward = (current.close - takeProfit) / (stopLoss - current.close);

      if (riskReward >= this.config.minRRRatio) {
        return {
          symbol: current.symbol,
          action: 'SELL',
          quantity: 0,
          entryPrice: current.close,
          stopLoss,
          takeProfit,
          strategy: this.name,
          confidence: Math.min((100 - indicators.rsi) / 50, 1),
          timeframe: '15min',
          reason: `Trend rejection at 20 EMA. RSI: ${indicators.rsi.toFixed(1)}, Volume: ${(current.volume / indicators.volumeSMA).toFixed(1)}x avg`,
          timestamp: current.timestamp,
        };
      }
    }

    return null;
  }

  /**
   * POSITION SIZING - THE MOST IMPORTANT PART
   * 
   * Rule: Risk only 1% of capital per trade
   * Formula: Quantity = (Capital * Risk%) / (Entry - StopLoss)
   */
  calculatePositionSize(capital: number, entryPrice: number, stopLoss: number): number {
    const riskAmount = capital * (this.config.maxRiskPercent / 100);
    const riskPerShare = Math.abs(entryPrice - stopLoss);
    return Math.floor(riskAmount / riskPerShare);
  }
}

export class MeanReversionStrategy {
  private name = 'Mean Reversion (Real)';
  
  private config = {
    bbPeriod: 20,
    bbStd: 2,
    rsiPeriod: 14,
    rsiOversold: 30,
    rsiOverbought: 70,
    maxRiskPercent: 1,
    maxBarsInRange: 50, // Only trade if market is range-bound
    atrPeriod: 14,
  };

  /**
   * CRITICAL: This strategy ONLY works when:
   * 1. Market is range-bound (Bollinger Bands flat, not expanding)
   * 2. RSI is at extremes (oversold for buy, overbought for sell)
   * 3. Price is at Bollinger Band
   * 4. Volume is NOT spiking (spikes = breakout, not mean reversion)
   */
  calculate(data: MarketData[], indicators: TechnicalIndicators): TradeSignal | null {
    const current = data[data.length - 1];
    
    if (!current) return null;

    // CHECK IF MARKET IS RANGE-BOUND
    // Bollinger Band width should be stable, not expanding
    const bbWidth = (indicators.bollingerBands.upper - indicators.bollingerBands.lower) / indicators.bollingerBands.middle;
    const isRangeBound = bbWidth < 0.08; // Bands not too wide = range-bound

    // BUY at lower band when oversold
    if (
      isRangeBound &&
      current.close <= indicators.bollingerBands.lower &&
      indicators.rsi <= this.config.rsiOversold &&
      current.volume < indicators.volumeSMA * 1.2 // NOT spiking (would indicate breakout)
    ) {
      const stopLoss = indicators.bollingerBands.lower - indicators.atr;
      const takeProfit = indicators.bollingerBands.middle; // Target: middle band
      const riskReward = (takeProfit - current.close) / (current.close - stopLoss);

      if (riskReward >= 1.5) {
        return {
          symbol: current.symbol,
          action: 'BUY',
          quantity: 0,
          entryPrice: current.close,
          stopLoss,
          takeProfit,
          strategy: this.name,
          confidence: (this.config.rsiOversold - indicators.rsi) / this.config.rsiOversold,
          timeframe: '5min',
          reason: `Oversold at BB lower. RSI: ${indicators.rsi.toFixed(1)}, BB Width: ${bbWidth.toFixed(3)}`,
          timestamp: current.timestamp,
        };
      }
    }

    // SELL at upper band when overbought
    if (
      isRangeBound &&
      current.close >= indicators.bollingerBands.upper &&
      indicators.rsi >= this.config.rsiOverbought &&
      current.volume < indicators.volumeSMA * 1.2
    ) {
      const stopLoss = indicators.bollingerBands.upper + indicators.atr;
      const takeProfit = indicators.bollingerBands.middle;
      const riskReward = (current.close - takeProfit) / (stopLoss - current.close);

      if (riskReward >= 1.5) {
        return {
          symbol: current.symbol,
          action: 'SELL',
          quantity: 0,
          entryPrice: current.close,
          stopLoss,
          takeProfit,
          strategy: this.name,
          confidence: (indicators.rsi - this.config.rsiOverbought) / (100 - this.config.rsiOverbought),
          timeframe: '5min',
          reason: `Overbought at BB upper. RSI: ${indicators.rsi.toFixed(1)}, BB Width: ${bbWidth.toFixed(3)}`,
          timestamp: current.timestamp,
        };
      }
    }

    return null;
  }

  calculatePositionSize(capital: number, entryPrice: number, stopLoss: number): number {
    const riskAmount = capital * (this.config.maxRiskPercent / 100);
    const riskPerShare = Math.abs(entryPrice - stopLoss);
    return Math.floor(riskAmount / riskPerShare);
  }
}

export class BreakoutStrategy {
  private name = 'Breakout (Real)';
  
  private config = {
    lookbackPeriod: 20,
    volumeMultiplier: 2,
    atrPeriod: 14,
    atrStopMultiple: 1.5,
    maxRiskPercent: 1,
    minConsolidationBars: 10,
  };

  calculate(data: MarketData[], indicators: TechnicalIndicators): TradeSignal | null {
    if (data.length < this.config.lookbackPeriod + 1) return null;

    const current = data[data.length - 1];
    const prev = data[data.length - 2];
    const lookbackData = data.slice(-this.config.lookbackPeriod);
    
    // Calculate resistance (highest high) and support (lowest low)
    const resistance = Math.max(...lookbackData.map(d => d.high));
    const support = Math.min(...lookbackData.map(d => d.low));
    
    // Volume confirmation is CRITICAL for breakouts
    const volumeConfirmed = current.volume > indicators.volumeSMA * this.config.volumeMultiplier;

    // BREAKOUT UP
    if (
      current.close > resistance &&
      prev?.close !== undefined && prev.close <= resistance &&
      volumeConfirmed &&
      indicators.atr > 0
    ) {
      const stopLoss = resistance - indicators.atr * this.config.atrStopMultiple;
      const target = current.close + (resistance - support); // Target = range height
      const riskReward = (target - current.close) / (current.close - stopLoss);

      if (riskReward >= 2) {
        return {
          symbol: current.symbol,
          action: 'BUY',
          quantity: 0,
          entryPrice: current.close,
          stopLoss,
          takeProfit: target,
          strategy: this.name,
          confidence: Math.min(current.volume / indicators.volumeSMA / 3, 1),
          timeframe: '15min',
          reason: `Breakout above ${resistance.toFixed(2)} with ${(current.volume / indicators.volumeSMA).toFixed(1)}x volume`,
          timestamp: current.timestamp,
        };
      }
    }

    // BREAKOUT DOWN
    if (
      current.close < support &&
      prev?.close !== undefined && prev.close >= support &&
      volumeConfirmed
    ) {
      const stopLoss = support + indicators.atr * this.config.atrStopMultiple;
      const target = current.close - (resistance - support);
      const riskReward = (current.close - target) / (stopLoss - current.close);

      if (riskReward >= 2) {
        return {
          symbol: current.symbol,
          action: 'SELL',
          quantity: 0,
          entryPrice: current.close,
          stopLoss,
          takeProfit: target,
          strategy: this.name,
          confidence: Math.min(current.volume / indicators.volumeSMA / 3, 1),
          timeframe: '15min',
          reason: `Breakdown below ${support.toFixed(2)} with ${(current.volume / indicators.volumeSMA).toFixed(1)}x volume`,
          timestamp: current.timestamp,
        };
      }
    }

    return null;
  }

  calculatePositionSize(capital: number, entryPrice: number, stopLoss: number): number {
    const riskAmount = capital * (this.config.maxRiskPercent / 100);
    const riskPerShare = Math.abs(entryPrice - stopLoss);
    return Math.floor(riskAmount / riskPerShare);
  }
}

/**
 * OPTIONS SELLING STRATEGIES
 * These have the highest win rate because you profit from time decay
 */

export class CashSecuredPutStrategy {
  private name = 'Cash-Secured Put (Real)';
  
  private config = {
    maxRiskPercent: 2,
    minPremium: 2, // Minimum premium in ₹
    daysToExpiry: 30, // Sell options 30 days out
    deltaTarget: 0.30, // ~30% probability of being assigned
    strongSupportMultiple: 1.05, // Strike should be 5% below support
  };

  /**
   * RULES:
   * 1. Only sell puts on fundamentally strong stocks
   * 2. Strike should be at strong support level
   * 3. Premium should be worth it (min ₹2)
   * 4. You must have cash to buy if assigned
   * 5. NEVER sell puts on stocks you don't want to own
   */
  calculate(data: MarketData[], indicators: TechnicalIndicators, supportLevel: number): TradeSignal | null {
    const current = data[data.length - 1];
    
    // Check if stock is strong (above 200 EMA, RSI healthy)
    const isStrong = indicators.ema.slow > indicators.ema.superTrend * 0.95; // Near or above 200 EMA
    const nearSupport = Math.abs(current.close - supportLevel) / supportLevel < 0.05;

    if (isStrong && nearSupport && indicators.rsi > 40 && indicators.rsi < 60) {
      // Ideal scenario: Strong stock near support, healthy RSI
      return {
        symbol: current.symbol,
        action: 'SELL_PUT',
        quantity: 0, // 1 lot = 500-750 shares depending on stock
        entryPrice: supportLevel * this.config.strongSupportMultiple, // Strike price
        stopLoss: 0, // Defined by premium received
        takeProfit: 0, // Premium received
        strategy: this.name,
        confidence: 0.7,
        timeframe: `${this.config.daysToExpiry}D`,
        reason: `Selling put at ${supportLevel.toFixed(2)} support. RSI: ${indicators.rsi.toFixed(1)}`,
        timestamp: current.timestamp,
      };
    }

    return null;
  }

  calculatePositionSize(capital: number, _strikePrice: number, _marginRequired: number): number {
    // For options selling, calculate based on margin
    const maxRisk = capital * (this.config.maxRiskPercent / 100);
    // Each lot requires specific margin, calculate how many lots you can sell
    return Math.floor(maxRisk / (_marginRequired || 100000)); // Default margin estimate
  }
}

/**
 * THE ONLY THING THAT MATTERS: RISK MANAGEMENT
 * 
 * Without proper risk management, ANY strategy will fail.
 * These are the rules that keep you in the game:
 */
export class RiskManager {
  private config = {
    maxRiskPerTrade: 1, // 1% of capital
    maxDailyLoss: 2, // 2% daily loss limit
    maxDrawdown: 10, // 10% max drawdown before stopping
    maxPositions: 5, // Maximum concurrent positions
    maxPositionSize: 10, // Max 10% in single position
    maxCorrelatedPositions: 2, // Max 2 positions in same sector
    cooldownMinutes: 5, // 5 min between trades on same symbol
  };

  private dailyPnL = 0;
  private peakCapital = 0;
  private currentCapital = 0;
  private openPositions = 0;
  private tradeHistory: Array<{ symbol: string; timestamp: number; pnl: number }> = [];
  private lastTradeTime: Map<string, number> = new Map();

  constructor(initialCapital: number) {
    this.currentCapital = initialCapital;
    this.peakCapital = initialCapital;
  }

  /**
   * CHECK BEFORE EVERY TRADE - This is what separates pros from amateurs
   */
  canTakeTrade(
    entryPrice: number,
    stopLoss: number,
    symbol: string
  ): { allowed: boolean; reason: string; suggestedSize: number } {
    
    // 1. CHECK DAILY LOSS LIMIT
    const dailyLossPercent = (this.dailyPnL / this.currentCapital) * 100;
    if (dailyLossPercent < -this.config.maxDailyLoss) {
      return {
        allowed: false,
        reason: `Daily loss limit hit (${dailyLossPercent.toFixed(2)}% > -${this.config.maxDailyLoss}%)`,
        suggestedSize: 0,
      };
    }

    // 2. CHECK MAX DRAWDOWN
    const drawdown = ((this.peakCapital - this.currentCapital) / this.peakCapital) * 100;
    if (drawdown > this.config.maxDrawdown) {
      return {
        allowed: false,
        reason: `Max drawdown hit (${drawdown.toFixed(2)}% > ${this.config.maxDrawdown}%)`,
        suggestedSize: 0,
      };
    }

    // 3. CHECK MAX POSITIONS
    if (this.openPositions >= this.config.maxPositions) {
      return {
        allowed: false,
        reason: `Max positions reached (${this.openPositions} >= ${this.config.maxPositions})`,
        suggestedSize: 0,
      };
    }

    // 4. CHECK COOLDOWN
    const lastTrade = this.lastTradeTime.get(symbol);
    const cooldownMs = this.config.cooldownMinutes * 60 * 1000;
    if (lastTrade && Date.now() - lastTrade < cooldownMs) {
      return {
        allowed: false,
        reason: `Cooldown active for ${symbol} (${this.config.cooldownMinutes} min)`,
        suggestedSize: 0,
      };
    }

    // 5. CALCULATE POSITION SIZE
    const riskPerShare = Math.abs(entryPrice - stopLoss);
    const riskAmount = this.currentCapital * (this.config.maxRiskPerTrade / 100);
    const maxSharesByRisk = Math.floor(riskAmount / riskPerShare);
    
    // Also check max position size (10% of capital)
    const maxSharesByPosition = Math.floor((this.currentCapital * this.config.maxPositionSize / 100) / entryPrice);
    
    const suggestedSize = Math.min(maxSharesByRisk, maxSharesByPosition);

    if (suggestedSize <= 0) {
      return {
        allowed: false,
        reason: 'Position size too small or capital insufficient',
        suggestedSize: 0,
      };
    }

    return {
      allowed: true,
      reason: 'All checks passed',
      suggestedSize,
    };
  }

  updatePnL(pnl: number, symbol: string) {
    this.dailyPnL += pnl;
    this.currentCapital += pnl;
    if (this.currentCapital > this.peakCapital) {
      this.peakCapital = this.currentCapital;
    }
    this.tradeHistory.push({ symbol, timestamp: Date.now(), pnl });
    this.lastTradeTime.set(symbol, Date.now());
  }

  openPosition() { this.openPositions++; }
  closePosition() { this.openPositions = Math.max(0, this.openPositions - 1); }
  
  resetDailyPnL() { this.dailyPnL = 0; }
  
  getStatus() {
    return {
      dailyPnL: this.dailyPnL,
      dailyPnLPercent: (this.dailyPnL / this.currentCapital) * 100,
      drawdown: ((this.peakCapital - this.currentCapital) / this.peakCapital) * 100,
      openPositions: this.openPositions,
      currentCapital: this.currentCapital,
      peakCapital: this.peakCapital,
      winRate: this.calculateWinRate(),
      profitFactor: this.calculateProfitFactor(),
    };
  }

  private calculateWinRate(): number {
    if (this.tradeHistory.length === 0) return 0;
    const wins = this.tradeHistory.filter(t => t.pnl > 0).length;
    return (wins / this.tradeHistory.length) * 100;
  }

  private calculateProfitFactor(): number {
    const grossProfit = this.tradeHistory.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0);
    const grossLoss = Math.abs(this.tradeHistory.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0));
    return grossLoss === 0 ? grossProfit : grossProfit / grossLoss;
  }
}

/**
 * PERFORMANCE METRICS THAT ACTUALLY MATTER
 * 
 * 1. SHARPE RATIO > 1.5 (Risk-adjusted returns)
 * 2. MAX DRAWDOWN < 10% (Survival)
 * 3. WIN RATE * AVG WIN / (AVG LOSS) > 1.5 (Profit Factor)
 * 4. CALMAR RATIO > 2 (Return/Drawdown)
 */
export function calculateMetrics(trades: Array<{ entryPrice: number; exitPrice: number; size: number; side: 'LONG' | 'SHORT' }>) {
  if (trades.length === 0) return null;

  const pnls = trades.map(t => {
    const multiplier = t.side === 'LONG' ? 1 : -1;
    return (t.exitPrice - t.entryPrice) * t.size * multiplier;
  });

  const wins = pnls.filter(p => p > 0);
  const losses = pnls.filter(p => p < 0);
  const totalPnL = pnls.reduce((a, b) => a + b, 0);

  // Running drawdown
  let peak = 0;
  let maxDrawdown = 0;
  let cumulative = 0;
  
  for (const pnl of pnls) {
    cumulative += pnl;
    if (cumulative > peak) peak = cumulative;
    const drawdown = (peak - cumulative) / (peak || 1);
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }

  return {
    totalTrades: trades.length,
    winRate: (wins.length / trades.length) * 100,
    profitFactor: wins.length > 0 && losses.length > 0
      ? Math.abs(wins.reduce((a, b) => a + b, 0) / losses.reduce((a, b) => a + b, 0))
      : 0,
    avgWin: wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0,
    avgLoss: losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : 0,
    maxDrawdown: maxDrawdown * 100,
    totalPnL,
    expectancy: pnls.reduce((a, b) => a + b, 0) / trades.length,
    sharpeRatio: calculateSharpeRatio(pnls),
    recoveryFactor: maxDrawdown > 0 ? totalPnL / (maxDrawdown * totalPnL) : 0,
  };
}

function calculateSharpeRatio(returns: number[], riskFreeRate = 0): number {
  if (returns.length < 2) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (returns.length - 1);
  const stdDev = Math.sqrt(variance);
  return stdDev === 0 ? 0 : (mean - riskFreeRate) / stdDev;
}
