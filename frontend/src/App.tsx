import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Brain, TrendingUp, FileText, ShieldAlert, FlaskConical,
  ScrollText, Settings, Activity, Wifi, Power, TrendingDown, Clock,
  ArrowUpRight, ArrowDownRight, Minus, Play, Pause,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';

// Simple state management
interface AppState {
  activeSection: string;
  equity: number;
  dailyPnL: number;
  positions: Array<{
    id: string; symbol: string; side: string; size: number; entry: number;
    current: number; pnl: number; pnlPercent: number; sl: number; tp: number; strategy: string;
  }>;
  strategies: Array<{
    id: string; name: string; type: string; enabled: boolean; winRate: number;
    profitFactor: number; sharpe: number; trades: number; todayPnL: number; status: string;
  }>;
  logs: Array<{ time: string; level: string; message: string; }>;
  killSwitch: boolean;
}

// Status Badge
const StatusBadge: React.FC<{ status: string; pulsing?: boolean }> = ({ status, pulsing = false }) => {
  const colors: Record<string, string> = {
    connected: 'bg-emerald-500/20 text-emerald-400',
    running: 'bg-emerald-500/20 text-emerald-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    stopped: 'bg-gray-500/20 text-gray-400',
    error: 'bg-red-500/20 text-red-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.connected}`}>
      {pulsing && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Metric Card
const MetricCard: React.FC<{ title: string; value: string; sub?: string; trend?: string }> = ({ title, value, sub, trend = 'neutral' }) => (
  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
    <p className="text-gray-400 text-sm mb-1">{title}</p>
    <div className="flex items-baseline gap-2">
      <p className="text-2xl font-semibold text-white font-mono">{value}</p>
      {trend === 'up' && <ArrowUpRight className="w-4 h-4 text-emerald-400" />}
      {trend === 'down' && <ArrowDownRight className="w-4 h-4 text-red-400" />}
      {trend === 'neutral' && <Minus className="w-4 h-4 text-gray-400" />}
    </div>
    {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
  </div>
);

// Sidebar
const Sidebar: React.FC<{ active: string; onChange: (s: string) => void }> = ({ active, onChange }) => {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'strategies', label: 'Strategies', icon: Brain },
    { id: 'positions', label: 'Positions', icon: TrendingUp },
    { id: 'orders', label: 'Orders', icon: FileText },
    { id: 'risk', label: 'Risk Management', icon: ShieldAlert },
    { id: 'backtest', label: 'Backtesting', icon: FlaskConical },
    { id: 'logs', label: 'Trade Console', icon: ScrollText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];
  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
            <span className="text-white font-bold text-xs">R</span>
          </div>
          <div>
            <h1 className="font-bold text-white text-sm">RAYR_Quant</h1>
            <p className="text-xs text-gray-500">by @Rayr-06</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => onChange(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active === id ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> System Online
        </div>
      </div>
    </aside>
  );
};

// Header
const Header: React.FC<{ equity: number; dailyPnL: number; killSwitch: boolean; onKillSwitch: () => void; }> = ({ equity, dailyPnL, killSwitch, onKillSwitch }) => (
  <header className="h-16 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-6">
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-gray-400" /> <span className="text-sm text-gray-400">System</span>
        <StatusBadge status={killSwitch ? 'error' : 'connected'} pulsing />
      </div>
      <div className="h-6 w-px bg-gray-700" />
      <div className="flex items-center gap-2">
        <Wifi className="w-4 h-4 text-emerald-400" /> <span className="text-xs text-gray-400">Broker</span>
      </div>
    </div>
    <div className="flex items-center gap-6">
      <div className="text-right">
        <p className="text-xs text-gray-500">Portfolio</p>
        <p className="text-lg font-semibold text-white font-mono">${equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-500">Daily P&L</p>
        <p className={`text-sm font-semibold font-mono ${dailyPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {dailyPnL >= 0 ? '+' : ''}${dailyPnL.toFixed(2)}
        </p>
      </div>
      <button onClick={onKillSwitch}
        className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${killSwitch ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'}`}
      >
        <Power className="w-4 h-4" /> {killSwitch ? 'Resume' : 'Kill Switch'}
      </button>
    </div>
  </header>
);

// Dashboard Section
const DashboardSection: React.FC<AppState> = (state) => {
  const equityCurve = [
    { date: 'Jan', value: 50000 }, { date: 'Feb', value: 55200 }, { date: 'Mar', value: 58900 },
    { date: 'Apr', value: 62100 }, { date: 'May', value: 68200 }, { date: 'Jun', value: 73100 },
    { date: 'Jul', value: 75600 }, { date: 'Aug', value: 84732 },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Dashboard Overview</h2>
        <div className="flex items-center gap-2 text-xs text-gray-500"><Clock className="w-4 h-4" /> Last updated: {new Date().toLocaleTimeString()}</div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <MetricCard title="Portfolio Equity" value={`$${state.equity.toLocaleString()}`} trend="up" />
        <MetricCard title="Daily P&L" value={`${state.dailyPnL >= 0 ? '+' : ''}$${state.dailyPnL.toFixed(2)}`} trend={state.dailyPnL >= 0 ? 'up' : 'down'} />
        <MetricCard title="Win Rate" value="57.8%" sub="Last 30 days" trend="up" />
        <MetricCard title="Sharpe Ratio" value="2.14" sub="Risk-adjusted" trend="up" />
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-4">Equity Curve</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={equityCurve}>
              <defs><linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" /><XAxis dataKey="date" stroke="#6b7280" fontSize={10} /><YAxis stroke="#6b7280" fontSize={10} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Equity']} />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#equityGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-4">Risk Metrics</h3>
          <div className="space-y-4">
            <div><div className="flex justify-between text-xs mb-1"><span className="text-gray-400">Drawdown</span><span className="text-white font-mono">1.07%</span></div><div className="h-2 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-400 rounded-full" style={{ width: '11%' }} /></div><p className="text-xs text-gray-500 mt-1">Max: 10%</p></div>
            <div><div className="flex justify-between text-xs mb-1"><span className="text-gray-400">Daily Loss</span><span className="text-white font-mono">0.51%</span></div><div className="h-2 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-blue-400 rounded-full" style={{ width: '26%' }} /></div><p className="text-xs text-gray-500 mt-1">Limit: 2%</p></div>
            <div><div className="flex justify-between text-xs mb-1"><span className="text-gray-400">Exposure</span><span className="text-white font-mono">23.4%</span></div><div className="h-2 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-purple-400 rounded-full" style={{ width: '47%' }} /></div><p className="text-xs text-gray-500 mt-1">Max: 50%</p></div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-4">Active Positions</h3>
          <div className="space-y-2">
            {state.positions.slice(0, 4).map((pos) => (
              <div key={pos.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pos.side === 'long' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {pos.side === 'long' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div><p className="text-sm font-medium text-white">{pos.symbol}</p><p className="text-xs text-gray-500">{pos.strategy}</p></div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-mono ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-4">Active Strategies</h3>
          <div className="space-y-2">
            {state.strategies.filter(s => s.enabled).map((strat) => (
              <div key={strat.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <div><p className="text-sm font-medium text-white">{strat.name}</p><p className="text-xs text-gray-500">Win: {strat.winRate}% | PF: {strat.profitFactor}</p></div>
                <div className="text-right">
                  <p className={`text-sm font-mono ${strat.todayPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{strat.todayPnL >= 0 ? '+' : ''}${strat.todayPnL.toFixed(2)}</p>
                  <StatusBadge status="running" pulsing />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Strategies Section
const StrategiesSection: React.FC<{ strategies: AppState['strategies']; onToggle: (id: string) => void; }> = ({ strategies, onToggle }) => {
  const typeColors: Record<string, string> = { momentum: 'bg-blue-500/20 text-blue-400', mean_reversion: 'bg-purple-500/20 text-purple-400', breakout: 'bg-amber-500/20 text-amber-400', scalping: 'bg-cyan-500/20 text-cyan-400', sentiment: 'bg-pink-500/20 text-pink-400' };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Trading Strategies</h2>
        <button className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30">+ Add Strategy</button>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {strategies.map((strat) => (
          <div key={strat.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-5 hover:border-gray-600 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[strat.type] || 'bg-gray-700 text-gray-400'}`}><Brain className="w-5 h-5" /></div>
                <div><h3 className="text-sm font-medium text-white">{strat.name}</h3><span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[strat.type]}`}>{strat.type.replace('_', ' ')}</span></div>
              </div>
              <button onClick={() => onToggle(strat.id)} className={`relative w-11 h-6 rounded-full transition-colors ${strat.enabled ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${strat.enabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center"><p className="text-xs text-gray-500">Win Rate</p><p className="text-sm font-mono text-emerald-400">{strat.winRate}%</p></div>
              <div className="text-center"><p className="text-xs text-gray-500">Profit Factor</p><p className="text-sm font-mono text-white">{strat.profitFactor}</p></div>
              <div className="text-center"><p className="text-xs text-gray-500">Sharpe</p><p className="text-sm font-mono text-purple-400">{strat.sharpe}</p></div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-700"><span className="text-xs text-gray-500">{strat.trades} trades</span><StatusBadge status={strat.status} /></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Positions Section
const PositionsSection: React.FC<{ positions: AppState['positions']; onClose: (id: string) => void; }> = ({ positions, onClose }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-white">Open Positions</h2>
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead><tr className="border-b border-gray-700">{['Symbol', 'Side', 'Size', 'Entry', 'Current', 'P&L', 'SL', 'TP', 'Action'].map(h => (<th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-400">{h}</th>))}</tr></thead>
        <tbody>
          {positions.map((pos) => (
            <tr key={pos.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
              <td className="px-4 py-3"><p className="text-sm font-medium text-white">{pos.symbol}</p><p className="text-xs text-gray-500">{pos.strategy}</p></td>
              <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${pos.side === 'long' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{pos.side.toUpperCase()}</span></td>
              <td className="px-4 py-3 text-sm font-mono text-white">{pos.size}</td>
              <td className="px-4 py-3 text-sm font-mono text-white">${pos.entry.toLocaleString()}</td>
              <td className="px-4 py-3 text-sm font-mono text-white">${pos.current.toLocaleString()}</td>
              <td className="px-4 py-3"><p className={`text-sm font-mono ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}</p></td>
              <td className="px-4 py-3 text-sm font-mono text-red-400">${pos.sl.toLocaleString()}</td>
              <td className="px-4 py-3 text-sm font-mono text-emerald-400">${pos.tp.toLocaleString()}</td>
              <td className="px-4 py-3"><button onClick={() => onClose(pos.id)} className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30">Close</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Risk Section
const RiskSection: React.FC = () => {
  const correlationData = [ { asset: 'BTC', values: [1, 0.45, 0.32, 0.28] }, { asset: 'ETH', values: [0.45, 1, 0.52, 0.38] }, { asset: 'SOL', values: [0.32, 0.52, 1, 0.41] }, { asset: 'NVDA', values: [0.28, 0.38, 0.41, 1] }, ];
  const assets = ['BTC', 'ETH', 'SOL', 'NVDA'];
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Risk Management</h2>
      <div className="grid grid-cols-4 gap-4">
        <MetricCard title="Max Drawdown" value="1.07%" sub="Limit: 10%" trend="up" />
        <MetricCard title="Daily Loss" value="0.51%" sub="Limit: 2%" trend="up" />
        <MetricCard title="Correlation" value="0.34" sub="Avg between positions" />
        <MetricCard title="Exposure" value="23.4%" sub="Max: 50%" />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-4">Correlation Matrix</h3>
          <div className="space-y-2">
            <div className="flex gap-2 text-xs text-gray-500 pl-12">{assets.map(a => <div key={a} className="w-16 text-center">{a}</div>)}</div>
            {correlationData.map(row => (<div key={row.asset} className="flex gap-2 items-center"><div className="w-10 text-xs text-gray-500 text-right">{row.asset}</div>{row.values.map((val, j) => (<div key={j} className={`w-16 h-8 rounded flex items-center justify-center text-xs font-mono text-white ${val > 0.5 ? 'bg-red-500' : val > 0.3 ? 'bg-yellow-500' : 'bg-emerald-500'}`} style={{ opacity: 0.3 + Math.abs(val) * 0.7 }}>{val.toFixed(2)}</div>))}</div>))}
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-4">Drawdown History</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={[{ month: 'Jan', value: -2.1 }, { month: 'Feb', value: -5.3 }, { month: 'Mar', value: -3.8 }, { month: 'Apr', value: -1.2 }, { month: 'May', value: -4.5 }, { month: 'Jun', value: -8.4 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" /><XAxis dataKey="month" stroke="#6b7280" fontSize={10} /><YAxis stroke="#6b7280" fontSize={10} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} formatter={(value) => [`${Number(value)}%`, 'Drawdown']} />
              <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} fill="rgba(239,68,68,0.2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Backtest Section
const BacktestSection: React.FC = () => {
  const [running, setRunning] = useState(false);
  const monthlyReturns = [{ month: 'Jan', return: 8.2 }, { month: 'Feb', return: 5.4 }, { month: 'Mar', return: -2.1 }, { month: 'Apr', return: 12.3 }, { month: 'May', return: 3.8 }, { month: 'Jun', return: -4.2 }];
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Backtesting Engine</h2>
      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1 bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-medium text-white">Configuration</h3>
          <div><label className="text-xs text-gray-400 mb-1 block">Strategy</label><select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white"><option>Momentum Intraday</option><option>Mean Reversion</option><option>Breakout Scanner</option></select></div>
          <div><label className="text-xs text-gray-400 mb-1 block">Date Range</label><select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white"><option>Last 12 months</option><option>Last 6 months</option></select></div>
          <button onClick={() => setRunning(!running)} className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${running ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
            {running ? <><Pause className="w-4 h-4" /> Stop</> : <><Play className="w-4 h-4" /> Run</>}
          </button>
        </div>
        <div className="col-span-3 space-y-4">
          <div className="grid grid-cols-6 gap-4">
            {[{ label: 'Return', value: '+69.46%', color: 'text-emerald-400' }, { label: 'Sharpe', value: '2.14', color: 'text-emerald-400' }, { label: 'Max DD', value: '-8.42%', color: 'text-red-400' }, { label: 'Win Rate', value: '57.8%', color: 'text-emerald-400' }, { label: 'Profit Factor', value: '1.87', color: 'text-emerald-400' }, { label: 'Trades', value: '847', color: 'text-white' }].map(m => (
              <div key={m.label} className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-center"><p className="text-xs text-gray-500 mb-1">{m.label}</p><p className={`text-lg font-semibold font-mono ${m.color}`}>{m.value}</p></div>
            ))}
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-4">Monthly Returns</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyReturns}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" /><XAxis dataKey="month" stroke="#6b7280" fontSize={10} /><YAxis stroke="#6b7280" fontSize={10} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} formatter={(value) => [`${Number(value)}%`, 'Return']} />
                <Bar dataKey="return" radius={[4, 4, 0, 0]}>{monthlyReturns.map((entry, index) => (<Cell key={index} fill={entry.return >= 0 ? '#10b981' : '#ef4444'} />))}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// Logs Section
const LogsSection: React.FC<{ logs: AppState['logs'] }> = ({ logs }) => {
  const [filter, setFilter] = useState('all');
  const levelColors: Record<string, string> = { info: 'text-blue-400', warn: 'text-yellow-400', error: 'text-red-400', trade: 'text-emerald-400' };
  const filtered = filter === 'all' ? logs : logs.filter(l => l.level === filter);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Trade Console</h2>
        <div className="flex gap-2">{['all', 'trade', 'info', 'warn', 'error'].map(level => (<button key={level} onClick={() => setFilter(level)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === level ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}>{level.toUpperCase()}</button>))}</div>
      </div>
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 h-[500px] overflow-y-auto font-mono text-sm">
        {filtered.map((log, i) => (<div key={i} className="flex gap-4 py-2 border-b border-gray-800 px-2"><span className="text-gray-500 shrink-0">{log.time}</span><span className={`shrink-0 ${levelColors[log.level]}`}>[{log.level.toUpperCase()}]</span><span className="text-gray-300">{log.message}</span></div>))}
      </div>
    </div>
  );
};

// Settings Section
const SettingsSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Settings</h2>
      
      {/* DEMO MODE BANNER */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-6 text-center">
        <h3 className="text-lg font-bold text-emerald-400 mb-2">🚀 LIVE DEMO MODE ACTIVE</h3>
        <p className="text-sm text-gray-300">
          Your app is currently connected to the <strong>Binance Public API</strong>. 
          All market prices and trading signals are 100% REAL-TIME. 
          The wallet uses virtual funds (\$10,000) so you can test safely without API keys!
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-medium text-white">Broker Configuration</h3>
          <p className="text-xs text-gray-400">No API keys are required for Demo Mode. The engine automatically reads live market data for free.</p>
          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-gray-300">Connected to Binance Public Data</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-medium text-white">Risk Parameters</h3>
          <p className="text-xs text-gray-400 mb-4">In Demo Mode, the bot automatically risks 1% of the virtual \$10k per trade.</p>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Starting Virtual Balance</label>
            <input type="text" value="$10,000.00" disabled className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
};


// Placeholder sections
const OrdersSection = () => (<div className="space-y-6"><h2 className="text-xl font-semibold text-white">Orders</h2><div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center"><FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" /><p className="text-gray-400">No pending orders</p></div></div>);

// DEFAULT FALLBACK DATA (Used if Python backend is offline)
const fallbackPositions = [
  { id: '1', symbol: 'BTC/USD', side: 'long', size: 0.25, entry: 41500, current: 42150, pnl: 162.61, pnlPercent: 1.57, sl: 40000, tp: 45000, strategy: 'Momentum' },
  { id: '2', symbol: 'ETH/USD', side: 'long', size: 2.5, entry: 2280, current: 2295, pnl: 37.50, pnlPercent: 0.66, sl: 2150, tp: 2500, strategy: 'Mean Reversion' },
];
const fallbackLogs = [
  { time: '14:32:00', level: 'warn', message: 'Backend engine offline. Showing mock data.' },
];

// MAIN APP
const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [equity, setEquity] = useState(84732.45);
  const [dailyPnL, setDailyPnL] = useState(1247.83);
  const [killSwitch, setKillSwitch] = useState(false);
  
  // Changed from read-only to include setters so the API can update them
  const [positions, setPositions] = useState(fallbackPositions);
  const [logs, setLogs] = useState(fallbackLogs);
  
  const [strategies, setStrategies] = useState([
    { id: '1', name: 'Momentum Intraday', type: 'momentum', enabled: true, winRate: 62.3, profitFactor: 1.87, sharpe: 2.14, trades: 847, todayPnL: 892.50, status: 'running' },
    { id: '2', name: 'Mean Reversion', type: 'mean_reversion', enabled: true, winRate: 58.7, profitFactor: 1.65, sharpe: 1.89, trades: 523, todayPnL: 445.20, status: 'running' },
    { id: '3', name: 'Breakout Scanner', type: 'breakout', enabled: true, winRate: 54.2, profitFactor: 1.42, sharpe: 1.56, trades: 312, todayPnL: -120, status: 'running' },
    { id: '4', name: 'Scalping Engine', type: 'scalping', enabled: false, winRate: 51.2, profitFactor: 1.08, sharpe: 0.92, trades: 2341, todayPnL: 0, status: 'stopped' },
    { id: '5', name: 'Sentiment Driver', type: 'sentiment', enabled: true, winRate: 55.8, profitFactor: 1.35, sharpe: 1.24, trades: 156, todayPnL: 30.13, status: 'running' },
  ]);

  // ==========================================
  // 🔥 NEW REAL DATA FETCH USE EFFECT 🔥
  // ==========================================
  useEffect(() => {
    const fetchEngineData = async () => {
      if (killSwitch) return; // Don't fetch if killed
      
      try {
        const response = await fetch('http://localhost:8000/api/dashboard');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        // Update state with real Python backend data
        setEquity(data.equity);
        setDailyPnL(data.dailyPnL);
        
        // Map backend positions safely so the UI doesn't crash if keys are missing
        setPositions(data.positions.map((p: any) => ({
          id: p.id || '1',
          symbol: p.symbol || 'N/A',
          side: p.side || 'flat',
          size: p.size || 0,
          entry: p.entry || 0,
          current: p.current || 0,
          pnl: p.pnl || 0,
          pnlPercent: p.pnlPercent || 0,
          sl: p.sl || 0,
          tp: p.tp || 0,
          strategy: p.strategy || 'Engine'
        })));
        
        setLogs(data.logs.reverse()); // Reverse so newest are at the top
      } catch (error) {
        console.error("RAYR Engine offline. Using fallback mock data.", error);
        // If the backend is off, load the mock data so the UI isn't empty
        setPositions(fallbackPositions);
        setLogs(fallbackLogs);
      }
    };

    fetchEngineData(); // Fetch immediately on load
    const interval = setInterval(fetchEngineData, 3000); // Then poll every 3 seconds

    return () => clearInterval(interval);
  }, [killSwitch]);

  const toggleStrategy = (id: string) => {
    setStrategies(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled, status: !s.enabled ? 'running' : 'stopped' } : s ));
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <DashboardSection {...{ activeSection, equity, dailyPnL, positions, strategies, logs, killSwitch }} />;
      case 'strategies': return <StrategiesSection strategies={strategies} onToggle={toggleStrategy} />;
      case 'positions': return <PositionsSection positions={positions} onClose={(id) => console.log('Close', id)} />;
      case 'orders': return <OrdersSection />;
      case 'risk': return <RiskSection />;
      case 'backtest': return <BacktestSection />;
      case 'logs': return <LogsSection logs={logs} />;
      case 'settings': return <SettingsSection />;
      default: return <DashboardSection {...{ activeSection, equity, dailyPnL, positions, strategies, logs, killSwitch }} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex font-sans">
      <Sidebar active={activeSection} onChange={setActiveSection} />
      <div className="flex-1 flex flex-col">
        <Header equity={equity} dailyPnL={dailyPnL} killSwitch={killSwitch} onKillSwitch={() => setKillSwitch(!killSwitch)} />
        <main className="flex-1 p-6 overflow-auto">{renderSection()}</main>
        <footer className="h-10 bg-gray-900 border-t border-gray-700 flex items-center justify-between px-6 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${killSwitch ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'}`} /> 
              {killSwitch ? 'Engine Paused' : 'All Systems Operational'}
            </div>
            <span>© 2024 RAYR_Quant | github.com/Rayr-06</span>
          </div>
          <div className="flex items-center gap-2"><span>RAYR_Quant v1.0.0</span><span className="text-emerald-400">⚡</span></div>
        </footer>
      </div>
    </div>
  );
};

export default App;

