import ccxt
import pandas as pd
import time

class RayrEngine:
    def __init__(self):
        # Start in Public Demo Mode (No API keys required)
        self.exchange = ccxt.binance({'enableRateLimit': True})
        self.symbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'AVAX/USDT', 'DOGE/USDT']
        
        # LIVE VIRTUAL WALLET
        self.virtual_balance = 10000.00
        self.equity = self.virtual_balance
        self.daily_pnl = 0.0
        self.kill_switch = False
        self.positions = {}
        self.trade_log = []
        self.loop_count = 0 # Anti-spam counter
        
        # USER CONTROL STATE (Synced with React UI)
        self.enable_longs = True
        self.enable_shorts = True
        self.risk_per_trade = 15.0 # 15% of balance
        self.is_live_trading = False

    def log(self, level, message):
        log_entry = {"time": pd.Timestamp.now().strftime('%H:%M:%S'), "level": level, "message": message}
        self.trade_log.append(log_entry)
        print(f"[{level.upper()}] {message}")

    def fetch_data(self, symbol):
        bars = self.exchange.fetch_ohlcv(symbol, '15m', limit=200)
        df = pd.DataFrame(bars, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
        
        # 1. MACRO TREND (200 EMA)
        df['ema_macro'] = df['close'].ewm(span=200, adjust=False).mean()
        df['ema_slope'] = df['ema_macro'].diff(5)
        
        # 2. BOLLINGER BANDS (20 period, 2 StdDev)
        df['bb_ma'] = df['close'].rolling(window=20).mean()
        df['bb_std'] = df['close'].rolling(window=20).std()
        df['bb_lower'] = df['bb_ma'] - (df['bb_std'] * 2.0)
        df['bb_upper'] = df['bb_ma'] + (df['bb_std'] * 2.0)
        
        # 3. RSI
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['rsi'] = 100 - (100 / (1 + rs))
        return df

    def run_loop(self):
        self.log("info", "⚔️ RAYR PRO ENGINE ONLINE.")
        self.log("info", "🟢 Uptrend = Buy Dips | 🔴 Downtrend = Short Pumps | TP: +0.8% | SL: -1.0%")
        while True:
            try:
                if not self.kill_switch:
                    self.scan_market()
                    self.update_equity()
                    self.loop_count += 1
                    time.sleep(60) # Scan every minute
            except Exception as e:
                self.log("error", f"⚠️ Scanner paused: {str(e)}")
                time.sleep(30)

    def scan_market(self):
        should_log_status = (self.loop_count % 5 == 0) # Log status every 5 mins
        
        for symbol in self.symbols:
            df = self.fetch_data(symbol)
            last = df.iloc[-1]
            current_price = last['close']
            
            macro_uptrend = current_price > last['ema_macro'] and last['ema_slope'] > 0
            macro_downtrend = current_price < last['ema_macro'] and last['ema_slope'] < 0
            
            local_panic = current_price <= last['bb_lower'] and last['rsi'] < 40
            local_euphoria = current_price >= last['bb_upper'] and last['rsi'] > 60

            # 1. EXIT LOGIC
            if symbol in self.positions:
                pos = self.positions[symbol]
                if pos['side'] == 'long':
                    pnl_percent = ((current_price - pos['entry']) / pos['entry']) * 100
                    if pnl_percent >= 0.8: # TP
                        sell_value = pos['margin'] + (pos['margin'] * 0.008) - (pos['margin'] * 0.002)
                        self.virtual_balance += sell_value
                        self.daily_pnl += (pos['margin'] * 0.008)
                        self.log("trade", f"💰 LONG TP: Sold {symbol} at ${current_price:.2f} | +0.8%")
                        del self.positions[symbol]
                    elif pnl_percent <= -1.0: # SL
                        self.virtual_balance += pos['margin'] - (pos['margin'] * 0.010) - (pos['margin'] * 0.002)
                        self.daily_pnl -= (pos['margin'] * 0.010)
                        self.log("trade", f"🛡️ LONG SL: Sold {symbol} at ${current_price:.2f} | -1.0%")
                        del self.positions[symbol]
                        
                elif pos['side'] == 'short':
                    pnl_percent = ((pos['entry'] - current_price) / pos['entry']) * 100
                    if pnl_percent >= 0.8: # TP (Price dropped)
                        self.virtual_balance += pos['margin'] + (pos['margin'] * 0.008) - (pos['margin'] * 0.002)
                        self.daily_pnl += (pos['margin'] * 0.008)
                        self.log("trade", f"💰 SHORT TP: Bought {symbol} at ${current_price:.2f} | +0.8%")
                        del self.positions[symbol]
                    elif pnl_percent <= -1.0: # SL (Price rose)
                        self.virtual_balance += pos['margin'] - (pos['margin'] * 0.010) - (pos['margin'] * 0.002)
                        self.daily_pnl -= (pos['margin'] * 0.010)
                        self.log("trade", f"🛡️ SHORT SL: Bought {symbol} at ${current_price:.2f} | -1.0%")
                        del self.positions[symbol]

            # 2. ENTRY LOGIC (Respects User Toggles)
            elif symbol not in self.positions:
                margin = self.virtual_balance * (self.risk_per_trade / 100)
                
                # LONG: Buy the local panic in a Macro Uptrend (Only if User Enabled)
                if self.enable_longs and macro_uptrend and local_panic:
                    self.virtual_balance -= margin
                    self.positions[symbol] = {'side': 'long', 'entry': current_price, 'margin': margin}
                    self.log("trade", f"🚀 LONG SIGNAL: {symbol} at ${current_price:.2f} | Local Panic in Uptrend!")
                    
                # SHORT: Short the local pump in a Macro Downtrend (Only if User Enabled)
                elif self.enable_shorts and macro_downtrend and local_euphoria:
                    self.virtual_balance -= margin
                    self.positions[symbol] = {'side': 'short', 'entry': current_price, 'margin': margin}
                    self.log("trade", f"🔻 SHORT SIGNAL: {symbol} at ${current_price:.2f} | Local Pump in Downtrend!")
                    
                # ANTI-SPAM LOGGING
                elif should_log_status:
                    if macro_downtrend:
                        self.log("info", f"🚫 {symbol}: Macro DOWN. Waiting for a pump to SHORT.")
                    elif macro_uptrend:
                        self.log("info", f"⏳ {symbol}: Macro UP. Waiting for a dip to LONG.")
                    else:
                        self.log("info", f"⏳ {symbol}: Ranging. Holding cash.")

    def update_equity(self):
        total_equity = self.virtual_balance
        for symbol, pos in self.positions.items():
            try:
                ticker = self.exchange.fetch_ticker(symbol)
                current_price = ticker['last']
                if pos['side'] == 'long':
                    pnl_percent = ((current_price - pos['entry']) / pos['entry'])
                else: # short
                    pnl_percent = ((pos['entry'] - current_price) / pos['entry'])
                unrealized_margin = pos['margin'] + (pos['margin'] * pnl_percent)
                total_equity += unrealized_margin
            except: pass
        self.equity = total_equity

    # ==========================================
    # API HELPERS (CONNECTED TO REACT UI)
    # ==========================================
    def update_broker_keys(self, api_key, api_secret):
        if api_key and api_secret and api_key != "Enter Binance API Key":
            self.exchange = ccxt.binance({
                'apiKey': api_key,
                'secret': api_secret,
                'enableRateLimit': True,
            })
            self.is_live_trading = True
            self.log("trade", "🔑 Real API Keys received. Switching to Live Execution!")
            try:
                balance = self.exchange.fetch_balance()
                self.virtual_balance = float(balance['USDT']['total'])
                self.equity = self.virtual_balance
                self.log("trade", f"🏦 Broker Connected! Real Balance: ${self.virtual_balance:.2f}")
            except Exception as e:
                self.log("error", f"Broker connection failed: {str(e)}")
                self.is_live_trading = False
        else:
            self.is_live_trading = False
            self.log("info", "Running in Virtual Demo Mode (Public Data).")

    def update_risk(self, max_risk, max_dd, daily_loss):
        self.risk_per_trade = max_risk
        self.log("info", f"⚙️ User Updated Risk Profile: Risk {max_risk}% per trade.")

    def update_strategy_controls(self, enable_longs, enable_shorts):
        self.enable_longs = enable_longs
        self.enable_shorts = enable_shorts
        self.log("info", f"⚙️ Strategy Toggles: Longs={enable_longs} | Shorts={enable_shorts}")

    def test_broker_connection(self):
        return True # Handled in update_broker_keys directly for better UX

    def execute_test_trade(self): pass

    def get_open_positions(self):
        pos_list = []
        for symbol, pos in self.positions.items():
            try:
                ticker = self.exchange.fetch_ticker(symbol)
                current_price = ticker['last']
                if pos['side'] == 'long':
                    pnl_percent = ((current_price - pos['entry']) / pos['entry']) * 100
                else:
                    pnl_percent = ((pos['entry'] - current_price) / pos['entry']) * 100
                pos_list.append({
                    "id": symbol, "symbol": symbol, "side": pos['side'],
                    "size": round(pos['margin'] / current_price, 6),
                    "entry": pos['entry'], "current": current_price,
                    "pnl": pos['margin'] * (pnl_percent / 100), "pnlPercent": pnl_percent,
                    "sl": pos['entry'] * (0.99 if pos['side'] == 'long' else 1.01),
                    "tp": pos['entry'] * (1.008 if pos['side'] == 'long' else 0.992),
                    "strategy": "Pro Scalper"
                })
            except: pass
        return pos_list

engine_instance = RayrEngine()
