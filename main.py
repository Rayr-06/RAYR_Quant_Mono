from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import threading
from engine import engine_instance
from pydantic import BaseModel

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class SettingsPayload(BaseModel):
    apiKey: str = ""
    apiSecret: str = ""
    maxRisk: float = 2.0
    maxDrawdown: float = 10.0
    dailyLoss: float = 2.0
    enableLongs: bool = True
    enableShorts: bool = True

@app.on_event("startup")
def startup_event():
    thread = threading.Thread(target=engine_instance.run_loop, daemon=True)
    thread.start()

# --- THE NEW DASHBOARD UI ---
@app.get("/", response_class=HTMLResponse)
async def read_root():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>RAYR Quant Terminal</title>
        <style>
            body { background: #0f172a; color: #e2e8f0; font-family: 'Courier New', monospace; padding: 20px; }
            h1 { color: #22c55e; border-bottom: 2px solid #334155; padding-bottom: 10px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .card { background: #1e293b; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
            .stat-label { color: #94a3b8; font-size: 14px; }
            .stat-value { font-size: 28px; font-weight: bold; color: #f8fafc; }
            .profit { color: #22c55e; }
            .loss { color: #ef4444; }
            #logs { height: 300px; overflow-y: scroll; background: #0f172a; padding: 10px; border: 1px solid #334155; border-radius: 5px; font-size: 12px; }
            .log-info { color: #3b82f6; }
            .log-trade { color: #f59e0b; }
            .log-error { color: #ef4444; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { text-align: left; padding: 8px; border-bottom: 1px solid #334155; }
        </style>
        <script>
            async function fetchData() {
                const res = await fetch('/api/dashboard');
                const data = await res.json();
                
                // Update Stats
                document.getElementById('equity').innerText = '$' + data.equity.toFixed(2);
                document.getElementById('dailyPnl').innerText = '$' + data.dailyPnL.toFixed(2);
                document.getElementById('dailyPnl').className = data.dailyPnL >= 0 ? 'stat-value profit' : 'stat-value loss';
                
                // Update Logs
                const logsDiv = document.getElementById('logs');
                logsDiv.innerHTML = data.logs.map(l => 
                    `<div class="log-${l.level}">[${l.time}] ${l.message}</div>`
                ).join('');
                logsDiv.scrollTop = logsDiv.scrollHeight;
                
                // Update Positions
                const posDiv = document.getElementById('positions');
                if (data.positions.length === 0) {
                    posDiv.innerHTML = '<p style="color:#64748b">Scanning market for entries...</p>';
                } else {
                    posDiv.innerHTML = '<table><th>Symbol</th><th>Side</th><th>PnL</th>' + 
                    data.positions.map(p => 
                        `<tr>
                            <td>${p.symbol}</td>
                            <td style="color:${p.side === 'long' ? '#22c55e' : '#ef4444'}">${p.side.toUpperCase()}</td>
                            <td style="color:${p.pnl >= 0 ? '#22c55e' : '#ef4444'}">${p.pnlPercent.toFixed(2)}%</td>
                        </tr>`
                    ).join('') + '</table>';
                }
            }
            setInterval(fetchData, 2000); // Update every 2 seconds
            fetchData();
        </script>
    </head>
    <body>
        <h1>⚔️ RAYR QUANT TERMINAL</h1>
        <div class="grid">
            <div class="card">
                <div class="stat-label">Virtual Equity</div>
                <div id="equity" class="stat-value">Loading...</div>
            </div>
            <div class="card">
                <div class="stat-label">Daily P&L</div>
                <div id="dailyPnl" class="stat-value">Loading...</div>
            </div>
        </div>
        <br>
        <div class="card">
            <h3>Open Positions</h3>
            <div id="positions">Loading...</div>
        </div>
        <br>
        <div class="card">
            <h3>System Logs</h3>
            <div id="logs">Loading...</div>
        </div>
    </body>
    </html>
    """
# ----------------------------

@app.get("/api/dashboard")
def get_dashboard_data():
    return {
        "equity": engine_instance.equity,
        "dailyPnL": engine_instance.daily_pnl,
        "killSwitch": engine_instance.kill_switch,
        "positions": engine_instance.get_open_positions(),
        "logs": list(reversed(engine_instance.trade_log[-50:]))
    }

@app.post("/api/settings")
def save_settings(payload: SettingsPayload):
    engine_instance.update_broker_keys(payload.apiKey, payload.apiSecret)
    engine_instance.update_risk(payload.maxRisk, payload.maxDrawdown, payload.dailyLoss)
    engine_instance.update_strategy_controls(payload.enableLongs, payload.enableShorts)
    return {"status": "success", "message": "Settings applied to engine!"}

@app.get("/api/test-connection")
def test_connection():
    is_connected = engine_instance.test_broker_connection()
    return {"connected": is_connected}