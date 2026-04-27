# 🚀 Deployment Guide

Complete guide to deploy Rayr QuantForge to production.

---

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git
- TradingView account (for alerts)
- Zerodha account with Kite API access (for live trading)

---

## 🏠 Option 1: Local Development

### Step 1: Clone Repository

```bash
git clone https://github.com/Rayr-06/rayr-quantforge.git
cd rayr-quantforge
```

### Step 2: Install Dependencies

```bash
# Frontend
npm install

# Server
cd server
npm install
cd ..
```

### Step 3: Configure Environment

```bash
# Edit server/.env
PAPER_MODE=true
WEBHOOK_SECRET=your-secret-key
```

### Step 4: Start Services

```bash
# Terminal 1: Dashboard
npm run dev

# Terminal 2: Server
cd server
node webhook-server.js

# Terminal 3: ngrok (for TradingView)
ngrok http 3001
```

### Step 5: Configure TradingView

1. Use ngrok URL in TradingView alerts
2. Format: `https://your-ngrok-url/api/webhook`

---

## ☁️ Option 2: Cloud Deployment (Recommended)

### A. Deploy to Railway (Easiest)

**Step 1: Sign up**
- Go to https://railway.app
- Sign up with GitHub

**Step 2: New Project**
- Click "New Project"
- Select "Deploy from GitHub repo"
- Select your repository

**Step 3: Configure**
- Set root directory to `server`
- Add environment variables
- Deploy!

**Step 4: Add Domain**
- Go to Settings → Networking
- Generate domain
- Use this URL in TradingView

---

### B. Deploy to Render

**Step 1: Sign up**
- Go to https://render.com
- Sign up with GitHub

**Step 2: New Web Service**
- Click "New" → "Web Service"
- Connect GitHub repository

**Step 3: Configure**
- Name: `quantforge-server`
- Root Directory: `server`
- Runtime: Node
- Build Command: `npm install`
- Start Command: `node webhook-server.js`

**Step 4: Add Environment**
- Go to Environment tab
- Add your `.env` variables

**Step 5: Deploy**
- Click "Create Web Service"
- Wait for deployment
- Note the URL

---

### C. Deploy to DigitalOcean

**Step 1: Create Droplet**
- Go to https://m.do.co/c/your-referral
- Create $5/mo droplet
- Ubuntu 22.04

**Step 2: SSH into Server**
```bash
ssh root@your-droplet-ip
```

**Step 3: Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Step 4: Clone and Setup**
```bash
git clone https://github.com/Rayr-06/rayr-quantforge.git
cd rayr-quantforge/server
npm install
```

**Step 5: Configure**
```bash
nano .env
# Add your configuration
```

**Step 6: Run with PM2**
```bash
npm install -g pm2
pm2 start webhook-server.js
pm2 startup
pm2 save
```

**Step 7: Add SSL with Certbot**
```bash
sudo apt install certbot
sudo certbot --nginx
```

---

### D. Deploy to Heroku

**Step 1: Install Heroku CLI**
```bash
# Mac
brew tap heroku/brew && brew install heroku

# Windows
https://devcenter.heroku.com/articles/heroku-cli
```

**Step 2: Login**
```bash
heroku login
```

**Step 3: Create App**
```bash
cd server
heroku create quantforge-server
```

**Step 4: Configure**
```bash
heroku config:set PAPER_MODE=true
heroku config:set WEBHOOK_SECRET=your-secret
```

**Step 5: Deploy**
```bash
git init
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

---

## 🐳 Option 3: Docker Deployment

### Dockerfile (server)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3001

CMD ["node", "webhook-server.js"]
```

### Build and Run

```bash
cd server

# Build image
docker build -t quantforge-server .

# Run container
docker run -d \
  --name quantforge \
  -p 3001:3001 \
  -e PAPER_MODE=true \
  -e WEBHOOK_SECRET=your-secret \
  quantforge-server
```

---

## 🔐 SSL/HTTPS Setup

### Using Let's Encrypt (Free)

```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Certificate locations
/etc/letsencrypt/live/your-domain.com/fullchain.pem
/etc/letsencrypt/live/your-domain.com/privkey.pem
```

### Update Server for HTTPS

```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/your-domain.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/your-domain.com/fullchain.pem')
};

https.createServer(options, app).listen(PORT);
```

---

## 📊 Monitoring

### Health Check

```bash
curl https://your-domain.com/api/health
```

### Logs

```bash
# PM2
pm2 logs quantforge

# Docker
docker logs quantforge

# systemd
journalctl -u quantforge -f
```

### Uptime Monitoring

Use one of these services:
- https://uptimerobot.com (Free)
- https://betterstack.com
- https://cronitor.io

---

## 🔄 Updating

### Pull Changes

```bash
git pull origin main
npm install
cd server && npm install && cd ..
```

### Restart Server

```bash
# PM2
pm2 restart quantforge

# Docker
docker restart quantforge

# systemd
sudo systemctl restart quantforge
```

---

## ⚠️ Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Secrets not in code
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Paper trading tested
- [ ] Risk limits verified
- [ ] Kill switch tested
- [ ] Zerodha API tokens valid

---

## 🆘 Troubleshooting

### Issue: Server won't start

```bash
# Check logs
pm2 logs quantforge

# Common fixes
npm install
node -v  # Ensure Node 18+
```

### Issue: Can't connect to Zerodha

```bash
# Check token
echo $KITE_ACCESS_TOKEN

# Regenerate token
# Follow: https://kite.trade/docs/connect/v3/python/
```

### Issue: Webhook not receiving

```bash
# Test locally
curl http://localhost:3001/api/health

# Check firewall
sudo ufw status

# Check port
netstat -tlnp | grep 3001
```

---

## 📞 Support

If you need help with deployment:

1. Check this documentation
2. Search [existing issues](https://github.com/Rayr-06/rayr-quantforge/issues)
3. Create a new issue
4. Contact [@Rayr-06](https://github.com/Rayr-06)

---

**Made with ❤️ by [Rayr-06](https://github.com/Rayr-06)**
