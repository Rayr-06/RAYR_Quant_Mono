import { create } from 'zustand';
import type { Portfolio, Strategy, Position, Order, RiskMetrics, ConnectionStatus, LogEntry, SystemAlert } from './types';

// Generate realistic mock data
const generateMockPortfolio = (): Portfolio => ({
  equity: 84732.45,
  cash: 62150.00,
  buyingPower: 124300.00,
  dailyPnL: 1247.83,
  dailyPnLPercent: 1.49,
  totalPnL: 34732.45,
  totalPnLPercent: 69.46,
  highWaterMark: 85650.00,
  currentDrawdown: 1.07,
  maxDrawdown: 8.42,
});

const generateMockStrategies = (): Strategy[] => [
  {
    id: 'strat-1',
    name: 'Momentum Intraday',
    type: 'momentum',
    enabled: true,
    parameters: { rsiPeriod: 14, macdFast: 12, macdSlow: 26, threshold: 30 },
    performance: { winRate: 62.3, profitFactor: 1.87, sharpeRatio: 2.14, totalTrades: 847, winningTrades: 528, avgWin: 340, avgLoss: 180, maxDrawdown: 4.2 },
    status: 'running',
    lastSignal: '2024-01-15T14:32:00Z',
    signalCount: 12,
    todayPnL: 892.50,
  },
  {
    id: 'strat-2',
    name: 'Mean Reversion',
    type: 'mean_reversion',
    enabled: true,
    parameters: { bbPeriod: 20, bbStd: 2, vwapThreshold: 0.02 },
    performance: { winRate: 58.7, profitFactor: 1.65, sharpeRatio: 1.89, totalTrades: 523, winningTrades: 307, avgWin: 220, avgLoss: 165, maxDrawdown: 6.1 },
    status: 'running',
    lastSignal: '2024-01-15T14:28:00Z',
    signalCount: 8,
    todayPnL: 445.20,
  },
  {
    id: 'strat-3',
    name: 'Breakout Scanner',
    type: 'breakout',
    enabled: true,
    parameters: { lookbackPeriod: 50, volumeSpike: 2.5, atrMultiplier: 2.0 },
    performance: { winRate: 54.2, profitFactor: 1.42, sharpeRatio: 1.56, totalTrades: 312, winningTrades: 169, avgWin: 480, avgLoss: 290, maxDrawdown: 7.8 },
    status: 'running',
    lastSignal: '2024-01-15T13:45:00Z',
    signalCount: 3,
    todayPnL: -120.00,
  },
  {
    id: 'strat-4',
    name: 'Scalping Engine',
    type: 'scalping',
    enabled: false,
    parameters: { level2Depth: 5, spreadThreshold: 0.0005, maxPosition: 0.05 },
    performance: { winRate: 51.2, profitFactor: 1.08, sharpeRatio: 0.92, totalTrades: 2341, winningTrades: 1199, avgWin: 25, avgLoss: 23, maxDrawdown: 3.2 },
    status: 'stopped',
    lastSignal: null,
    signalCount: 0,
    todayPnL: 0,
  },
  {
    id: 'strat-5',
    name: 'Sentiment Driver',
    type: 'sentiment',
    enabled: true,
    parameters: { newsWeight: 0.7, socialWeight: 0.3, sentimentThreshold: 0.65 },
    performance: { winRate: 55.8, profitFactor: 1.35, sharpeRatio: 1.24, totalTrades: 156, winningTrades: 87, avgWin: 520, avgLoss: 340, maxDrawdown: 9.4 },
    status: 'running',
    lastSignal: '2024-01-15T12:15:00Z',
    signalCount: 2,
    todayPnL: 30.13,
  },
];

const generateMockPositions = (): Position[] => [
  { id: 'pos-1', symbol: 'BTC/USD', side: 'long', size: 0.25, entryPrice: 41500, currentPrice: 42150.45, pnl: 162.61, pnlPercent: 1.57, stopLoss: 40000, takeProfit: 45000, openTime: '2024-01-15T09:30:00Z', age: '5h 02m', strategy: 'Momentum Intraday' },
  { id: 'pos-2', symbol: 'ETH/USD', side: 'long', size: 2.5, entryPrice: 2280, currentPrice: 2295.30, pnl: 38.25, pnlPercent: 0.67, stopLoss: 2150, takeProfit: 2500, openTime: '2024-01-15T10:15:00Z', age: '4h 17m', strategy: 'Mean Reversion' },
  { id: 'pos-3', symbol: 'SOL/USD', side: 'short', size: 50, entryPrice: 98.50, currentPrice: 97.20, pnl: 65.00, pnlPercent: 1.32, stopLoss: 102.00, takeProfit: 90.00, openTime: '2024-01-15T11:00:00Z', age: '3h 32m', strategy: 'Breakout Scanner' },
  { id: 'pos-4', symbol: 'NVDA/USDT', side: 'long', size: 15, entryPrice: 542.00, currentPrice: 548.75, pnl: 101.25, pnlPercent: 1.24, stopLoss: 520.00, takeProfit: 600.00, openTime: '2024-01-15T13:45:00Z', age: '0h 47m', strategy: 'Sentiment Driver' },
  { id: 'pos-5', symbol: 'TSLA/USDT', side: 'short', size: 20, entryPrice: 238.50, currentPrice: 241.20, pnl: -54.00, pnlPercent: -1.13, stopLoss: 245.00, takeProfit: 220.00, openTime: '2024-01-15T14:00:00Z', age: '0h 32m', strategy: 'Momentum Intraday' },
];

const generateMockOrders = (): Order[] => [
  { id: 'ord-1', symbol: 'AVAX/USD', side: 'buy', type: 'limit', status: 'pending', quantity: 25, price: 35.50, filledPrice: null, createdAt: '2024-01-15T14:20:00Z', filledAt: null },
  { id: 'ord-2', symbol: 'DOGE/USD', side: 'sell', type: 'stop', status: 'pending', quantity: 5000, price: 0.082, filledPrice: null, createdAt: '2024-01-15T14:18:00Z', filledAt: null },
  { id: 'ord-3', symbol: 'LINK/USD', side: 'buy', type: 'market', status: 'filled', quantity: 40, price: null, filledPrice: 14.82, createdAt: '2024-01-15T13:45:00Z', filledAt: '2024-01-15T13:45:02Z' },
  { id: 'ord-4', symbol: 'MATIC/USD', side: 'sell', type: 'limit', status: 'filled', quantity: 500, price: 0.78, filledPrice: 0.78, createdAt: '2024-01-15T12:30:00Z', filledAt: '2024-01-15T12:35:22Z' },
  { id: 'ord-5', symbol: 'DOT/USD', side: 'buy', type: 'market', status: 'cancelled', quantity: 30, price: null, filledPrice: null, createdAt: '2024-01-15T11:00:00Z', filledAt: null },
];

const generateMockRiskMetrics = (): RiskMetrics => ({
  maxDrawdownLimit: 10,
  currentDrawdown: 1.07,
  dailyLossLimit: 2,
  dailyLossUsed: 0.51,
  positionCorrelation: 0.34,
  totalExposure: 23.4,
  maxExposure: 50,
  leverage: 1.0,
  var95: 1842.50,
});

const generateMockConnectionStatus = (): ConnectionStatus => ({
  broker: 'connected',
  dataFeed: 'connected',
  tradingView: 'connected',
  lastUpdate: new Date().toISOString(),
});

const generateMockLogs = (): LogEntry[] => [
  { id: 'log-1', timestamp: '2024-01-15T14:32:00Z', level: 'trade', source: 'Momentum Intraday', message: 'LONG signal detected for BTC/USD at $42,150.45' },
  { id: 'log-2', timestamp: '2024-01-15T14:32:01Z', level: 'info', source: 'Risk Engine', message: 'Risk check passed. Position size: 0.25 BTC' },
  { id: 'log-3', timestamp: '2024-01-15T14:32:02Z', level: 'trade', source: 'Execution', message: 'BUY order filled for 0.25 BTC/USD @ $42,150.45' },
  { id: 'log-4', timestamp: '2024-01-15T14:28:00Z', level: 'trade', source: 'Mean Reversion', message: 'LONG signal for ETH/USD. RSI: 38, BB Lower: $2,270' },
  { id: 'log-5', timestamp: '2024-01-15T14:28:01Z', level: 'warn', source: 'Risk Engine', message: 'High correlation detected with existing ETH position' },
  { id: 'log-6', timestamp: '2024-01-15T14:28:02Z', level: 'info', source: 'Risk Engine', message: 'Proceeding with reduced position size: 2.0 ETH' },
  { id: 'log-7', timestamp: '2024-01-15T13:45:00Z', level: 'trade', source: 'Breakout Scanner', message: 'SHORT signal for SOL/USD. Breakout below $97.50' },
  { id: 'log-8', timestamp: '2024-01-15T13:45:01Z', level: 'info', source: 'Risk Engine', message: 'Risk check passed. Stop loss set at $102.00' },
  { id: 'log-9', timestamp: '2024-01-15T13:00:00Z', level: 'info', source: 'System', message: 'Scheduled rebalance completed for portfolio' },
  { id: 'log-10', timestamp: '2024-01-15T12:30:00Z', level: 'warn', source: 'Data Feed', message: 'Temporary latency spike detected: 245ms' },
];

const generateMockAlerts = (): SystemAlert[] => [
  { id: 'alert-1', type: 'info', title: 'Strategy Milestone', message: 'Momentum Intraday reached 500+ winning trades', timestamp: '2024-01-15T12:00:00Z', acknowledged: true },
  { id: 'alert-2', type: 'warning', title: 'High Correlation', message: 'Correlation between BTC and ETH positions exceeds 0.6', timestamp: '2024-01-15T10:30:00Z', acknowledged: false },
  { id: 'alert-3', type: 'info', title: 'Daily Target', message: 'Daily profit target of 1% reached', timestamp: '2024-01-15T14:15:00Z', acknowledged: false },
];

interface TradingState {
  portfolio: Portfolio;
  strategies: Strategy[];
  positions: Position[];
  orders: Order[];
  riskMetrics: RiskMetrics;
  connectionStatus: ConnectionStatus;
  logs: LogEntry[];
  alerts: SystemAlert[];
  killSwitchActive: boolean;
  activeSection: string;
  
  // Actions
  setActiveSection: (section: string) => void;
  toggleStrategy: (strategyId: string) => void;
  updatePortfolio: () => void;
  addLog: (log: Omit<LogEntry, 'id'>) => void;
  toggleKillSwitch: () => void;
  closePosition: (positionId: string) => void;
  acknowledgeAlert: (alertId: string) => void;
}

export const useTradingStore = create<TradingState>((set) => ({
  portfolio: generateMockPortfolio(),
  strategies: generateMockStrategies(),
  positions: generateMockPositions(),
  orders: generateMockOrders(),
  riskMetrics: generateMockRiskMetrics(),
  connectionStatus: generateMockConnectionStatus(),
  logs: generateMockLogs(),
  alerts: generateMockAlerts(),
  killSwitchActive: false,
  activeSection: 'dashboard',
  
  setActiveSection: (section) => set({ activeSection: section }),
  
  toggleStrategy: (strategyId) => set((state) => ({
    strategies: state.strategies.map((s) =>
      s.id === strategyId ? { ...s, enabled: !s.enabled, status: !s.enabled ? 'running' : 'stopped' } : s
    ),
  })),
  
  updatePortfolio: () => set((state) => {
    const newPortfolio = { ...state.portfolio };
    const priceChange = (Math.random() - 0.5) * 0.02;
    newPortfolio.equity *= (1 + priceChange);
    newPortfolio.dailyPnL = newPortfolio.equity * (priceChange + 0.0149);
    newPortfolio.dailyPnLPercent = (priceChange + 0.0149) * 100;
    
    const positions = state.positions.map((pos) => {
      const currentPriceChange = (Math.random() - 0.5) * 0.01;
      const newPrice = pos.currentPrice * (1 + currentPriceChange);
      const newPnl = (newPrice - pos.entryPrice) * pos.size * (pos.side === 'short' ? -1 : 1);
      return { ...pos, currentPrice: newPrice, pnl: newPnl, pnlPercent: (newPnl / (pos.entryPrice * pos.size)) * 100 };
    });
    
    return { portfolio: newPortfolio, positions };
  }),
  
  addLog: (log) => set((state) => ({
    logs: [{ ...log, id: `log-${Date.now()}` }, ...state.logs].slice(0, 100),
  })),
  
  toggleKillSwitch: () => set((state) => {
    const newState = !state.killSwitchActive;
    return {
      killSwitchActive: newState,
      logs: [{
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: newState ? 'error' : 'info',
        source: 'System',
        message: newState ? 'KILL SWITCH ACTIVATED - All trading halted' : 'Kill switch deactivated - Trading resumed',
      }, ...state.logs],
    };
  }),
  
  closePosition: (positionId) => set((state) => ({
    positions: state.positions.filter((p) => p.id !== positionId),
  })),
  
  acknowledgeAlert: (alertId) => set((state) => ({
    alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)),
  })),
}));
