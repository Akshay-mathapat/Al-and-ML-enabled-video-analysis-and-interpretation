from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import datetime

app = FastAPI(title="NSG Supervisor API")

# Allow CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    username: str
    password: str

class SettingsRequest(BaseModel):
    confidence: int
    nms_threshold: float
    model_type: str

@app.post("/api/login")
async def login(request: LoginRequest):
    # Mock authentication
    if request.username == "123456" and request.password == "password":
        return {"success": True, "message": "Authentication successful", "token": "mock_token_123"}
    
    # Accept any 6-digit username for demo purposes
    if len(request.username) == 6 and request.password:
        return {"success": True, "message": "Authentication successful", "token": "mock_token_demo"}
        
    raise HTTPException(status_code=401, detail="Invalid Service ID or Passcode")

@app.get("/api/alerts")
async def get_alerts():
    # Return mock dynamic alerts
    now = datetime.datetime.now()
    alerts = [
        {
            "id": 1,
            "time": now.strftime("%H:%M:%S"),
            "level": "high",
            "title": "High Confidence Anomaly",
            "description": "CCTV 4 - Unauthorized personnel detected in restricted zone."
        },
        {
            "id": 2,
            "time": (now - datetime.timedelta(minutes=15)).strftime("%H:%M:%S"),
            "level": "warning",
            "title": "Unidentified Object",
            "description": "Drone Cam Sector B - Object dropped near perimeter."
        },
        {
            "id": 3,
            "time": (now - datetime.timedelta(minutes=45)).strftime("%H:%M:%S"),
            "level": "info",
            "title": "Routine Calibration",
            "description": "System calibration performed for Sector Alpha cameras."
        },
        {
            "id": 4,
            "time": (now - datetime.timedelta(hours=2)).strftime("%H:%M:%S"),
            "level": "high",
            "title": "Perimeter Breach Attempt",
            "description": "CCTV 2 - Multiple subjects detected near North Wall."
        },
        {
            "id": 5,
            "time": (now - datetime.timedelta(hours=5)).strftime("%H:%M:%S"),
            "level": "warning",
            "title": "Camera Offline",
            "description": "Drone Cam Sector C lost connection for 30 seconds."
        }
    ]
    return alerts

@app.post("/api/settings")
async def save_settings(request: SettingsRequest):
    return {"success": True, "message": "Settings saved successfully", "data": request.model_dump()}

@app.get("/api/status")
async def get_status():
    return {
        "model": "Active (YOLOv8)",
        "latency_ms": 12,
        "connection": "Secure Connection"
    }

@app.get("/")
async def root():
    return RedirectResponse(url="/index.html")

import os

# Mount the current directory to serve static files
# Important: this must be defined after the API routes so it doesn't shadow them
app.mount("/", StaticFiles(directory="c:/Theta major project", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
