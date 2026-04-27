import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Brain, TrendingUp, FileText, ShieldAlert, FlaskConical,
  ScrollText, Settings, Activity, Wifi, WifiOff, Power, TrendingDown, Clock,
  ArrowUpRight, ArrowDownRight, Minus, AlertTriangle,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';

// ── Types ──────────────────────────────────────────────────────

interface Position {
  id: string; symbol: string; side: string; size: number; entry: number;
  current: number; pnl: number; pnlPercent: number; sl: number; tp: number; strategy: string;
}

interface LogEntry { time: string; level: string; message: string; }

interface Stats {
  winRate: number; totalTrades: number; profitFactor: number;
  totalPnL: number; avgWinPct: number; avgLossPct: number;
}

interface RiskStatus {
  drawdownPct: number; dailyLossPct: number;
  openPositions: number; maxPositions: number;
  maxDrawdownPct: number; maxDailyLossPct: number;
  dailyLimitBreached: boolean; drawdownBreached: boolean;
}

interface AppState {
  equity: number;
  dailyPnL: number;
  positions: Position[];
  logs: LogEntry[];
  killSwitch: boolean;
  stats: Stats;
  risk: RiskStatus;
  isLive: boolean;
  backendOnline: boolean;
}

// ── Components ─────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: string; pulsing?: boolean }> = ({ status, pulsing = false }) => {
  const colors: Record<string, string> = {
    connected: 'bg-emerald-500/20 text-emerald-400',
    running:   'bg-emerald-500/20 text-emerald-400',
    pending:   'bg-yellow-500/20 text-yellow-400',
    stopped:   'bg-gray-500/20 text-gray-400',
    error:     'bg-red-500/20 text-red-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.connected}`}>
      {pulsing && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const MetricCard: React.FC<{ title: string; value: string; sub?: string; trend?: 'up' | 'down' | 'neutral' }> =
  ({ title, value, sub, trend = 'neutral' }) => (
  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
    <p className="text-gray-400 text-sm mb-1">{title}</p>
    <div className="flex items-baseline gap-2">
      <p className="text-2xl font-semibold text-white font-mono">{value}</p>
      {trend === 'up'      && <ArrowUpRight   className="w-4 h-4 text-emerald-400" />}
      {trend === 'down'    && <ArrowDownRight  className="w-4 h-4 text-red-400" />}
      {trend === 'neutral' && <Minus           className="w-4 h-4 text-gray-400" />}
    </div>
    {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
  </div>
);

const RiskBar: React.FC<{ label: string; value: number; max: number; breached?: boolean }> =
  ({ label, value, max, breached }) => {
  const pct = Math.min(Math.abs(value) / max * 100, 100);
  const color = breached ? 'bg-red-500' : pct > 70 ? 'bg-yellow-400' : 'bg-emerald-400';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className={`font-mono ${breached ? 'text-red-400' : 'text-white'}`}>
          {value.toFixed(2)}% / {max}%
        </span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// ── Sidebar ────────────────────────────────────────────────────

const Sidebar: React.FC<{ active: string; onChange: (s: string) => void }> = ({ active, onChange }) => {
  const items = [
    { id: 'dashboard', label: 'Dashboard',       icon: LayoutDashboard },
    { id: 'positions', label: 'Positions',        icon: TrendingUp      },
    { id: 'risk',      label: 'Risk Management',  icon: ShieldAlert      },
    { id: 'logs',      label: 'Trade Console',    icon: ScrollText       },
    { id: 'settings',  label: 'Settings',         icon: Settings         },
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
            <p className="text-xs text-gray-500">v2.0 by @Rayr-06</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => onChange(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
              ${active === id ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
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

// ── Header ─────────────────────────────────────────────────────

const Header: React.FC<{
  equity: number; dailyPnL: number; killSwitch: boolean;
  backendOnline: boolean; isLive: boolean;
  onKillSwitch: () => void;
}> = ({ equity, dailyPnL, killSwitch, backendOnline, isLive, onKillSwitch }) => (
  <header className="h-16 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-6">
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-400">Engine</span>
        <StatusBadge status={killSwitch ? 'error' : backendOnline ? 'connected' : 'error'} pulsing />
      </div>
      <div className="h-6 w-px bg-gray-700" />
      <div className="flex items-center gap-2">
        {backendOnline
          ? <Wifi    className="w-4 h-4 text-emerald-400" />
          : <WifiOff className="w-4 h-4 text-red-400" />}
        <span className="text-xs text-gray-400">{isLive ? 'Live Trading' : 'Paper Trading'}</span>
      </div>
    </div>
    <div className="flex items-center gap-6">
      <div className="text-right">
        <p className="text-xs text-gray-500">Portfolio</p>
        <p className="text-lg font-semibold text-white font-mono">
          ${equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-500">Daily P&L</p>
        <p className={`text-sm font-semibold font-mono ${dailyPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {dailyPnL >= 0 ? '+' : ''}${dailyPnL.toFixed(2)}
        </p>
      </div>
      <button onClick={onKillSwitch}
        className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all
          ${killSwitch
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'}`}
      >
        <Power className="w-4 h-4" /> {killSwitch ? 'Resume' : 'Kill Switch'}
      </button>
    </div>
  </header>
);

// ── Dashboard ──────────────────────────────────────────────────

const DashboardSection: React.FC<AppState> = (state) => {
  const { equity, dailyPnL, positions, logs, stats, risk } = state;
  const roi = ((equity - 10000) / 10000) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Dashboard</h2>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-4 h-4" /> {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Warnings */}
      {risk.dailyLimitBreached && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">Daily loss limit reached ({risk.dailyLossPct.toFixed(1)}%). No new entries until tomorrow.</p>
        </div>
      )}
      {risk.drawdownBreached && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">Max drawdown limit reached ({risk.drawdownPct.toFixed(1)}%). Engine paused.</p>
        </div>
      )}

      {/* Metric cards — REAL data from backend */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Portfolio Equity"
          value={`$${equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          trend={equity >= 10000 ? 'up' : 'down'}
        />
        <MetricCard
          title="Daily P&L"
          value={`${dailyPnL >= 0 ? '+' : ''}$${dailyPnL.toFixed(2)}`}
          trend={dailyPnL >= 0 ? 'up' : 'down'}
        />
        <MetricCard
          title="Total ROI"
          value={`${roi >= 0 ? '+' : ''}${roi.toFixed(2)}%`}
          sub={`From $10,000 start`}
          trend={roi >= 0 ? 'up' : 'down'}
        />
        <MetricCard
          title="Win Rate"
          value={stats.totalTrades > 0 ? `${stats.winRate}%` : 'No trades yet'}
          sub={`${stats.totalTrades} closed trades`}
          trend={stats.winRate >= 50 ? 'up' : stats.totalTrades > 0 ? 'down' : 'neutral'}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Stats panel — REAL computed stats */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-medium text-white">Live Performance</h3>
          {stats.totalTrades === 0 ? (
            <p className="text-xs text-gray-500">No closed trades yet. Stats will appear here after the first trade closes.</p>
          ) : (
            <div className="space-y-2 text-sm">
              {[
                { label: 'Profit Factor',  value: stats.profitFactor.toFixed(2)  },
                { label: 'Avg Win',        value: `+${stats.avgWinPct.toFixed(1)}%` },
                { label: 'Avg Loss',       value: `${stats.avgLossPct.toFixed(1)}%` },
                { label: 'Total P&L',      value: `$${stats.totalPnL.toFixed(2)}` },
                { label: 'Total Trades',   value: stats.totalTrades.toString()    },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-400">{label}</span>
                  <span className="text-white font-mono">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active positions */}
        <div className="col-span-2 bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-4">Open Positions ({positions.length})</h3>
          {positions.length === 0 ? (
            <p className="text-xs text-gray-500">No open positions.</p>
          ) : (
            <div className="space-y-2">
              {positions.map((pos) => (
                <div key={pos.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                      ${pos.side === 'long' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {pos.side === 'long' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{pos.symbol}</p>
                      <p className="text-xs text-gray-500">{pos.side.toUpperCase()} | SL: ${pos.sl.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-mono ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">{pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent logs */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-white mb-3">Recent Engine Logs</h3>
        <div className="font-mono text-xs space-y-1 max-h-32 overflow-y-auto">
          {logs.slice(0, 8).map((log, i) => {
            const colors: Record<string, string> = {
              trade: 'text-emerald-400', info: 'text-blue-400',
              warn: 'text-yellow-400', error: 'text-red-400'
            };
            return (
              <div key={i} className="flex gap-3">
                <span className="text-gray-500 shrink-0">{log.time}</span>
                <span className={`shrink-0 ${colors[log.level] || 'text-gray-400'}`}>[{log.level}]</span>
                <span className="text-gray-300">{log.message}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Positions Section ──────────────────────────────────────────

const PositionsSection: React.FC<{ positions: Position[] }> = ({ positions }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-white">Open Positions</h2>
    {positions.length === 0 ? (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
        <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No open positions. Engine is scanning for setups.</p>
      </div>
    ) : (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              {['Symbol', 'Side', 'Size', 'Entry', 'Current', 'Stop Loss', 'Take Profit', 'P&L'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs text-gray-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {positions.map((pos) => (
              <tr key={pos.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                <td className="px-4 py-3 font-medium text-white">{pos.symbol}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium
                    ${pos.side === 'long' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {pos.side.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-gray-300">{pos.size}</td>
                <td className="px-4 py-3 font-mono text-gray-300">${pos.entry.toFixed(2)}</td>
                <td className="px-4 py-3 font-mono text-white">${pos.current.toFixed(2)}</td>
                <td className="px-4 py-3 font-mono text-red-400">${pos.sl.toFixed(2)}</td>
                <td className="px-4 py-3 font-mono text-emerald-400">${pos.tp.toFixed(2)}</td>
                <td className={`px-4 py-3 font-mono font-semibold ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                  <span className="text-xs ml-1 opacity-70">({pos.pnlPercent.toFixed(2)}%)</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

// ── Risk Section ───────────────────────────────────────────────

const RiskSection: React.FC<{ risk: RiskStatus }> = ({ risk }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-white">Risk Management</h2>

    {(risk.dailyLimitBreached || risk.drawdownBreached) && (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
        <p className="text-sm text-red-300 font-medium">
          RISK LIMIT BREACHED — Engine has stopped opening new trades.
        </p>
      </div>
    )}

    <div className="grid grid-cols-2 gap-6">
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-5">
        <h3 className="text-sm font-medium text-white">Live Risk Meters</h3>
        <RiskBar
          label="Drawdown"
          value={risk.drawdownPct}
          max={risk.maxDrawdownPct}
          breached={risk.drawdownBreached}
        />
        <RiskBar
          label="Daily Loss"
          value={Math.abs(risk.dailyLossPct)}
          max={risk.maxDailyLossPct}
          breached={risk.dailyLimitBreached}
        />
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Open Positions</span>
            <span className="text-white font-mono">{risk.openPositions} / {risk.maxPositions}</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 rounded-full transition-all"
              style={{ width: `${(risk.openPositions / risk.maxPositions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-3">
        <h3 className="text-sm font-medium text-white">Risk Rules Active</h3>
        <div className="space-y-2 text-sm">
          {[
            { label: '1% risk per trade',          active: true },
            { label: '15-min cooldown per symbol',  active: true },
            { label: 'Correlation guard (max 1 per group)', active: true },
            { label: `Daily loss limit: ${risk.maxDailyLossPct}%`, active: !risk.dailyLimitBreached },
            { label: `Max drawdown: ${risk.maxDrawdownPct}%`,       active: !risk.drawdownBreached  },
            { label: `Max ${risk.maxPositions} positions`,          active: true },
          ].map(({ label, active }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span className={active ? 'text-gray-300' : 'text-red-300 font-medium'}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ── Logs Section ───────────────────────────────────────────────

const LogsSection: React.FC<{ logs: LogEntry[] }> = ({ logs }) => {
  const [filter, setFilter] = useState('all');
  const levelColors: Record<string, string> = {
    info: 'text-blue-400', warn: 'text-yellow-400',
    error: 'text-red-400', trade: 'text-emerald-400'
  };
  const filtered = filter === 'all' ? logs : logs.filter(l => l.level === filter);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Trade Console</h2>
        <div className="flex gap-2">
          {['all', 'trade', 'info', 'warn', 'error'].map(level => (
            <button key={level} onClick={() => setFilter(level)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium
                ${filter === level ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}>
              {level.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 h-[500px] overflow-y-auto font-mono text-sm">
        {filtered.length === 0
          ? <p className="text-gray-500 text-xs">No logs yet.</p>
          : filtered.map((log, i) => (
            <div key={i} className="flex gap-4 py-2 border-b border-gray-800 px-2">
              <span className="text-gray-500 shrink-0">{log.time}</span>
              <span className={`shrink-0 ${levelColors[log.level] || 'text-gray-400'}`}>[{log.level}]</span>
              <span className="text-gray-300">{log.message}</span>
            </div>
          ))
        }
      </div>
    </div>
  );
};

// ── Settings Section ───────────────────────────────────────────

const SettingsSection: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [apiKey,     setApiKey]     = useState('');
  const [apiSecret,  setApiSecret]  = useState('');
  const [maxRisk,    setMaxRisk]    = useState('1.0');
  const [maxDD,      setMaxDD]      = useState('8.0');
  const [dailyLoss,  setDailyLoss]  = useState('2.0');
  const [longs,      setLongs]      = useState(true);
  const [shorts,     setShorts]     = useState(true);

  const save = async () => {
    try {
      await fetch('http://localhost:8000/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey, apiSecret,
          maxRisk: parseFloat(maxRisk),
          maxDrawdown: parseFloat(maxDD),
          dailyLoss: parseFloat(dailyLoss),
          enableLongs: longs, enableShorts: shorts,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert('Backend offline — settings not saved');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-semibold text-white">Settings</h2>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <p className="text-sm text-yellow-300">
          <strong>Paper Trading Mode</strong> — Virtual $10,000. No real money at risk.
          Add Binance API keys below to switch to live trading.
        </p>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-4">
        <h3 className="text-sm font-medium text-white">Broker API Keys (Optional)</h3>
        <p className="text-xs text-gray-400">Leave blank to continue in paper trading mode.</p>
        <input
          type="password" placeholder="Binance API Key"
          value={apiKey} onChange={e => setApiKey(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white"
        />
        <input
          type="password" placeholder="Binance API Secret"
          value={apiSecret} onChange={e => setApiSecret(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white"
        />
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-4">
        <h3 className="text-sm font-medium text-white">Risk Parameters</h3>
        {[
          { label: 'Risk per trade (%)', value: maxRisk, set: setMaxRisk, hint: 'Recommended: 1%' },
          { label: 'Max drawdown (%)',   value: maxDD,   set: setMaxDD,   hint: 'Engine stops at this drawdown' },
          { label: 'Daily loss limit (%)', value: dailyLoss, set: setDailyLoss, hint: 'No new entries after this daily loss' },
        ].map(({ label, value, set, hint }) => (
          <div key={label}>
            <label className="text-xs text-gray-400 mb-1 block">{label} <span className="text-gray-600">— {hint}</span></label>
            <input type="number" step="0.1" value={value} onChange={e => set(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white" />
          </div>
        ))}
        <div className="flex gap-6">
          {[
            { label: 'Enable Longs',  val: longs,  set: setLongs  },
            { label: 'Enable Shorts', val: shorts, set: setShorts },
          ].map(({ label, val, set }) => (
            <label key={label} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={val} onChange={e => set(e.target.checked)}
                className="w-4 h-4 rounded" />
              {label}
            </label>
          ))}
        </div>
      </div>

      <button onClick={save}
        className="px-6 py-2.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-all">
        {saved ? '✅ Saved!' : 'Save Settings'}
      </button>
    </div>
  );
};

// ── Main App ───────────────────────────────────────────────────

const EMPTY_STATS: Stats = {
  winRate: 0, totalTrades: 0, profitFactor: 0,
  totalPnL: 0, avgWinPct: 0, avgLossPct: 0,
};

const EMPTY_RISK: RiskStatus = {
  drawdownPct: 0, dailyLossPct: 0,
  openPositions: 0, maxPositions: 3,
  maxDrawdownPct: 8, maxDailyLossPct: 2,
  dailyLimitBreached: false, drawdownBreached: false,
};

const App: React.FC = () => {
  const [activeSection,  setActiveSection]  = useState('dashboard');
  const [equity,         setEquity]         = useState(10000);
  const [dailyPnL,       setDailyPnL]       = useState(0);
  const [killSwitch,     setKillSwitch]      = useState(false);
  const [positions,      setPositions]       = useState<Position[]>([]);
  const [logs,           setLogs]            = useState<LogEntry[]>([]);
  const [stats,          setStats]           = useState<Stats>(EMPTY_STATS);
  const [risk,           setRisk]            = useState<RiskStatus>(EMPTY_RISK);
  const [isLive,         setIsLive]          = useState(false);
  const [backendOnline,  setBackendOnline]   = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res  = await fetch('http://localhost:8000/api/dashboard');
        if (!res.ok) throw new Error('not ok');
        const data = await res.json();

        setEquity(data.equity ?? 10000);
        setDailyPnL(data.dailyPnL ?? 0);
        setKillSwitch(data.killSwitch ?? false);
        setIsLive(data.isLive ?? false);
        setPositions(data.positions ?? []);
        setLogs(data.logs ?? []);
        setStats(data.stats ?? EMPTY_STATS);
        setRisk(data.risk ?? EMPTY_RISK);
        setBackendOnline(true);
      } catch {
        setBackendOnline(false);
      }
    };

    fetchData();
    const id = setInterval(fetchData, 3000);
    return () => clearInterval(id);
  }, []);

  const toggleKill = async () => {
    try {
      const res  = await fetch('http://localhost:8000/api/kill', { method: 'POST' });
      const data = await res.json();
      setKillSwitch(data.killSwitch);
    } catch {
      setKillSwitch(k => !k);
    }
  };

  const appState: AppState = {
    equity, dailyPnL, positions, logs, killSwitch,
    stats, risk, isLive, backendOnline,
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <DashboardSection {...appState} />;
      case 'positions': return <PositionsSection positions={positions} />;
      case 'risk':      return <RiskSection risk={risk} />;
      case 'logs':      return <LogsSection logs={logs} />;
      case 'settings':  return <SettingsSection />;
      default:          return <DashboardSection {...appState} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex font-sans">
      <Sidebar active={activeSection} onChange={setActiveSection} />
      <div className="flex-1 flex flex-col">
        <Header
          equity={equity} dailyPnL={dailyPnL}
          killSwitch={killSwitch} backendOnline={backendOnline}
          isLive={isLive} onKillSwitch={toggleKill}
        />
        <main className="flex-1 p-6 overflow-auto">{renderSection()}</main>
        <footer className="h-10 bg-gray-900 border-t border-gray-700 flex items-center justify-between px-6 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${killSwitch ? 'bg-red-400' : backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-yellow-400'}`} />
              {killSwitch ? 'Engine Paused' : backendOnline ? 'Engine Running' : 'Backend Offline'}
            </div>
            <span>RAYR_Quant v2.0 | github.com/Rayr-06</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={isLive ? 'text-red-400 font-semibold' : 'text-emerald-400'}>
              {isLive ? '🔴 LIVE TRADING' : '🟢 PAPER MODE'}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
