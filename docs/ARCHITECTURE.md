# 🏗️ System Architecture

## Overview

Rayr QuantForge follows a modular, event-driven architecture designed for reliability, scalability, and ease of maintenance.

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RAYR QUANTFORGE ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         EXTERNAL SERVICES                            │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐│    │
│  │  │ TradingView  │  │   Zerodha    │  │   Upstox     │  │ News API ││    │
│  │  │  Webhooks    │  │  Kite API    │  │   API        │  │Sentiment ││    │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────┬─────┘│    │
│  │         │                │                │                │        │    │
│  │         └────────────────┴────────────────┴────────────────┘        │    │
│  │                              ▼                                        │    │
│  │  ┌───────────────────────────────────────────────────────────────┐  │    │
│  │  │                       API GATEWAY                              │  │    │
│  │  │            (Rate Limiting, Auth, HMAC Validation)              │  │    │
│  │  └───────────────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                          │
│                                    ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    SIGNAL PROCESSING PIPELINE                        │    │
│  │                                                                      │    │
│  │  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐         │    │
│  │  │ Receive  │───▶│ Validate│───▶│  Risk   │───▶│ Execute │         │    │
│  │  │ Signal   │    │ Signal  │    │  Check  │    │  Trade  │         │    │
│  │  └─────────┘    └─────────┘    └─────────┘    └─────────┘         │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                          │
│                                    ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                       STRATEGY ENGINE                                │    │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐       │    │
│  │  │  Trend     │ │    Mean    │ │  Breakout  │ │  Options   │       │    │
│  │  │ Following  │ │ Reversion  │ │  Scanner   │ │  Selling   │       │    │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                          │
│                                    ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      RISK MANAGEMENT LAYER                           │    │
│  │                                                                      │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │    │
│  │  │ Position     │  │ Drawdown     │  │ Kill Switch  │              │    │
│  │  │ Sizing       │  │ Protection   │  │              │              │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                          │
│                                    ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        DATA LAYER                                    │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │    │
│  │  │   React      │  │   Server     │  │   Broker     │              │    │
│  │  │  (State)     │  │  (Logs)      │  │  (Positions) │              │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### 1. Signal Reception Flow

```
TradingView Alert
       │
       ▼
POST /api/webhook
       │
       ▼
┌──────────────────┐
│  Parse Payload   │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│  Validate Secret │ ──── Reject if invalid
└──────────────────┘
       │
       ▼
┌──────────────────┐
│  Validate Signal │ ──── Check symbol, action, price
└──────────────────┘
       │
       ▼
   CONTINUE
```

### 2. Risk Check Flow

```
Signal Received
       │
       ▼
┌─────────────────────────────────────────────────┐
│              RISK VALIDATION                      │
├─────────────────────────────────────────────────┤
│  1. Daily Loss < Limit (2%)?                     │
│  2. Total Drawdown < Limit (10%)?                │
│  3. Positions < Max (5)?                         │
│  4. Risk-Reward >= 2:1?                          │
│  5. Not duplicate position?                      │
└─────────────────────────────────────────────────┘
       │
       ▼
   APPROVED or REJECTED
```

### 3. Execution Flow

```
Risk Approved
       │
       ▼
┌─────────────────────────────────────────────────┐
│           POSITION SIZING                         │
│                                                  │
│  Quantity = (Capital × Risk%) / Risk per Share   │
└─────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│           BROKER API CALL                         │
│                                                  │
│  Zerodha Kite / Upstox / Paper Trading           │
└─────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│           LOG & UPDATE                            │
│                                                  │
│  - Trade logged                                  │
│  - Position updated                              │
│  - Dashboard refreshed                           │
└─────────────────────────────────────────────────┘
```

---

## 🧩 Component Architecture

### Frontend (React)

```
App
├── Sidebar
│   ├── Navigation Items
│   └── System Status
├── Header
│   ├── Portfolio Value
│   ├── Daily P&L
│   └── Kill Switch
├── Main Content
│   ├── Dashboard
│   ├── Strategies
│   ├── Positions
│   ├── Orders
│   ├── Risk Management
│   ├── Backtesting
│   ├── Trade Console
│   └── Settings
└── Footer
    ├── System Status
    └── Version
```

### Backend (Node.js)

```
Server
├── Routes
│   ├── POST /api/webhook
│   ├── GET /api/health
│   ├── GET /api/trades
│   ├── GET /api/positions
│   └── POST /api/manual-trade
├── Middleware
│   ├── Authentication
│   ├── Rate Limiting
│   └── Error Handling
├── Services
│   ├── Signal Parser
│   ├── Risk Manager
│   ├── Trade Executor
│   └── Logger
└── External
    ├── Zerodha Kite
    └── Upstox API
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────┐
│                 SECURITY LAYERS                   │
├─────────────────────────────────────────────────┤
│                                                  │
│  Layer 1: Webhook Authentication                 │
│  ├── HMAC signature validation                   │
│  ├── Secret key verification                     │
│  └── IP whitelisting (optional)                  │
│                                                  │
│  Layer 2: Input Validation                       │
│  ├── Sanitize all inputs                         │
│  ├── Validate data types                         │
│  └── Check boundaries                            │
│                                                  │
│  Layer 3: Risk Management                        │
│  ├── Position limits                             │
│  ├── Drawdown protection                         │
│  └── Kill switch                                 │
│                                                  │
│  Layer 4: API Security                           │
│  ├── Token-based authentication                  │
│  ├── Rate limiting                               │
│  └── HTTPS encryption                            │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 📊 State Management

### Frontend State (Zustand)

```typescript
interface TradingState {
  // Portfolio
  equity: number;
  cash: number;
  dailyPnL: number;
  
  // Positions
  positions: Position[];
  
  // Strategies
  strategies: Strategy[];
  
  // Risk
  riskMetrics: RiskMetrics;
  
  // System
  connectionStatus: ConnectionStatus;
  logs: LogEntry[];
}
```

### Server State

```
├── tradeLog[]           # All trade signals
├── activePositions[]    # Current positions
├── dailyStats {}        # Daily performance
└── systemStatus {}      # Health status
```

---

## 🔄 Event System

### Events Flow

```
SignalReceived
    │
    ├──▶ SignalValidated
    │       │
    │       ├──▶ RiskCheckPassed
    │       │       │
    │       │       └──▶ TradeExecuted
    │       │               │
    │       │               └──▶ PositionUpdated
    │       │
    │       └──▶ RiskCheckFailed
    │               │
    │               └──▶ SignalRejected
    │
    └──▶ SignalInvalid
            │
            └──▶ SignalRejected
```

---

## 🚀 Deployment Architecture

### Development

```
┌─────────────────────────────────────────────────┐
│              LOCAL DEVELOPMENT                    │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────┐    ┌─────────────┐             │
│  │   Vite      │    │   Node.js   │             │
│  │  (Port 5173)│    │ (Port 3001) │             │
│  └─────────────┘    └─────────────┘             │
│         │                  │                     │
│         └────────┬─────────┘                     │
│                  │                               │
│           ┌──────▼──────┐                        │
│           │   Browser   │                        │
│           └─────────────┘                        │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Production

```
┌─────────────────────────────────────────────────┐
│              PRODUCTION DEPLOYMENT               │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │           Load Balancer                  │    │
│  └─────────────────┬───────────────────────┘    │
│                    │                             │
│  ┌─────────────────▼───────────────────────┐    │
│  │         Application Server               │    │
│  │     (Node.js + React Static Files)       │    │
│  └─────────────────┬───────────────────────┘    │
│                    │                             │
│  ┌─────────────────▼───────────────────────┐    │
│  │              Database                    │    │
│  │         (PostgreSQL / SQLite)            │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 📈 Scalability Considerations

### Horizontal Scaling

- Multiple server instances behind load balancer
- Shared database for state
- Redis for caching (optional)

### Vertical Scaling

- Increase server resources
- Optimize database queries
- Add caching layer

---

## 🔧 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 | UI Components |
| Styling | Tailwind CSS | Responsive Design |
| State | Zustand | State Management |
| Charts | Recharts | Data Visualization |
| Backend | Node.js | API Server |
| Framework | Express.js | HTTP Handling |
| Build | Vite | Fast Development |
| Language | TypeScript | Type Safety |

---

**Built with ❤️ by [Rayr-06](https://github.com/Rayr-06)**
