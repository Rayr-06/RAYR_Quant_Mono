# 📡 API Reference

Complete API documentation for Rayr QuantForge webhook server.

---

## Base URL

```
Development: http://localhost:3001
Production:  https://your-domain.com
```

---

## 🔐 Authentication

### Webhook Authentication

All webhook requests should include the secret in the header or body:

```bash
# Header method
curl -X POST http://localhost:3001/api/webhook \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: your-secret-key" \
  -d '{"symbol": "RELIANCE", "action": "BUY"}'

# Body method
curl -X POST http://localhost:3001/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"symbol": "RELIANCE", "action": "BUY", "secret": "your-secret-key"}'
```

---

## 📨 Endpoints

### POST /api/webhook

Receive trading signals from TradingView or other sources.

**Request Body:**

```json
{
  "symbol": "RELIANCE",
  "action": "BUY",
  "price": 2500,
  "quantity": 10,
  "stopLoss": 2450,
  "takeProfit": 2600,
  "strategy": "Momentum",
  "secret": "your-secret-key"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| symbol | string | Yes | Trading symbol (e.g., RELIANCE, TCS) |
| action | string | Yes | BUY, SELL, or CLOSE |
| price | number | No | Limit price (0 for market) |
| quantity | number | No | Number of shares (auto-calculated if missing) |
| stopLoss | number | No | Stop loss price |
| takeProfit | number | No | Take profit price |
| strategy | string | No | Strategy name |
| secret | string | No | Webhook secret (can use header instead) |

**Response (Success):**

```json
{
  "success": true,
  "mode": "paper",
  "message": "Signal processed: BUY RELIANCE"
}
```

**Response (Rejected):**

```json
{
  "success": false,
  "message": "Daily loss limit reached"
}
```

---

### GET /api/health

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T14:30:00.000Z",
  "mode": "paper"
}
```

---

### GET /api/trades

Get trade log history.

**Response:**

```json
{
  "trades": [
    {
      "timestamp": "2024-01-15T14:30:00.000Z",
      "signal": {
        "symbol": "RELIANCE",
        "action": "BUY",
        "price": 2500,
        "quantity": 10
      },
      "status": "executed"
    }
  ],
  "count": 1
}
```

---

### GET /api/positions

Get active positions.

**Response:**

```json
{
  "positions": [
    {
      "symbol": "RELIANCE",
      "side": "LONG",
      "quantity": 10,
      "entryPrice": 2500,
      "currentPrice": 2520,
      "pnl": 200
    }
  ],
  "count": 1
}
```

---

### POST /api/manual-trade

Execute a manual trade (for testing).

**Request Body:**

```json
{
  "symbol": "RELIANCE",
  "action": "BUY",
  "quantity": 10,
  "price": 2500
}
```

**Response:**

```json
{
  "success": true,
  "message": "Manual trade logged",
  "trade": {
    "symbol": "RELIANCE",
    "action": "BUY",
    "quantity": 10,
    "price": 2500
  }
}
```

---

## 📊 Signal Formats

### Format 1: Standard JSON

```json
{
  "symbol": "RELIANCE",
  "action": "BUY",
  "price": 2500,
  "quantity": 10
}
```

### Format 2: Pine Script Alert Message

```
BUY RELIANCE @ 2500 SL 2450 TP 2600 QTY 10
```

### Format 3: Simple String

```
BUY:RELIANCE:2500:10
```

---

## ⚠️ Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (invalid signal) |
| 401 | Unauthorized (invalid secret) |
| 500 | Internal Server Error |

### Error Response

```json
{
  "success": false,
  "error": "Invalid signal: missing symbol"
}
```

---

## 🔒 Security

### Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per API key

### Input Validation

- Symbol: Alphanumeric only, max 20 chars
- Action: Must be BUY, SELL, or CLOSE
- Price: Must be positive number
- Quantity: Must be positive integer

---

## 📝 TradingView Setup

### Webhook URL

```
https://your-server.com/api/webhook
```

### Alert Message Format

```json
{
  "symbol": "{{ticker}}",
  "action": "{{strategy.order.action}}",
  "price": "{{strategy.order.price}}",
  "quantity": "{{strategy.order.contracts}}",
  "stopLoss": {{plot("Stop Loss")}},
  "takeProfit": {{plot("Take Profit")}},
  "strategy": "Momentum",
  "secret": "your-secret-key"
}
```

### Variables Available

| Variable | Description |
|----------|-------------|
| `{{ticker}}` | Symbol name |
| `{{close}}` | Current close price |
| `{{open}}` | Current open price |
| `{{high}}` | Current high |
| `{{low}}` | Current low |
| `{{volume}}` | Current volume |
| `{{time}}` | Current timestamp |
| `{{strategy.order.action}}` | Order action |
| `{{strategy.order.price}}` | Order price |
| `{{strategy.order.contracts}}` | Order quantity |

---

## 🧪 Testing

### Test with cURL

```bash
# Health check
curl http://localhost:3001/api/health

# Send test signal
curl -X POST http://localhost:3001/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "RELIANCE",
    "action": "BUY",
    "price": 2500,
    "quantity": 10,
    "secret": "test"
  }'

# Get trades
curl http://localhost:3001/api/trades

# Get positions
curl http://localhost:3001/api/positions
```

### Test with Postman

1. Create new request
2. Set method to POST
3. Set URL to `http://localhost:3001/api/webhook`
4. Set Body to raw JSON
5. Paste test payload
6. Send

---

## 📚 Examples

### Example 1: Long Entry

```json
{
  "symbol": "RELIANCE",
  "action": "BUY",
  "price": 2500,
  "quantity": 10,
  "stopLoss": 2450,
  "takeProfit": 2600,
  "strategy": "Trend Following"
}
```

### Example 2: Short Entry

```json
{
  "symbol": "TCS",
  "action": "SELL",
  "price": 3800,
  "quantity": 5,
  "stopLoss": 3850,
  "takeProfit": 3700,
  "strategy": "Mean Reversion"
}
```

### Example 3: Close Position

```json
{
  "symbol": "RELIANCE",
  "action": "CLOSE",
  "strategy": "Manual"
}
```

---

**API Version: 1.0.0**
**Last Updated: January 2024**

**Built by [Rayr-06](https://github.com/Rayr-06)**
