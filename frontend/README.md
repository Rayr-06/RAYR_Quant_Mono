<p align="center">
  <img src="https://img.shields.io/badge/RAYR__Quant-v1.0.0-brightgreen?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/TradingView-Integrated-FF6600?style=for-the-badge" alt="TradingView">
  <img src="https://img.shields.io/badge/Zerodha-Kite-API-E52528?style=for-the-badge" alt="Zerodha">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Author-Rayr--06-9b59b6?style=for-the-badge" alt="Author">
</p>

<h1 align="center">⚡ RAYR_Quant</h1>

<h3 align="center">Production-Grade Automated Trading System</h3>

<p align="center">
  <strong>Complete trading platform with TradingView integration and Zerodha Kite API</strong>
</p>

<p align="center">
  <a href="https://github.com/Rayr-06/RAYR_Quant/issues">Report Bug</a>
  ·
  <a href="https://github.com/Rayr-06/RAYR_Quant">Request Feature</a>
</p>

---

## 📋 Table of Contents

- [About The Project](#-about-the-project)
- [Features](#-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Documentation](#-documentation)
- [Configuration](#-configuration)
- [TradingView Setup](#-tradingview-setup)
- [Zerodha Integration](#-zerodha-integration)
- [Risk Management](#-risk-management)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 About The Project

**RAYR_Quant** is a complete, production-ready automated trading system designed for the Indian stock market. It integrates with TradingView for signal generation and executes trades through Zerodha's Kite API.

### Why RAYR_Quant?

| Problem | RAYR_Quant Solution |
|---------|---------------------|
| No risk management | ✅ Built-in 1% risk per trade |
| Emotional trading | ✅ Automated rule execution |
| Manual monitoring | ✅ Real-time dashboard |
| Complex setup | ✅ Simple webhook integration |
| No paper trading | ✅ Full paper trading mode |

### Built With

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Charts**: Recharts
- **State**: Zustand
- **Broker**: Zerodha Kite Connect API

---

## ✨ Features

### 📊 Dashboard
- Real-time portfolio value
- Daily P&L tracking
- Equity curve visualization
- Risk metrics overview
- Kill switch emergency button

### 🧠 Trading Strategies
| Strategy | Description | Win Rate |
|----------|-------------|----------|
| Trend Following | EMA crossover with volume | 55-65% |
| Mean Reversion | Bollinger Bands + RSI | 58-68% |
| Breakout | Volume-confirmed breakouts | 50-60% |
| Options Selling | Cash-secured puts | 65-75% |

### 🛡️ Risk Management
- ✅ Max 1% risk per trade (configurable)
- ✅ Max 2% daily loss limit
- ✅ Max 10% drawdown protection
- ✅ Automatic position sizing
- ✅ Kill switch for emergencies

### 🔄 TradingView Integration
- Webhook alerts from TradingView
- Pine Script strategies included
- Real-time signal processing
- Multi-format support

### 🏦 Broker Support
- Zerodha Kite API (Primary)
- Upstox API (Alternative)
- Paper Trading (Testing)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    RAYR_Quant Architecture                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  TradingView ──► Webhook Server ──► Risk Manager ──► Broker │
│       │              │                   │              │    │
│       ▼              ▼                   ▼              ▼    │
│   [Signals]    [Validation]      [Position Sizing]  [Orders]│
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   Dashboard (React)                    │  │
│  │  [Portfolio] [Positions] [Strategies] [Risk] [Logs]  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- TradingView account
- Zerodha account (for live trading)

### Installation

```bash
# Clone the repository
git clone https://github.com/Rayr-06/RAYR_Quant.git

# Navigate to project
cd RAYR_Quant

# Install dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### Running the Application

```bash
# Terminal 1: Start Dashboard
npm run dev

# Terminal 2: Start Server
cd server
node webhook-server.js

# Terminal 3: Start ngrok (for TradingView)
ngrok http 3001
```

Open http://localhost:5173 to view the dashboard.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [MANUAL.md](MANUAL.md) | Complete user manual |
| [QUICK_START.md](QUICK_START.md) | Get started in 10 minutes |
| [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) | TradingView + Kite setup |
| [API_REFERENCE.md](docs/API_REFERENCE.md) | API documentation |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deployment guide |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |
| [CHANGELOG.md](CHANGELOG.md) | Version history |

---

## ⚙️ Configuration

### Environment Variables

Create `server/.env`:

```bash
# Server Configuration
PORT=3001
PAPER_MODE=true

# Security
WEBHOOK_SECRET=your-secret-key

# Zerodha Kite API
KITE_API_KEY=your-api-key
KITE_API_SECRET=your-api-secret
KITE_ACCESS_TOKEN=your-access-token

# Risk Management
MAX_RISK_PER_TRADE=1
MAX_DAILY_LOSS=2
MAX_POSITIONS=5
INITIAL_CAPITAL=500000
```

---

## 📺 TradingView Setup

### 1. Add Pine Script

1. Open TradingView → Chart
2. Open Pine Editor
3. Paste code from `tradingview/pine-script-strategy.pine`
4. Click "Add to Chart"

### 2. Create Alert

1. Click "Alerts" → "+ Create Alert"
2. Set Webhook URL: `https://your-ngrok-url/api/webhook`
3. Add alert message:

```json
{
  "symbol": "{{ticker}}",
  "action": "{{strategy.order.action}}",
  "price": "{{strategy.order.price}}",
  "secret": "your-webhook-secret"
}
```

---

## 🔐 Zerodha Integration

### 1. Get API Access

1. Go to https://kite.trade
2. Subscribe to API (₹2000/month)
3. Get your API Key and Secret

### 2. Generate Access Token

```bash
# Run token generator
cd server
node generate-token.js
```

### 3. Update Configuration

Add credentials to `server/.env`:

```
KITE_API_KEY=your-key
KITE_API_SECRET=your-secret
KITE_ACCESS_TOKEN=your-token
PAPER_MODE=false
```

---

## 🛡️ Risk Management

### The 5 Unbreakable Rules

| Rule | Limit | Description |
|------|-------|-------------|
| 1 | 1% max risk | Never risk more than 1% per trade |
| 2 | 2:1 min R:R | Minimum risk-reward ratio |
| 3 | 2% daily loss | Stop trading if down 2% in a day |
| 4 | 10% drawdown | Pause if account down 10% |
| 5 | 5 max positions | Never have more than 5 trades |

### Position Sizing Formula

```
Quantity = (Capital × Risk%) / (Entry - StopLoss)

Example:
Capital: ₹5,00,000
Risk: 1% = ₹5,000
Entry: ₹100
Stop Loss: ₹95
Risk per share: ₹5

Quantity = ₹5,000 / ₹5 = 1,000 shares
```

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

## 📞 Contact

**Rayr-06**

- GitHub: [@Rayr-06](https://github.com/Rayr-06)
- Repository: [RAYR_Quant](https://github.com/Rayr-06/RAYR_Quant)

---

## ⚠️ Disclaimer

> **Trading involves substantial risk of loss. Past performance is not indicative of future results. Only trade with money you can afford to lose.**

This software is provided for educational purposes only. The creators are not responsible for any financial losses incurred through the use of this software.

---

<p align="center">
  <strong>Built with ❤️ by <a href="https://github.com/Rayr-06">Rayr-06</a></strong>
</p>

<p align="center">
  <a href="https://github.com/Rayr-06/RAYR_Quant">
    <img src="https://img.shields.io/github/stars/Rayr-06/RAYR_Quant?style=social" alt="Stars">
  </a>
  <a href="https://github.com/Rayr-06/RAYR_Quant/fork">
    <img src="https://img.shields.io/github/forks/Rayr-06/RAYR_Quant?style=social" alt="Forks">
  </a>
</p>
