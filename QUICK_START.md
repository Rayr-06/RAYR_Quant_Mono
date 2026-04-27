# 🚀 QUICK START - GET RUNNING IN 10 MINUTES

## THE FLOW

```
TradingView Alert → Your Server → Risk Check → Execute Trade (Paper or Live)
```

---

## STEP 1: START THE SERVER (2 min)

```bash
# Go to server folder
cd server

# Install dependencies
npm install

# Start server
node webhook-server.js
```

**You should see:**
```
========================================
🚀 QuantForge Webhook Server
========================================
📡 Running on port 3001
🔗 Webhook URL: http://localhost:3001/api/webhook
📊 Dashboard: http://localhost:3001/api/health
📝 Paper Mode: ON
========================================
```

---

## STEP 2: EXPOSE TO INTERNET (1 min)

TradingView needs a public URL. Use ngrok:

```bash
# Install ngrok (one time)
# Windows: download from https://ngrok.com
# Mac: brew install ngrok

# Run ngrok
ngrok http 3001
```

**You'll get something like:**
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3001
```

**Copy the https URL** (e.g., `https://abc123.ngrok.io`)

---

## STEP 3: SETUP TRADINGVIEW (5 min)

1. **Open TradingView**: https://tradingview.com

2. **Open any chart**: e.g., RELIANCE on NSE

3. **Open Pine Editor** (bottom panel)

4. **Copy this simple strategy:**

```pine
//@version=6
strategy("QuantForge Simple", overlay=true)

// Simple moving averages
fast = ta.sma(close, 20)
slow = ta.sma(close, 50)

// Buy when fast crosses above slow
longCondition = ta.crossover(fast, slow)
if (longCondition)
    strategy.entry("Buy", strategy.long)

// Sell when fast crosses below slow  
shortCondition = ta.crossunder(fast, slow)
if (shortCondition)
    strategy.entry("Sell", strategy.short)

plot(fast, color=color.blue)
plot(slow, color=color.orange)
```

5. **Click "Add to Chart"**

6. **Create Alert:**
   - Click "Alerts" (clock icon on right)
   - Click "+ Create Alert"
   - Condition: Select your strategy
   - Webhook URL: Enter your ngrok URL + `/api/webhook`
     Example: `https://abc123.ngrok.io/api/webhook`
   - Message: Enter this JSON:

```json
{
  "symbol": "{{ticker}}",
  "action": "{{strategy.order.action}}",
  "price": "{{strategy.order.price}}",
  "secret": "test"
}
```

7. **Click "Create"**

---

## STEP 4: TEST IT (2 min)

1. **Wait for alert to trigger** (when fast MA crosses slow MA)

2. **Check server console** - you should see:
```
========================================
📨 Received TradingView Alert:
========================================
{
  "symbol": "RELIANCE",
  "action": "BUY",
  "price": 2485.5,
  ...
}
📝 PAPER TRADE: BUY 10 RELIANCE @ 2485.5
```

3. **Or test manually with curl:**
```bash
curl -X POST http://localhost:3001/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"symbol":"RELIANCE","action":"BUY","price":2500}'
```

---

## 🎉 THAT'S IT!

You now have:
- ✅ TradingView sending signals to your server
- ✅ Server processing signals
- ✅ Paper trading (no real money)

---

## NEXT: GO LIVE WITH ZERODHA

When you're ready to trade real money:

1. **Get Kite API access** (₹2000/month): https://kite.trade
2. **Update .env file** with your API credentials
3. **Set PAPER_MODE=false**
4. **Start with minimum quantity**

See `INTEGRATION_GUIDE.md` for full details.

---

## TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| Alert not received | Check webhook URL is correct |
| "Connection refused" | Server not running or ngrok stopped |
| No trades | Check server logs for errors |
| Kite errors | Access token expired, regenerate |

---

## FILES REFERENCE

| File | Purpose |
|------|---------|
| `server/webhook-server.js` | Main server |
| `server/.env` | Configuration |
| `tradingview/pine-script-strategy.pine` | TradingView strategy |
| `INTEGRATION_GUIDE.md` | Full integration guide |
| `EVERYTHING_YOU_NEED.md` | Trading strategies & rules |

---

**Remember: Paper trade first, prove it works, then go live small!**
