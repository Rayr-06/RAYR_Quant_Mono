// Types for the Trading System
export interface Portfolio {
  equity: number;
  cash: number;
  buyingPower: number;
  dailyPnL: number;
  dailyPnLPercent: number;
  totalPnL: number;
  totalPnLPercent: number;
  highWaterMark: number;
  currentDrawdown: number;
  maxDrawdown: number;
}

export interface Strategy {
  id: string;
  name: string;
  type: 'momentum' | 'mean_reversion' | 'breakout' | 'scalping' | 'sentiment';
  enabled: boolean;
  parameters: Record<string, number | string | boolean>;
  performance: StrategyPerformance;
  status: 'running' | 'stopped' | 'error';
  lastSignal: string | null;
  signalCount: number;
  todayPnL: number;
}

export interface StrategyPerformance {
  winRate: number;
  profitFactor: number;
  sharpeRatio: number;
  totalTrades: number;
  winningTrades: number;
  avgWin: number;
  avgLoss: number;
  maxDrawdown: number;
}

export interface Position {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  stopLoss: number;
  takeProfit: number;
  openTime: string;
  age: string;
  strategy: string;
}

export interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop';
  status: 'pending' | 'filled' | 'cancelled' | 'rejected';
  quantity: number;
  price: number | null;
  filledPrice: number | null;
  createdAt: string;
  filledAt: string | null;
}

export interface RiskMetrics {
  maxDrawdownLimit: number;
  currentDrawdown: number;
  dailyLossLimit: number;
  dailyLossUsed: number;
  positionCorrelation: number;
  totalExposure: number;
  maxExposure: number;
  leverage: number;
  var95: number; // Value at Risk 95%
}

export interface ConnectionStatus {
  broker: 'connected' | 'disconnected' | 'error';
  dataFeed: 'connected' | 'disconnected' | 'error';
  tradingView: 'connected' | 'disconnected' | 'error';
  lastUpdate: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'trade';
  source: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface Signal {
  id: string;
  symbol: string;
  action: 'long' | 'short' | 'close';
  strategy: string;
  confidence: number;
  timestamp: string;
  price: number;
  indicators?: Record<string, number>;
}

export interface BacktestResult {
  id: string;
  strategyId: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  totalReturnPercent: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  equityCurve: { date: string; value: number }[];
}

export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}
