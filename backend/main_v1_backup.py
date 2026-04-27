from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
import threading
import os
from engine import engine_instance
from pydantic import BaseModel

app = FastAPI(title="RAYR Engine v2.0")

# ── CORS: lock to your actual frontend origin ────────────────
# In dev: localhost:5173 is fine.
# In prod: replace with your actual deployed URL.
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,   # No more allow_origins=["*"]
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ── Optional API key auth for non-local deployments ─────────
API_SECRET = os.getenv("RAYR_API_SECRET", "")  # Set this in .env for production

def verify_secret(x_api_secret: str = Header(default="")):
    if API_SECRET and x_api_secret != API_SECRET:
        raise HTTPException(status_code=403, detail="Invalid API secret")


# ── Request models ────────────────────────────────────────────

class SettingsPayload(BaseModel):
    apiKey:        str   = ""
    apiSecret:     str   = ""
    maxRisk:       float = 1.0
    maxDrawdown:   float = 8.0
    dailyLoss:     float = 2.0
    enableLongs:   bool  = True
    enableShorts:  bool  = True


# ── Startup ───────────────────────────────────────────────────

@app.on_event("startup")
def startup_event():
    thread = threading.Thread(target=engine_instance.run_loop, daemon=True)
    thread.start()


# ── Endpoints ─────────────────────────────────────────────────

@app.get("/api/dashboard")
def get_dashboard_data():
    stats = engine_instance._get_stats()
    risk  = engine_instance.get_risk_status()
    return {
        "equity":        engine_instance.equity,
        "dailyPnL":      engine_instance.daily_pnl,
        "killSwitch":    engine_instance.kill_switch,
        "isLive":        engine_instance.is_live_trading,
        "positions":     engine_instance.get_open_positions(),
        "logs":          list(reversed(engine_instance.trade_log[-50:])),
        "stats":         stats,
        "risk":          risk,
    }


@app.post("/api/settings", dependencies=[Depends(verify_secret)])
def save_settings(payload: SettingsPayload):
    engine_instance.update_broker_keys(payload.apiKey, payload.apiSecret)
    engine_instance.update_risk(payload.maxRisk, payload.maxDrawdown, payload.dailyLoss)
    engine_instance.update_strategy_controls(payload.enableLongs, payload.enableShorts)
    return {"status": "ok", "message": "Settings applied"}


@app.get("/api/risk")
def get_risk():
    return engine_instance.get_risk_status()


@app.get("/api/stats")
def get_stats():
    """Returns REAL stats from trade_history.json - no fake hardcoded numbers."""
    return engine_instance._get_stats()


@app.get("/api/history")
def get_history():
    return {
        "trades": engine_instance.trade_history[-100:],
        "count":  len(engine_instance.trade_history),
    }


@app.post("/api/kill", dependencies=[Depends(verify_secret)])
def toggle_kill():
    engine_instance.kill_switch = not engine_instance.kill_switch
    state = "KILLED" if engine_instance.kill_switch else "RESUMED"
    engine_instance.log("trade", f"Kill switch: {state}")
    return {"killSwitch": engine_instance.kill_switch}


@app.get("/api/test-connection")
def test_connection():
    return {"connected": engine_instance.test_broker_connection()}
