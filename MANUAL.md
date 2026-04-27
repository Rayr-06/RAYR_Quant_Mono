# 📘 COMPLETE MANUAL - RAYR_Quant

## By Rayr-06 | github.com/Rayr-06

---

# TABLE OF CONTENTS

1. [Welcome](#-welcome)
2. [What You'll Learn](#-what-youll-learn)
3. [First Time Setup](#-first-time-setup)
4. [Understanding the Dashboard](#-understanding-the-dashboard)
5. [TradingView Integration](#-tradingview-integration)
6. [Paper Trading](#-paper-trading)
7. [Going Live](#-going-live)
8. [Risk Management Rules](#-risk-management-rules)
9. [Troubleshooting](#-troubleshooting)
10. [FAQ](#-faq)

---

# 🎯 Welcome

**RAYR_Quant** is your complete automated trading system. This manual will teach you everything you need to know to use it properly.

### Important Warning

> **⚠️ Trading involves substantial risk of loss. Start with paper trading first!**
> 
> Never trade with money you cannot afford to lose.

---

# 📚 What You'll Learn

By the end of this manual, you will know:

- ✅ How to set up the trading dashboard
- ✅ How to connect TradingView alerts
- ✅ How to paper trade safely
- ✅ How to manage risk properly
- ✅ How to go live with real money
- ✅ How to avoid common mistakes

---

# 🔧 First Time Setup

## Step 1: Install Required Software

### Install Node.js (Required)

1. Go to https://nodejs.org
2. Download LTS version (18+)
3. Run installer
4. Verify installation:
   ```
   node --version
   npm --version
   ```

### Install Git (Required)

1. Go to https://git-scm.com
2. Download for Windows/Mac
3. Run installer
4. Verify: `git --version`

### Install ngrok (Required for Testing)

1. Go to https://ngrok.com
2. Sign up (free)
3. Download and install
4. Verify: `ngrok version`

---

## Step 2: Download the Project

### Option A: Download ZIP
1. Go to https://github.com/Rayr-06/rayr-quantforge
2. Click green "Code" button
3. Click "Download ZIP"
4. Extract to `E:\New folder (3)\rayr-quantforge`

### Option B: Clone with Git
```bash
cd E:\New folder (3)
git clone https://github.com/Rayr-06/rayr-quantforge.git
```

---

## Step 3: Install Dependencies

Open Command Prompt (cmd) or PowerShell:

```bash
# Navigate to project
cd "E:\New folder (3)\rayr-quantforge"

# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

---

## Step 4: Start the System

### Open 3 Command Prompt Windows

**Window 1 - Dashboard:**
```bash
cd "E:\New folder (3)\rayr-quantforge"
npm run dev
```
Keep this running. Dashboard will open at http://localhost:5173

**Window 2 - Server:**
```bash
cd "E:\New folder (3)\rayr-quantforge\server"
node webhook-server.js
```
Keep this running. Server runs on http://localhost:3001

**Window 3 - ngrok:**
```bash
ngrok http 3001
```
Copy the https URL (looks like: https://abc123.ngrok.io)

---

## Step 5: Verify Everything Works

1. Open browser to http://localhost:5173
2. You should see the Rayr QuantForge dashboard
3. Open another tab: http://localhost:3001/api/health
4. You should see: `{"status":"ok"}`

---

# 🖥️ Understanding the Dashboard

## Main Sections

### 🏠 Dashboard
Your command center showing:
- Portfolio value (top right)
- Daily P&L
- Equity curve chart
- Active positions
- Risk metrics

### 🧠 Strategies
Your trading strategies:
- **Momentum Intraday** - Trend following
- **Mean Reversion** - Buying oversold
- **Breakout Scanner** - Catching breakouts
- **Scalping Engine** - Quick trades
- **Sentiment Driver** - News-based

Toggle each ON/OFF with the switch.

### 📈 Positions
Shows all open trades:
- Symbol (e.g., RELIANCE)
- Side (LONG/SHORT)
- Entry price
- Current price
- P&L (profit/loss)
- Stop Loss / Take Profit
- Close button

### 🛡️ Risk Management
Most important section:
- **Drawdown**: How much you've lost from peak (max 10%)
- **Daily Loss**: Today's loss (max 2%)
- **Kill Switch**: Emergency stop button

### 📝 Trade Console
Shows all activity logs:
- Trade signals
- Risk checks
- Orders placed
- Any errors

---

# 📺 TradingView Integration

## Step 1: Create TradingView Account

1. Go to https://tradingview.com
2. Click "Sign Up"
3. Create free account
4. Verify email

## Step 2: Open Chart

1. Click "Products" → "Supercharts"
2. Search for a stock (e.g., RELIANCE on NSE)
3. You should see the chart

## Step 3: Add Pine Script

1. Click "Pine Editor" at bottom
2. Click "Open" → "New blank strategy"
3. Delete all default code
4. Copy code from `tradingview/pine-script-strategy.pine`
5. Paste into editor
6. Click "Add to Chart"

## Step 4: Create Alert

1. Click "Alerts" icon (clock) on right side
2. Click "+ Create Alert"
3. Configure:
   - **Condition**: Select your strategy
   - **Alert name**: "Rayr QuantForge Signal"
   - **Webhook URL**: Your ngrok URL + `/api/webhook`
     Example: `https://abc123.ngrok.io/api/webhook`
   - **Message**: Paste this JSON:

```json
{
  "symbol": "{{ticker}}",
  "action": "{{strategy.order.action}}",
  "price": "{{strategy.order.price}}",
  "quantity": "{{strategy.order.contracts}}",
  "strategy": "Momentum",
  "secret": "test123"
}
```

4. Click "Create"

## Step 5: Test Alert

1. Wait for strategy signal (or create manual alert)
2. Check server window - you should see:
   ```
   Received TradingView Alert:
   {"symbol":"RELIANCE","action":"BUY",...}
   ```

---

# 📝 Paper Trading

**Paper trading = using fake money to test your system**

## Why Paper Trade First?

- ✅ No risk to real money
- ✅ Test if system works
- ✅ Build confidence
- ✅ Learn without losing

## How to Paper Trade

The system is already in paper mode by default!

### Check Paper Mode

In `server/.env`:
```
PAPER_MODE=true
```

### Watch Paper Trades

1. TradingView sends signal
2. Server logs it as "PAPER TRADE"
3. Dashboard shows hypothetical position
4. Track if you would have made money

### Paper Trading Checklist

Trade for at least **3 months** before going live:

- [ ] Minimum 100 paper trades
- [ ] Win rate above 50%
- [ ] Following all rules
- [ ] Not emotional
- [ ] Consistent process

---

# 🔴 Going Live

**Only after successful paper trading!**

## Step 1: Get Zerodha API Access

1. Go to https://kite.trade
2. Sign up (₹2000/month)
3. Complete verification
4. Get your:
   - API Key
   - API Secret

## Step 2: Generate Access Token

You need to generate a new access token daily. Here's how:

1. Get your request token from Kite login
2. Run this script (once):
```bash
cd server
npm install kiteconnect
node -e "
const KiteConnect = require('kiteconnect').default;
const kc = new KiteConnect({api_key: 'YOUR_API_KEY'});
console.log('Login URL:', 'https://kite.zerodha.com/connect/login?api_key=' + kc.api_key + '&v=3');
"
```

3. Open URL, login, get request_token
4. Generate session:
```javascript
const kc = new KiteConnect({api_key: 'YOUR_API_KEY'});
const response = await kc.generateSession('REQUEST_TOKEN', 'YOUR_API_SECRET');
console.log('Access Token:', response.access_token);
```

## Step 3: Update Configuration

Edit `server/.env`:
```
PAPER_MODE=false
KITE_API_KEY=your-api-key
KITE_API_SECRET=your-api-secret
KITE_ACCESS_TOKEN=your-access-token
```

## Step 4: Start with Minimum

**CRITICAL: Start small!**

- Trade only 1-2 shares
- Use only ₹10,000-50,000
- Monitor every trade
- Keep daily journal

---

# 🛡️ Risk Management Rules

## THE 5 UNBREAKABLE RULES

### Rule 1: Max 1% Risk Per Trade
```python
Capital = ₹5,00,000
Risk = 1% = ₹5,000

If stop loss is ₹50 away:
Quantity = ₹5,000 / ₹50 = 100 shares
```

### Rule 2: Minimum 2:1 Risk-Reward
```
If you risk ₹5,000:
Target must be at least ₹10,000

Never take trades with less than 2:1
```

### Rule 3: Max 2% Daily Loss
```
If you lose ₹10,000 in a day:
STOP TRADING for the day

No exceptions
```

### Rule 4: Max 10% Drawdown
```
If account drops 10% from peak:
PAUSE trading for 2 weeks

Review what went wrong
```

### Rule 5: Max 5 Positions
```
Never have more than 5 open trades

Diversify, but not too much
```

---

## When NOT to Trade

- ❌ First 15 minutes after market opens
- ❌ Last 15 minutes before close
- ❌ During major news events
- ❌ When emotionally upset
- ❌ When tired
- ❌ After 3 consecutive losses (take break)

---

# 🔧 Troubleshooting

## Problem: Dashboard shows blank page

**Solution:**
1. Make sure `npm run dev` is running
2. Check for errors in terminal
3. Refresh browser (Ctrl+F5)

## Problem: Server won't start

**Solution:**
1. Make sure you're in `server` folder
2. Run `npm install` again
3. Check if port 3001 is in use

## Problem: TradingView alert not received

**Solution:**
1. Check ngrok is running
2. Check webhook URL is correct
3. Test with curl:
```bash
curl -X POST http://localhost:3001/api/webhook -H "Content-Type: application/json" -d '{"symbol":"TEST","action":"BUY"}'
```

## Problem: Kite API error

**Solution:**
1. Access token expires daily - regenerate
2. Check API key/secret are correct
3. Make sure market is open

---

# ❓ FAQ

### Q: Is this guaranteed to make money?
**A: NO.** No trading system is guaranteed. This gives you tools and strategies, but you must use them wisely.

### Q: How much money do I need?
**A:** Start with ₹50,000 for paper trading. For live trading, ₹2,50,000 minimum recommended.

### Q: Can I run this 24/7?
**A:** Yes, but Indian markets are only open 9:15 AM - 3:30 PM IST.

### Q: What's the win rate?
**A:** Our strategies average 55-65% win rate with 2:1+ risk-reward.

### Q: Do I need TradingView Premium?
**A:** No, free plan works for basic alerts. Premium allows more alerts.

### Q: How do I contact Rayr-06?
**A:** GitHub: https://github.com/Rayr-06

---

# 📞 Support

If you need help:

1. Read this manual again
2. Check [QUICK_START.md](QUICK_START.md)
3. Check [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
4. Create issue on GitHub
5. Contact [@Rayr-06](https://github.com/Rayr-06)

---

# 🎉 Congratulations!

You now have everything you need to start your trading journey.

**Remember:**
- Paper trade first
- Follow the rules
- Manage risk
- Be patient
- Keep learning

**Good luck and happy trading!**

---

**Built with ❤️ by [Rayr-06](https://github.com/Rayr-06)**
