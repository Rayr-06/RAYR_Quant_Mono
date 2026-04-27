#!/bin/bash

# ============================================
# RAYR_Quant Setup Script
# By Rayr-06
# ============================================

clear

echo ""
echo "  ██████╗  █████╗  ██████╗██╗  ██╗███╗   ██╗███████╗████████╗"
echo "  ██╔══██╗██╔══██╗██╔════╝██║ ██╔╝████╗  ██║██╔════╝╚══██╔══╝"
echo "  ██████╔╝███████║██║     █████╔╝ ██╔██╗ ██║█████╗     ██║   "
echo "  ██╔══██╗██╔══██║██║     ██╔═██╗ ██║╚██╗██║██╔══╝     ██║   "
echo "  ██║  ██║██║  ██║╚██████╗██║  ██╗██║ ╚████║███████╗   ██║   "
echo "  ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝   ╚═╝   "
echo ""
echo "  ══════════════════════════════════════════════════════════════"
echo "   RAYR_Quant - Professional Automated Trading System"
echo "   By: Rayr-06 | github.com/Rayr-06"
echo "  ══════════════════════════════════════════════════════════════"
echo ""

# Check prerequisites
echo "[1/8] Checking prerequisites..."

if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed!"
    echo "   Install: sudo apt install git"
    exit 1
fi
echo "✅ Git found"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "   Install: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi
echo "✅ Node.js found"

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    exit 1
fi
echo "✅ npm found"

echo ""

# Get user input
echo "[2/8] Configuration"
echo ""
read -p "Enter your GitHub username (Rayr-06): " GITHUB_USERNAME
GITHUB_USERNAME=${GITHUB_USERNAME:-Rayr-06}

read -p "Enter repository name (RAYR_Quant): " REPO_NAME
REPO_NAME=${REPO_NAME:-RAYR_Quant}

read -p "Enter webhook secret (or press Enter for default): " WEBHOOK_SECRET
WEBHOOK_SECRET=${WEBHOOK_SECRET:-rayr-quant-secret-2024}

echo ""

# Update configuration
echo "[3/8] Updating configuration files..."

cat > server/.env << EOF
# RAYR_Quant Configuration
# By Rayr-06

# Server
PORT=3001

# Trading Mode (true = paper, false = live)
PAPER_MODE=true

# Webhook Security
WEBHOOK_SECRET=${WEBHOOK_SECRET}

# Zerodha Kite API
KITE_API_KEY=your-api-key-here
KITE_API_SECRET=your-api-secret-here
KITE_ACCESS_TOKEN=your-access-token-here

# Risk Management
MAX_RISK_PER_TRADE=1
MAX_DAILY_LOSS=2
MAX_POSITIONS=5
INITIAL_CAPITAL=500000
EOF

echo "✅ Configuration updated"
echo ""

# Initialize git
echo "[4/8] Initializing Git repository..."
git init
git branch -M main
echo "✅ Git initialized"
echo ""

# Install dependencies
echo "[5/8] Installing dependencies..."
echo "Installing frontend dependencies..."
npm install --silent
echo "Installing server dependencies..."
cd server && npm install --silent && cd ..
echo "✅ Dependencies installed"
echo ""

# Build project
echo "[6/8] Building project..."
npm run build
echo "✅ Build complete"
echo ""

# Add and commit
echo "[7/8] Creating initial commit..."
git add .
git commit -m "🎉 Initial commit: RAYR_Quant v1.0.0

- Professional trading dashboard with React + TypeScript
- TradingView webhook integration
- Zerodha Kite API support
- 4 proven trading strategies
- Complete risk management system
- Paper trading mode
- Full documentation

By Rayr-06 | github.com/Rayr-06"
echo "✅ Commit created"
echo ""

# Push to GitHub
echo "[8/8] Pushing to GitHub..."
echo ""
echo "⚠️  Make sure you have created the repository on GitHub first!"
echo "     Go to: https://github.com/new"
echo "     Name: ${REPO_NAME}"
echo ""
read -p "Press Enter when ready..."

git remote remove origin 2>/dev/null
git remote add origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
git push -u origin main

echo ""
echo "  ══════════════════════════════════════════════════════════════"
echo "   ✅ SETUP COMPLETE!"
echo "  ══════════════════════════════════════════════════════════════"
echo ""
echo "  📦 Repository: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
echo ""
echo "  🚀 Next Steps:"
echo "     1. Start dashboard: npm run dev"
echo "     2. Start server: cd server && node webhook-server.js"
echo "     3. Start ngrok: ngrok http 3001"
echo "     4. Setup TradingView alerts"
echo ""
echo "  📚 Documentation:"
echo "     - MANUAL.md (Complete guide)"
echo "     - QUICK_START.md (10-min setup)"
echo "     - INTEGRATION_GUIDE.md (TradingView)"
echo ""
echo "  ══════════════════════════════════════════════════════════════"
echo "   Built with <3 by Rayr-06"
echo "  ══════════════════════════════════════════════════════════════"
echo ""
