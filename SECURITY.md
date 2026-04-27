# 🔒 Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability within Rayr QuantForge, please send an email to **Rayr-06** via [GitHub](https://github.com/Rayr-06). All security vulnerabilities will be promptly addressed.

**Please do NOT report security vulnerabilities through public GitHub issues.**

---

## 🔐 Security Best Practices

### API Keys & Secrets

**NEVER commit these to Git:**
- API keys
- Access tokens
- Passwords
- Webhook secrets

These are already in `.gitignore` but always double-check!

### Environment Variables

Always store sensitive data in `.env` files:

```bash
# server/.env
KITE_API_KEY=your-key-here
KITE_API_SECRET=your-secret-here
WEBHOOK_SECRET=your-webhook-secret
```

### Webhook Security

1. **Always use webhook secrets** in TradingView alerts
2. **Validate incoming webhooks** on your server
3. **Use HTTPS** in production
4. **Rate limit** webhook endpoints

### Broker API Security

1. **Regenerate tokens** regularly (Zerodha tokens expire daily)
2. **Use IP whitelisting** if available
3. **Monitor API usage** for unauthorized access
4. **Never share API credentials**

---

## 🛡️ Risk Management Security

### Built-in Protections

```typescript
// These limits are ENFORCED by the system
MAX_RISK_PER_TRADE = 1%    // Maximum risk per trade
MAX_DAILY_LOSS = 2%        // Maximum daily loss
MAX_POSITIONS = 5          // Maximum concurrent positions
KILL_SWITCH = true         // Emergency stop available
```

### Kill Switch

The kill switch immediately:
1. Cancels all pending orders
2. Stops all strategy signals
3. Logs the event
4. Sends an alert (if configured)

**Always know where the kill switch is!**

---

## 🔑 Authentication Flow

### TradingView → Server

```
TradingView Alert
       ↓
   [Validate Secret]
       ↓
   [Check Risk Limits]
       ↓
   [Execute Trade]
```

### Server → Zerodha Kite

```
Server Request
       ↓
   [Validate Token]
       ↓
   [Check Margins]
       ↓
   [Place Order]
```

---

## 🚨 Incident Response

If you suspect unauthorized access:

1. **Immediately activate kill switch**
2. **Revoke all API tokens**
3. **Change all passwords**
4. **Review trade history**
5. **Contact your broker**
6. **Report the incident**

---

## 📋 Security Checklist

### Before Going Live

- [ ] All secrets in `.env` (not in code)
- [ ] `.gitignore` includes `.env`
- [ ] Webhook secret configured
- [ ] Risk limits set appropriately
- [ ] Kill switch tested
- [ ] Broker 2FA enabled
- [ ] Email alerts configured

### Daily

- [ ] Review overnight positions
- [ ] Check for unauthorized trades
- [ ] Verify API token status

### Weekly

- [ ] Review trade log
- [ ] Check system logs
- [ ] Update if needed

---

## 📞 Contact

For security issues, contact **Rayr-06**:
- GitHub: [@Rayr-06](https://github.com/Rayr-06)

---

## 🔄 Updates

This security policy is updated as needed. Last updated: January 2024.
