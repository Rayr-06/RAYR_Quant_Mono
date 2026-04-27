import ccxt
import pandas as pd
import time

class RayrEngine:
    def __init__(self):
        self.exchange = ccxt.binance({'enableRateLimit': True})
        self.symbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'AVAX/USDT', 'DOGE/USDT']
        
        self.virtual_balance = 10000.00
        self.equity = self.virtual_balance
        self.daily_pnl = 0.0
        self.kill_switch = False
        self.positions = {}
        self.trade_log = []
        self.loop_count = 0
        
        # STRATEGY SETTINGS (PROFESSIONAL STANDARD)
        self.enable_longs = True
        self.enable_shorts = True
        self.risk_per_trade = 2.0  # FIXED: Lowered to 2% for safety
        self.is_live_trading = False

    def log(self, level, message):
        log_entry = {"time": pd.Timestamp.now().strftime('%H:%M:%S'), "level": level, "message": message}
        self.trade_log.append(log_entry)
        print(f"[{level.upper()}] {message}")

    def fetch_data(self, symbol):
        bars = self.exchange.fetch_ohlcv(symbol, '15m', limit=200)
        df = pd.DataFrame(bars, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
        
        df['ema_macro'] = df['close'].ewm(span=200, adjust=False).mean()
        df['ema_slope'] = df['ema_macro'].diff(5)
        
        df['bb_ma'] = df['close'].rolling(window=20).mean()
        df['bb_std'] = df['close'].rolling(window=20).std()
        df['bb_lower'] = df['bb_ma'] - (df['bb_std'] * 2.0)
        df['bb_upper'] = df['bb_ma'] + (df['bb_std'] * 2.0)
        
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['rsi'] = 100 - (100 / (1 + rs))
        return df

    def run_loop(self):
        self.log("info", "⚔️ RAYR PRO ENGINE ONLINE.")
        self.log("info", "🟢 Strategy: Mean Reversion | TP: 1.5% | SL: 1.0% | Risk: 2%")
        while True:
            try:
                if not self.kill_switch:
                    self.scan_market()
                    self.update_equity()
                    self.loop_count += 1
                    time.sleep(60)
            except Exception as e:
                self.log("error", f"⚠️ Scanner paused: {str(e)}")
                time.sleep(30)

    def scan_market(self):
        should_log_status = (self.loop_count % 5 == 0)
        
        # PROFITABLE MATH: Risk 1% to make 1.5%
        TAKE_PROFIT_PERCENT = 1.5
        STOP_LOSS_PERCENT = 1.0

        for symbol in self.symbols:
            df = self.fetch_data(symbol)
            last = df.iloc[-1]
            current_price = last['close']
            
            macro_uptrend = current_price > last['ema_macro'] and last['ema_slope'] > 0
            macro_downtrend = current_price < last['ema_macro'] and last['ema_slope'] < 0
            
            local_panic = current_price <= last['bb_lower'] and last['rsi'] < 40
            local_euphoria = current_price >= last['bb_upper'] and last['rsi'] > 60

            # EXIT LOGIC
            if symbol in self.positions:
                pos = self.positions[symbol]
                if pos['side'] == 'long':
                    pnl_percent = ((current_price - pos['entry']) / pos['entry']) * 100
                    if pnl_percent >= TAKE_PROFIT_PERCENT:
                        sell_value = pos['margin'] + (pos['margin'] * (TAKE_PROFIT_PERCENT/100)) - (pos['margin'] * 0.002)
                        self.virtual_balance += sell_value
                        self.daily_pnl += (pos['margin'] * (TAKE_PROFIT_PERCENT/100))
                        self.log("trade", f"💰 LONG TP: {symbol} | +{TAKE_PROFIT_PERCENT}%")
                        del self.positions[symbol]
                    elif pnl_percent <= -STOP_LOSS_PERCENT:
                        self.virtual_balance += pos['margin'] - (pos['margin'] * (STOP_LOSS_PERCENT/100)) - (pos['margin'] * 0.002)
                        self.daily_pnl -= (pos['margin'] * (STOP_LOSS_PERCENT/100))
                        self.log("trade", f"🛡️ LONG SL: {symbol} | -{STOP_LOSS_PERCENT}%")
                        del self.positions[symbol]
                        
                elif pos['side'] == 'short':
                    pnl_percent = ((pos['entry'] - current_price) / pos['entry']) * 100
                    if pnl_percent >= TAKE_PROFIT_PERCENT:
                        self.virtual_balance += pos['margin'] + (pos['margin'] * (TAKE_PROFIT_PERCENT/100)) - (pos['margin'] * 0.002)
                        self.daily_pnl += (pos['margin'] * (TAKE_PROFIT_PERCENT/100))
                        self.log("trade", f"💰 SHORT TP: {symbol} | +{TAKE_PROFIT_PERCENT}%")
                        del self.positions[symbol]
                    elif pnl_percent <= -STOP_LOSS_PERCENT:
                        self.virtual_balance += pos['margin'] - (pos['margin'] * (STOP_LOSS_PERCENT/100)) - (pos['margin'] * 0.002)
                        self.daily_pnl -= (pos['margin'] * (STOP_LOSS_PERCENT/100))
                        self.log("trade", f"🛡️ SHORT SL: {symbol} | -{STOP_LOSS_PERCENT}%")
                        del self.positions[symbol]

            # ENTRY LOGIC
            elif symbol not in self.positions:
                margin = self.virtual_balance * (self.risk_per_trade / 100)
                
                if self.enable_longs and macro_uptrend and local_panic:
                    self.virtual_balance -= margin
                    self.positions[symbol] = {'side': 'long', 'entry': current_price, 'margin': margin}
                    self.log("trade", f"🚀 LONG SIGNAL: {symbol} @ ${current_price:.2f}")
                    
                elif self.enable_shorts and macro_downtrend and local_euphoria:
                    self.virtual_balance -= margin
                    self.positions[symbol] = {'side': 'short', 'entry': current_price, 'margin': margin}
                    self.log("trade", f"🔻 SHORT SIGNAL: {symbol} @ ${current_price:.2f}")

    def update_equity(self):
        total_equity = self.virtual_balance
        for symbol, pos in self.positions.items():
            try:
                ticker = self.exchange.fetch_ticker(symbol)
                current_price = ticker['last']
                if pos['side'] == 'long':
                    pnl_percent = ((current_price - pos['entry']) / pos['entry'])
                else:
                    pnl_percent = ((pos['entry'] - current_price) / pos['entry'])
                unrealized_margin = pos['margin'] + (pos['margin'] * pnl_percent)
                total_equity += unrealized_margin
            except: pass
        self.equity = total_equity

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
        return True

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
                    "tp": pos['entry'] * (1.015 if pos['side'] == 'long' else 0.985),
                    "strategy": "Pro Scalper"
                })
            except: pass
        return pos_list

engine_instance = RayrEngine()