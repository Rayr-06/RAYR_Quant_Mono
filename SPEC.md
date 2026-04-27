# QuantForge Trading System - Specification

## Concept & Vision

QuantForge is a professional-grade automated trading platform designed for institutional and serious retail traders. The system embodies the philosophy of **"survival first, profitability second"** — prioritizing risk-adjusted returns, capital preservation, and robust drawdown control. The interface feels like a command center for a quant hedge fund: data-dense yet readable, powerful yet intuitive, with the gravitas of professional trading tools like Bloomberg Terminal meets the modern aesthetics of contemporary fintech.

The visual identity is **dark, authoritative, and precise** — a trading floor aesthetic with subtle neon accents indicating system states, glowing indicators for positions, and a hierarchy that guides the eye from critical metrics to detailed data.

## Design Language

### Aesthetic Direction
**Reference**: Bloomberg Terminal meets Figma — dark professional interfaces with precision typography, subtle gradients, and purposeful color coding. Dense information architecture with clear visual hierarchy.

### Color Palette
- **Background Primary**: `#0a0e17` (deep space black)
- **Background Secondary**: `#111827` (card surfaces)
- **Background Tertiary**: `#1f2937` (elevated elements)
- **Border**: `#374151` (subtle boundaries)
- **Text Primary**: `#f9fafb` (high contrast)
- **Text Secondary**: `#9ca3af` (muted labels)
- **Text Tertiary**: `#6b7280` (disabled/hints)
- **Accent Green (Profit/Long)**: `#10b981` (emerald)
- **Accent Red (Loss/Short)**: `#ef4444` (red)
- **Accent Blue (Neutral/Info)**: `#3b82f6` (blue)
- **Accent Yellow (Warning)**: `#f59e0b` (amber)
- **Accent Purple (Special)**: `#8b5cf6` (violet)

### Typography
- **Primary Font**: `JetBrains Mono` (monospace for data), fallback: `SF Mono, Consolas, monospace`
- **Secondary Font**: `Inter` (UI text), fallback: `system-ui, sans-serif`
- **Scale**: 10px (micro), 12px (small), 14px (body), 16px (emphasis), 20px (heading), 28px (display)

### Spatial System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px
- Card padding: 16px
- Section gaps: 24px
- Border radius: 4px (subtle), 8px (cards), 12px (modals)

### Motion Philosophy
- **Micro-interactions**: 150ms ease-out (hover states, button presses)
- **Data updates**: 300ms ease-in-out (value changes with subtle pulse)
- **Panel transitions**: 400ms cubic-bezier(0.4, 0, 0.2, 1)
- **Loading states**: Skeleton shimmer at 1.5s cycle
- Animations communicate state changes, never decorative

### Visual Assets
- **Icons**: Lucide React (consistent, professional)
- **Charts**: Recharts with custom theme
- **Decorative**: Subtle grid patterns, gradient overlays on cards

## Layout & Structure

### Overall Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER: System Status | Portfolio Value | Quick Actions        │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                  │
│  SIDEBAR     │  MAIN CONTENT AREA                              │
│  - Dashboard │  ┌────────────────────┬───────────────────────┐ │
│  - Strategies│  │ KEY METRICS ROW    │                       │ │
│  - Positions │  ├────────────────────┴───────────────────────┤ │
│  - Orders    │  │ PRIMARY PANEL (varies by section)           │ │
│  - Risk      │  │                                             │ │
│  - Backtest  │  │                                             │ │
│  - Logs      │  ├─────────────────────────────────────────────┤ │
│  - Settings  │  │ SECONDARY PANEL (charts, tables, details)   │ │
│              │  └─────────────────────────────────────────────┘ │
├──────────────┴──────────────────────────────────────────────────┤
│ FOOTER: Connection Status | Last Update | Version              │
└─────────────────────────────────────────────────────────────────┘
```

### Responsive Strategy
- **Desktop (1440px+)**: Full 3-column layout with expanded data
- **Laptop (1024-1439px)**: Collapsed sidebar, 2-column content
- **Tablet (768-1023px)**: Hidden sidebar (hamburger), stacked panels
- **Mobile (< 768px)**: Not primary target, basic read-only view

### Visual Pacing
- Header: Fixed, always visible, critical status at a glance
- Sidebar: Persistent navigation with visual state indicators
- Main content: Scrollable, card-based sections with consistent spacing
- Footer: Minimal, system health indicators

## Features & Interactions

### 1. Dashboard Overview
**Purpose**: At-a-glance system health and performance

**Components**:
- **Portfolio Summary Card**
  - Total equity with daily/total PnL
  - Equity curve sparkline
  - Color-coded by performance (green/red gradient)
  
- **Active Strategies Panel**
  - List of running strategies with on/off toggles
  - Each shows: signal count, active positions, today's PnL
  - Click to expand strategy details
  
- **Position Summary**
  - Open positions count
  - Long/Short breakdown
  - Total exposure as % of equity
  - Unrealized PnL
  
- **System Health Indicators**
  - Connection status (broker, data feeds)
  - Last signal received timestamp
  - Kill switch status
  - Error count (24h)

**Interactions**:
- Hover on equity value → shows breakdown tooltip
- Click strategy row → navigate to strategy detail
- Toggle switch → confirm modal → enable/disable strategy

### 2. Strategy Management
**Purpose**: Configure, monitor, and control trading strategies

**Components**:
- **Strategy Cards**
  - Name, type badge, status indicator
  - Configured parameters (visible on hover/expand)
  - Performance metrics: win rate, profit factor, Sharpe
  - Signal frequency indicator
  
- **Strategy Configuration Modal**
  - Parameter input fields with validation
  - Risk limit sliders
  - Indicator toggles
  - Save/Cancel actions

**Strategy Types Implemented**:
1. **Momentum Intraday**: RSI + MACD confirmation, 15min timeframe
2. **Mean Reversion**: Bollinger Bands, VWAP confirmation
3. **Breakout Scanner**: Support/resistance detection, volume confirmation
4. **Scalping Engine**: Level 2 analysis, micro-price movements
5. **Sentiment Driver**: News API integration placeholder

**Interactions**:
- Toggle enable → confirmation with risk warning
- Edit parameters → validate inputs → apply
- View history → modal with equity curve

### 3. Position Management
**Purpose**: Monitor and control all open positions

**Components**:
- **Positions Table**
  - Columns: Symbol, Type, Size, Entry, Current, PnL, SL, TP, Duration, Actions
  - Sortable columns
  - Color-coded PnL (gradient intensity based on %)
  - Row click → expand position details
  
- **Quick Actions**
  - Close position (with confirmation)
  - Modify SL/TP (inline edit)
  - Add to position (confirm dialog)

**Interactions**:
- Hover row → subtle highlight
- Click row → expand with additional data
- Right-click → context menu (close, modify, add note)
- Inline edit → Tab to navigate fields → Enter to save

### 4. Order Management
**Purpose**: View order history and pending orders

**Components**:
- **Pending Orders Tab**
  - Orders awaiting execution
  - Cancel button per order
  - Modify modal
  
- **Order History Tab**
  - Completed/cancelled orders
  - Filter by date, symbol, status
  - Export functionality

### 5. Risk Dashboard
**Purpose**: Monitor risk metrics and enforce controls

**Components**:
- **Risk Metrics Grid**
  - Max drawdown (current vs limit)
  - Daily loss limit status
  - Position correlation heatmap
  - Volatility exposure chart
  
- **Drawdown Control**
  - Equity high-water mark
  - Current drawdown % with progress bar
  - Color-coded thresholds (green < 5%, yellow < 10%, red > 10%)
  
- **Correlation Matrix**
  - Visual heatmap of position correlations
  - Warning badges for high correlations
  
- **Kill Switch Panel**
  - Global kill switch (prominent, red button)
  - Per-strategy kill switches
  - Auto-kill triggers configuration

### 6. Backtesting Interface
**Purpose**: Run historical simulations on strategies

**Components**:
- **Backtest Configuration**
  - Strategy selector
  - Date range picker
  - Initial capital input
  - Fee/slippage settings
  
- **Results Dashboard**
  - Equity curve chart
  - Performance metrics cards
  - Trade distribution histogram
  - Monthly returns table

### 7. Trade Console/Logs
**Purpose**: Real-time execution log and audit trail

**Components**:
- **Log Feed**
  - Real-time streaming logs
  - Color-coded by type (info, warning, error, trade)
  - Timestamp, source, message
  
- **Filters**
  - Level filter (debug, info, warn, error)
  - Source filter
  - Date range
  - Search text

### 8. Settings & Configuration
**Purpose**: System-wide configuration

**Sections**:
- **Broker Configuration**
  - API key inputs (masked)
  - Connection test button
  - WebSocket status
  
- **Risk Parameters**
  - Global position limits
  - Drawdown limits
  - Auto-kill thresholds
  
- **Notification Settings**
  - Email/Slack webhook configuration
  - Alert thresholds

## Component Inventory

### MetricCard
- **States**: Loading (skeleton), Value display, Trend indicator (up/down/stable)
- **Variants**: Compact (single value), Standard (value + label), Expanded (value + label + sparkline)

### DataTable
- **States**: Loading, Empty, Populated, Filtered
- **Features**: Sortable headers, row expansion, inline editing, selection
- **Hover**: Row highlight with subtle background

### ToggleSwitch
- **States**: Off (gray), On (green/blue), Disabled (muted), Loading (spinner)
- **Interaction**: Click → animate knob slide → state change

### Button
- **Variants**: Primary (blue), Success (green), Danger (red), Ghost (transparent)
- **States**: Default, Hover (brighten), Active (darken), Disabled, Loading
- **Sizes**: Small (28px), Medium (36px), Large (44px)

### StatusBadge
- **Variants**: Success (green), Warning (yellow), Error (red), Info (blue), Neutral (gray)
- **With dot**: Pulsing indicator for live status

### Modal
- **States**: Opening (fade + scale), Open, Closing
- **Features**: Backdrop blur, close on escape/ backdrop click (configurable)

### Chart Components
- **EquityCurve**: Line chart with gradient fill
- **PnLDistribution**: Histogram of trade outcomes
- **CorrelationHeatmap**: Matrix with color intensity
- **Sparkline**: Mini inline chart for trends

### Form Controls
- **Input**: Text, number with validation feedback
- **Select**: Dropdown with search for long lists
- **Slider**: Range input with value display
- **DateRangePicker**: Start/end date selection

## Technical Approach

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom theme
- **State Management**: Zustand (lightweight, TypeScript-friendly)
- **Charts**: Recharts with custom theme
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Build**: Vite

### Backend Considerations (Architecture)
For this dashboard implementation, we're demonstrating the frontend. In production:

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway                               │
│                    (Rate Limiting, Auth)                         │
├──────────┬──────────┬──────────┬──────────┬───────────────────┤
│ Signal   │ Execution│ Risk     │ Data     │ Backtest           │
│ Service  │ Service  │ Service  │ Service  │ Engine             │
├──────────┴──────────┴──────────┴──────────┴───────────────────┤
│                    Message Queue (Redis/RabbitMQ)              │
├─────────────────────────────────────────────────────────────────┤
│              PostgreSQL (Orders, History, Config)              │
│              InfluxDB (Time-series Metrics)                      │
│              Redis (Cache, Real-time State)                      │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow
1. **TradingView Alert** → Webhook → API Gateway → Signal Service
2. Signal Service → Validates → Publishes to Message Queue
3. Risk Service → Checks limits → Approves/Rejects
4. Execution Service → Broker API → Order Placement
5. All events → Audit Log + Real-time Dashboard Update

### State Management
```typescript
interface TradingState {
  // Portfolio
  portfolio: Portfolio;
  
  // Strategies
  strategies: Strategy[];
  activeSignals: Signal[];
  
  // Positions & Orders
  positions: Position[];
  orders: Order[];
  
  // Risk
  riskMetrics: RiskMetrics;
  killSwitchActive: boolean;
  
  // System
  connectionStatus: ConnectionStatus;
  logs: LogEntry[];
}
```

### Mock Data Strategy
Since this is a frontend demonstration:
- Simulated real-time data updates every 2-3 seconds
- Realistic market data patterns
- Configurable simulation speed
- Built-in scenario演练 (normal, high volatility, drawdown)

## API Design (Reference)

### Signal Reception
```
POST /api/v1/signals/tradingview
{
  "symbol": "BTCUSD",
  "action": "LONG|SHORT|CLOSE",
  "strategy": "momentum_15min",
  "price": 42150.00,
  "confidence": 0.85,
  "timestamp": "2024-01-15T14:30:00Z"
}
```

### Order Execution
```
POST /api/v1/orders
{
  "symbol": "BTCUSD",
  "side": "BUY|SELL",
  "type": "MARKET|LIMIT",
  "quantity": 0.1,
  "price": 42150.00,  // for limits
  "stopLoss": 41900.00,
  "takeProfit": 42600.00
}
```

### Risk Check
```
POST /api/v1/risk/check
{
  "proposedTrade": {...},
  "currentPositions": [...],
  "accountEquity": 50000.00
}
// Response: { "approved": boolean, "reason": string, "maxSize": number }
```

## Performance Metrics (Backtest Output)

| Metric | Formula | Target |
|--------|---------|--------|
| Sharpe Ratio | (Rp - Rf) / σp | > 1.5 |
| Sortino Ratio | (Rp - Rf) / σdown | > 2.0 |
| Max Drawdown | Peak - Trough | < 10% |
| Win Rate | Winners / Total | > 55% |
| Profit Factor | Gross Profit / Gross Loss | > 1.5 |
| Recovery Factor | Net Profit / Max DD | > 3.0 |
| Calmar Ratio | Annual Return / Max DD | > 2.0 |

## Security Considerations

1. **API Key Management**: Environment variables, never in code
2. **Webhook Validation**: HMAC signature verification
3. **Rate Limiting**: Prevent API abuse
4. **Audit Logging**: All actions logged with user ID
5. **Kill Switch**: Always accessible, failsafe design
