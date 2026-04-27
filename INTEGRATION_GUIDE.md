# TRADINGVIEW + QUANTFORGE INTEGRATION GUIDE

## COMPLETE STEP-BY-STEP SETUP

This guide will help you:
1. Set up TradingView to send alerts to your server
2. Run the webhook server locally
3. Test with paper trading
4. Go live with Zerodha Kite API

---

## STEP 1: SET UP THE WEBHOOK SERVER

### Option A: Run Locally (for testing)

```bash
# Navigate to server folder
cd server

# Install dependencies
npm install express cors dotenv

# Create .env file (already created, but update with your settings)
cp .env.example .env

# Edit .env file
# Set PAPER_MODE=true for testing
# Set your webhook secret

# Start the server
node webhook-server.js
```

Your server will run on `http://localhost:3001`

### Option B: Use ngrok (for testing with TradingView)

TradingView requires a public URL. Use ngrok to expose your local server:

```bash
# Install ngrok
# Windows: download from https://ngrok.com
# Mac: brew install ngrok
# Linux: snap install ngrok

# Start ngrok
ngrok http 3001

# You'll get a URL like: https://abc123.ngrok.io
# Use this URL in TradingView alerts
```

### Option C: Deploy to Cloud (for production)

**Free Options:**
1. **Railway** (railway.app) - Free tier available
2. **Render** (render.com) - Free tier available
3. **Vercel** (vercel.com) - Serverless functions
4. **Heroku** (heroku.com) - Free tier discontinued but cheap

**Paid Options:**
1. **AWS EC2** - ₹500-2000/month
2. **DigitalOcean** - ₹400-1500/month
3. **Google Cloud** - Pay as you go

---

## STEP 2: SET UP TRADINGVIEW

### 2.1 Create a TradingView Account

1. Go to https://www.tradingview.com
2. Sign up for free account
3. Go to https://www.tradingview.com/pine-script/

### 2.2 Add the Pine Script Strategy

1. Open any chart (e.g., RELIANCE on NSE)
2. Click "Pine Editor" at the bottom
3. Click "Open" → "New blank indicator" (or strategy)
4. Delete default code
5. Copy and paste the code from `tradingview/pine-script-strategy.pine`
6. Click "Add to Chart"

### 2.3 Set Up Webhook Alerts

**Method 1: Alert from Strategy (Recommended)**

1. Right-click on the strategy name in the chart
2. Click "Add Alert"
3. Configure the alert:
   - **Condition**: Select your strategy
   - **Alert name**: "QuantForge Signal"
   - **Webhook URL**: Enter your server URL
     - Local: `http://localhost:3001/api/webhook`
     - ngrok: `https://abc123.ngrok.io/api/webhook`
     - Cloud: `https://your-app.herokuapp.com/api/webhook`
   - **Message**: Copy and paste this JSON:
     ```json
     {
       "symbol": "{{ticker}}",
       "action": "{{strategy.order.action}}",
       "price": "{{strategy.order.price}}",
       "quantity": "{{strategy.order.contracts}}",
       "strategy": "Momentum",
       "secret": "your-secret-key",
       "timestamp": "{{time}}"
     }
     ```
4. Click "Create"

**Method 2: Alert from Indicator**

1. Click "Alerts" icon (clock) on the right panel
2. Click "+ Create Alert"
3. Configure similar to above

---

## STEP 3: TEST THE INTEGRATION

### 3.1 Verify Server is Running

Open browser and go to:
```
http://localhost:3001/api/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T14:30:00.000Z",
  "mode": "paper"
}
```

### 3.2 Test Webhook Manually

Use curl or Postman to send a test signal:

```bash
curl -X POST http://localhost:3001/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "RELIANCE",
    "action": "BUY",
    "price": 2500,
    "quantity": 10,
    "stopLoss": 2450,
    "takeProfit": 2600,
    "strategy": "Momentum",
    "secret": "your-secret-key"
  }'
```

Check server console for the received signal.

### 3.3 Test from TradingView

1. Create a manual alert on TradingView
2. Set webhook URL to your server
3. Use test message:
   ```
   TEST:SIGNAL:{{ticker}}:{{close}}
   ```
4. Trigger the alert
5. Check server console

---

## STEP 4: SET UP ZERODHA KITE API

### 4.1 Create Kite Account

1. Go to https://kite.zerodha.com
2. Create account (if you don't have one)
3. Complete KYC verification

### 4.2 Get API Access

1. Go to https://kite.trade
2. Click "Sign Up" or "Login"
3. Pay ₹2000/month for API access
4. After approval, you'll get:
   - API Key
   - API Secret

### 4.3 Generate Access Token

```javascript
// Step 1: Install kiteconnect
npm install kiteconnect

// Step 2: Create a script to generate token
// save as: generate-token.js

const KiteConnect = require('kiteconnect').default;

const kc = new KiteConnect({
  api_key: "YOUR_API_KEY"
});

// Open this URL in browser, login, and get request_token from redirect URL
console.log("Open this URL:");
console.log(`https://kite.zerodha.com/connect/login?api_key=${kc.api_key}&v=3`);

// After login, you'll be redirected to:
// http://YOUR_REDIRECT_URI?request_token=XXXXX&action=login&status=success

// Step 3: Generate session
async function generateToken(requestToken) {
  try {
    const response = await kc.generateSession(requestToken, "YOUR_API_SECRET");
    console.log("Access Token:", response.access_token);
    console.log("Add this to your .env file");
  } catch (error) {
    console.error("Error:", error);
  }
}

// Call with the request_token from redirect URL
// generateToken("YOUR_REQUEST_TOKEN");
```

### 4.4 Update .env File

```bash
KITE_API_KEY=your-api-key
KITE_API_SECRET=your-api-secret
KITE_ACCESS_TOKEN=your-access-token
PAPER_MODE=false  # Change to false for live trading
```

---

## STEP 5: GO LIVE (CAREFULLY!)

### 5.1 Pre-Live Checklist

- [ ] Paper traded for at least 1 month
- [ ] At least 50 paper trades executed
- [ ] Win rate above 50%
- [ ] Profit factor above 1.5
- [ ] Max drawdown below 10%
- [ ] All risk checks working
- [ ] Server running reliably
- [ ] Error handling in place

### 5.2 Start Small

1. Start with minimum quantity (1 share)
2. Trade only 1-2 stocks initially
3. Monitor every trade
4. Keep daily journal

### 5.3 Scale Gradually

- Week 1-2: 1-2 shares
- Week 3-4: 5-10 shares
- Month 2: 10-25 shares
- Month 3+: Scale based on performance

---

## TROUBLESHOOTING

### Issue: TradingView alert not received

**Check:**
1. Webhook URL is correct
2. Server is running
3. ngrok is running (if using)
4. Firewall not blocking port

**Test:**
```bash
# Test server locally
curl http://localhost:3001/api/health

# Test with ngrok
curl https://abc123.ngrok.io/api/health
```

### Issue: Signal received but not executed

**Check:**
1. Risk checks passing
2. Kite API credentials correct
3. Access token not expired

**Logs:**
```bash
# Check server logs
# Look for "Risk check failed" or "Kite API error"
```

### Issue: Kite API errors

**Common issues:**
1. Access token expired (regenerate daily)
2. Insufficient margins
3. Market closed
4. Invalid symbol format

**Solution:**
```javascript
// Refresh access token daily
// Use kite.setAccessToken() before trades
```

---

## FILE STRUCTURE

```
quantforge/
├── src/                    # React Dashboard
│   ├── App.tsx
│   ├── main.tsx
│   └── ...
├── server/                 # Webhook Server
│   ├── webhook-server.js
│   └── .env
├── tradingview/            # Pine Script
│   └── pine-script-strategy.pine
├── INTEGRATION_GUIDE.md
├── EVERYTHING_YOU_NEED.md
└── package.json
```

---

## API ENDPOINTS

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/webhook` | POST | Receive TradingView alerts |
| `/api/health` | GET | Health check |
| `/api/trades` | GET | Get trade log |
| `/api/positions` | GET | Get active positions |
| `/api/manual-trade` | POST | Manual trade execution |

---

## NEXT STEPS

1. ✅ Set up webhook server
2. ✅ Configure TradingView alerts
3. ✅ Test with paper trading
4. ✅ Set up Kite API
5. ✅ Go live with small capital
6. ✅ Monitor and scale

---

**Remember: Start with paper trading, prove it works, then go live small!**
