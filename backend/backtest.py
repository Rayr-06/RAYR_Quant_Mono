import ccxt
import pandas as pd
import time

class AlphaBacktester:
    def __init__(self):
        self.exchange = ccxt.binance({'enableRateLimit': True})
        self.symbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'AVAX/USDT', 'DOGE/USDT']
        self.starting_balance = 10000.00
        self.balance = self.starting_balance
        self.positions = {}
        self.wins = 0
        self.losses = 0
        self.total_trades = 0
        self.fee_rate = 0.001

    def fetch_historical_data(self, symbol):
        print(f"Downloading 15m data for {symbol} (Micro Scalper)...")
        bars = self.exchange.fetch_ohlcv(symbol, '15m', limit=1000)
        df = pd.DataFrame(bars, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])

        # 1. MACRO TREND (EMA 200 on 15m = roughly 50 hours)
        df['ema_macro'] = df['close'].ewm(span=200, adjust=False).mean()
        df['ema_slope'] = df['ema_macro'].diff(5) # Is the 200 EMA sloping UP?

        # 2. BOLLINGER BANDS (20 period, 2 StdDev)
        df['bb_ma'] = df['close'].rolling(window=20).mean()
        df['bb_std'] = df['close'].rolling(window=20).std()
        df['bb_lower'] = df['bb_ma'] - (df['bb_std'] * 2.0)

        # 3. RSI
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['rsi'] = 100 - (100 / (1 + rs))

        return df

    def run_backtest(self):
        print("\n=====================================================")
        print("⚔️ RAYR MICRO-STAT SCALPER: 70%+ WIN RATE TARGET + FEES")
        print("=====================================================\n")

        for symbol in self.symbols:
            df = self.fetch_historical_data(symbol)

            for i in range(200, len(df)):
                row = df.iloc[i]
                current_price = row['close']

                # EXIT LOGIC (FAST SCALP)
                if symbol in self.positions:
                    pos = self.positions[symbol]
                    pnl_percent = ((current_price - pos['entry']) / pos['entry']) * 100

                    # TAKE PROFIT at +0.8% (Micro scalp to the mean)
                    if pnl_percent >= 0.8:
                        sell_value = pos['size'] * current_price
                        fee = sell_value * self.fee_rate
                        self.balance += sell_value - fee
                        self.wins += 1
                        self.total_trades += 1
                        del self.positions[symbol]

                    # STOP LOSS at -1.0% (Local trend failed)
                    elif pnl_percent <= -1.0:
                        sell_value = pos['size'] * current_price
                        fee = sell_value * self.fee_rate
                        self.balance += sell_value - fee
                        self.losses += 1
                        self.total_trades += 1
                        del self.positions[symbol]

                # ENTRY LOGIC (BUY THE LOCAL PANIC IN MACRO UPTREND)
                elif symbol not in self.positions:
                    macro_uptrend = current_price > row['ema_macro'] and row['ema_slope'] > 0

                    # Price touched or crossed Lower Bollinger Band
                    local_panic = current_price <= row['bb_lower'] and row['rsi'] < 30

                    if macro_uptrend and local_panic:
                        buy_amount_usd = self.balance * 0.15 # 15% position
                        if buy_amount_usd > 50:
                            size = buy_amount_usd / current_price
                            cost = size * current_price
                            fee = cost * self.fee_rate
                            self.balance -= (cost + fee)
                            self.positions[symbol] = {'side': 'long', 'entry': current_price, 'size': size}

            # Force close remaining
            for symbol, pos in list(self.positions.items()):
                last_price = df.iloc[-1]['close']
                self.balance += pos['size'] * last_price
                self.total_trades += 1
                self.losses += 1
                del self.positions[symbol]

        self.print_report()

    def print_report(self):
        net_profit = self.balance - self.starting_balance
        roi = (net_profit / self.starting_balance) * 100
        win_rate = (self.wins / self.total_trades * 100) if self.total_trades > 0 else 0

        print("\n=====================================================")
        print("📊 MICRO-STAT SCALPER BACKTEST COMPLETE (10 DAYS)")
        print("=====================================================")
        print(f"💶 Starting Capital: ${self.starting_balance:.2f}")
        print(f"💵 Final Capital: ${self.balance:.2f}")
        print(f"💰 Net Profit: ${net_profit:.2f}")
        print(f"📈 Return on Invest: {roi:.2f}%")
        print(f"🎯 Total Trades: {self.total_trades}")
        print(f"✅ Winning Trades: {self.wins}")
        print(f"❌ Losing Trades: {self.losses}")
        print(f"🏅 Win Rate: {win_rate:.2f}%")
        print("=====================================================\n")

        if roi > 0 and win_rate > 65:
            print("🟢 VERDICT: INSTITUTIONAL GRADE SCALPER. High win rate confirmed!")
        elif roi > 0:
            print("🟡 VERDICT: Profitable, but Win Rate needs to be higher to survive fees reliably.")
        else:
            print("🔴 VERDICT: STRATEGY NEEDS CALIBRATION.")

tester = AlphaBacktester()
tester.run_backtest()
