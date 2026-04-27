from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import threading
from engine import engine_instance
from pydantic import BaseModel

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class SettingsPayload(BaseModel):
    apiKey: str = ""
    apiSecret: str = ""
    maxRisk: float = 15.0
    maxDrawdown: float = 10.0
    dailyLoss: float = 2.0
    enableLongs: bool = True
    enableShorts: bool = True

@app.on_event("startup")
def startup_event():
    thread = threading.Thread(target=engine_instance.run_loop, daemon=True)
    thread.start()

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

@app.get("/api/force-test-trade")
def force_test_trade():
    engine_instance.execute_test_trade()
    return {"status": "Trade executed! Watch the console."}
