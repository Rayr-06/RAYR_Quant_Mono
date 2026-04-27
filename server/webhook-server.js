/**
 * RAYR_Quant - TRADINGVIEW WEBHOOK SERVER
 * By Rayr-06 | github.com/Rayr-06
 * 
 * This server receives alerts from TradingView and processes them.
 * Run this locally or deploy to a VPS/cloud server.
 * 
 * SETUP:
 * 1. npm install express cors dotenv
 * 2. Create .env file with your settings
 * 3. Run: node server/webhook-server.js
 * 4. Use ngrok or deploy to cloud for public URL
 */

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple in-memory trade log
const tradeLog = [];
const activePositions = [];

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  // TradingView webhook secret (set this in TradingView alerts)
  webhookSecret: process.env.WEBHOOK_SECRET || 'your-secret-key-here',
  
  // Risk management
  maxRiskPerTrade: 0.01,      // 1% of capital
  maxDailyLoss: 0.02,         // 2% daily loss limit
  maxPositions: 5,            // Maximum concurrent positions
  
  // Zerodha Kite API (set in .env)
  kiteApiKey: process.env.KITE_API_KEY || '',
  kiteApiSecret: process.env.KITE_API_SECRET || '',
  kiteAccessToken: process.env.KITE_ACCESS_TOKEN || '',
  
  // Capital
  initialCapital: 500000,     // ₹5,00,000
};

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
function authenticateWebhook(req, res, next) {
  const secret = req.headers['x-webhook-secret'] || req.body.secret;
  
  // In production, validate the secret
  // For now, we'll log and continue
  if (secret !== CONFIG.webhookSecret) {
    console.log('⚠️  Warning: Invalid webhook secret received');
    // In production, return 401
    // return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
}

// ============================================
// WEBHOOK ENDPOINT - TradingView calls this
// ============================================
app.post('/api/webhook', authenticateWebhook, (req, res) => {
  try {
    const payload = req.body;
    
    console.log('\n========================================');
    console.log('📨 Received TradingView Alert:');
    console.log('========================================');
    console.log(JSON.stringify(payload, null, 2));
    
    // Parse the TradingView signal
    const signal = parseTradingViewSignal(payload);
    
    // Log the signal
    tradeLog.push({
      timestamp: new Date().toISOString(),
      signal,
      status: 'received',
    });
    
    // Risk check
    const riskCheck = performRiskCheck(signal);
    
    if (!riskCheck.allowed) {
      console.log(`❌ Risk check failed: ${riskCheck.reason}`);
      tradeLog[tradeLog.length - 1].status = 'rejected';
      tradeLog[tradeLog.length - 1].reason = riskCheck.reason;
      
      return res.json({
        success: false,
        message: riskCheck.reason,
      });
    }
    
    // If PAPER_MODE, just log it
    if (process.env.PAPER_MODE === 'true') {
      console.log(`📝 PAPER TRADE: ${signal.action} ${signal.quantity} ${signal.symbol} @ ${signal.price}`);
      tradeLog[tradeLog.length - 1].status = 'paper_trade';
      
      return res.json({
        success: true,
        mode: 'paper',
        message: `Paper trade logged: ${signal.action} ${signal.symbol}`,
      });
    }
    
    // In production, execute via Kite API
    // executeTrade(signal);
    
    res.json({
      success: true,
      mode: process.env.PAPER_MODE === 'true' ? 'paper' : 'live',
      message: `Signal processed: ${signal.action} ${signal.symbol}`,
    });
    
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// PARSE TRADINGVIEW SIGNAL
// ============================================
function parseTradingViewSignal(payload) {
  // TradingView can send signals in different formats
  // This handles common formats
  
  let signal = {
    symbol: '',
    action: '',
    price: 0,
    quantity: 0,
    stopLoss: 0,
    takeProfit: 0,
    strategy: '',
    timestamp: new Date().toISOString(),
  };
  
  // Format 1: Standard JSON format
  if (payload.symbol && payload.action) {
    signal.symbol = payload.symbol;
    signal.action = payload.action.toUpperCase();
    signal.price = parseFloat(payload.price) || 0;
    signal.quantity = parseInt(payload.quantity) || 0;
    signal.stopLoss = parseFloat(payload.stopLoss) || 0;
    signal.takeProfit = parseFloat(payload.takeProfit) || 0;
    signal.strategy = payload.strategy || 'TradingView';
  }
  
  // Format 2: Pine Script alert_message format
  // Example: "BUY RELIANCE @ 2500 SL 2450 TP 2600 QTY 10"
  else if (payload.alert_message) {
    const msg = payload.alert_message;
    const parts = msg.split(' ');
    
    signal.action = parts[0]?.toUpperCase() || 'BUY';
    signal.symbol = parts[1] || '';
    signal.price = parseFloat(parts[3]) || 0;
    signal.stopLoss = parseFloat(parts[5]) || 0;
    signal.takeProfit = parseFloat(parts[7]) || 0;
    signal.quantity = parseInt(parts[9]) || 1;
  }
  
  // Format 3: Simple string format
  // Example: "BUY:RELIANCE:2500:10"
  else if (typeof payload === 'string') {
    const parts = payload.split(':');
    signal.action = parts[0]?.toUpperCase() || 'BUY';
    signal.symbol = parts[1] || '';
    signal.price = parseFloat(parts[2]) || 0;
    signal.quantity = parseInt(parts[3]) || 1;
  }
  
  // Calculate quantity if not provided
  if (!signal.quantity && signal.price > 0) {
    const riskAmount = CONFIG.initialCapital * CONFIG.maxRiskPerTrade;
    const riskPerShare = signal.stopLoss ? Math.abs(signal.price - signal.stopLoss) : signal.price * 0.02;
    signal.quantity = Math.floor(riskAmount / riskPerShare);
  }
  
  return signal;
}

// ============================================
// RISK MANAGEMENT
// ============================================
function performRiskCheck(signal) {
  // Check 1: Valid signal
  if (!signal.symbol || !signal.action) {
    return { allowed: false, reason: 'Invalid signal: missing symbol or action' };
  }
  
  // Check 2: Maximum positions
  if (signal.action !== 'CLOSE' && activePositions.length >= CONFIG.maxPositions) {
    return { allowed: false, reason: `Maximum positions reached (${CONFIG.maxPositions})` };
  }
  
  // Check 3: Daily loss limit
  const todayPnL = tradeLog
    .filter(t => t.timestamp.startsWith(new Date().toISOString().split('T')[0]))
    .reduce((sum, t) => sum + (t.pnl || 0), 0);
    
  const dailyLossLimit = CONFIG.initialCapital * CONFIG.maxDailyLoss;
  if (todayPnL < -dailyLossLimit) {
    return { allowed: false, reason: 'Daily loss limit reached' };
  }
  
  // Check 4: Duplicate position
  if (activePositions.find(p => p.symbol === signal.symbol && p.action === signal.action)) {
    return { allowed: false, reason: 'Duplicate position already exists' };
  }
  
  // Check 5: Risk-reward ratio
  if (signal.stopLoss && signal.takeProfit && signal.price) {
    const risk = Math.abs(signal.price - signal.stopLoss);
    const reward = Math.abs(signal.takeProfit - signal.price);
    const rr = reward / risk;
    
    if (rr < 2) {
      return { allowed: false, reason: `Risk-reward ratio too low: ${rr.toFixed(2)} (minimum 2:1)` };
    }
  }
  
  return { allowed: true, reason: 'All checks passed' };
}

// ============================================
// ZERODHA KITE API INTEGRATION
// ============================================
async function executeTrade(signal) {
  // This is a placeholder for actual Kite API integration
  // You'll need to use the kiteconnect library
  
  console.log(`\n🚀 Executing trade via Kite API:`);
  console.log(`   Symbol: ${signal.symbol}`);
  console.log(`   Action: ${signal.action}`);
  console.log(`   Quantity: ${signal.quantity}`);
  console.log(`   Price: ${signal.price}`);
  
  // Example Kite API call (uncomment and configure):
  /*
  const KiteConnect = require('kiteconnect').default;
  
  const kc = new KiteConnect({
    api_key: CONFIG.kiteApiKey,
  });
  
  kc.setAccessToken(CONFIG.kiteAccessToken);
  
  try {
    const orderId = await kc.placeOrder('REGULAR', {
      exchange: 'NSE',
      tradingsymbol: signal.symbol,
      transaction_type: signal.action === 'BUY' ? kc.TRANSACTION_TYPE_BUY : kc.TRANSACTION_TYPE_SELL,
      order_type: signal.price ? kc.ORDER_TYPE_LIMIT : kc.ORDER_TYPE_MARKET,
      quantity: signal.quantity,
      price: signal.price,
      product: 'MIS', // Intraday
      validity: 'DAY',
    });
    
    console.log(`✅ Order placed: ${orderId}`);
    
    // Set stop loss order
    if (signal.stopLoss) {
      await kc.placeOrder('REGULAR', {
        exchange: 'NSE',
        tradingsymbol: signal.symbol,
        transaction_type: signal.action === 'BUY' ? kc.TRANSACTION_TYPE_SELL : kc.TRANSACTION_TYPE_BUY,
        order_type: 'SL',
        quantity: signal.quantity,
        trigger_price: signal.stopLoss,
        product: 'MIS',
        validity: 'DAY',
      });
    }
    
    return orderId;
  } catch (error) {
    console.error('❌ Kite API error:', error);
    throw error;
  }
  */
  
  return 'PAPER-ORDER-' + Date.now();
}

// ============================================
// API ENDPOINTS
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mode: process.env.PAPER_MODE === 'true' ? 'paper' : 'live',
  });
});

// Get trade log
app.get('/api/trades', (req, res) => {
  res.json({
    trades: tradeLog,
    count: tradeLog.length,
  });
});

// Get active positions
app.get('/api/positions', (req, res) => {
  res.json({
    positions: activePositions,
    count: activePositions.length,
  });
});

// Manual trade execution (for testing)
app.post('/api/manual-trade', (req, res) => {
  const { symbol, action, quantity, price } = req.body;
  
  const signal = {
    symbol,
    action: action.toUpperCase(),
    price: parseFloat(price) || 0,
    quantity: parseInt(quantity) || 1,
    stopLoss: 0,
    takeProfit: 0,
    strategy: 'Manual',
    timestamp: new Date().toISOString(),
  };
  
  console.log(`\n📝 Manual trade requested:`, signal);
  
  tradeLog.push({
    timestamp: new Date().toISOString(),
    signal,
    status: 'manual',
  });
  
  res.json({
    success: true,
    message: 'Manual trade logged',
    trade: signal,
  });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('⚡ RAYR_Quant Webhook Server');
  console.log('   By Rayr-06 | github.com/Rayr-06');
  console.log('========================================');
  console.log(`📡 Running on port ${PORT}`);
  console.log(`🔗 Webhook URL: http://localhost:${PORT}/api/webhook`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Paper Mode: ${process.env.PAPER_MODE === 'true' ? 'ON' : 'OFF'}`);
  console.log('========================================\n');
  console.log('Waiting for TradingView alerts...\n');
});
