from fastapi import FastAPI, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import datetime
import asyncio
import cv2
import uuid
import os
import numpy as np

app = FastAPI(title="NSG Supervisor API")

os.makedirs("uploads", exist_ok=True)
os.makedirs("watchlist_images", exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

import traceback

# AI Models Setup
print("Loading Models...")
model, mtcnn, facenet, wp, wm, device = None, None, None, None, None, "cpu"

try:
    from ultralytics import YOLO
    model = YOLO('yolov8n.pt')
except Exception as e:
    print(f"Error loading YOLO model: {e}")
    traceback.print_exc()

try:
    import torch
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
except Exception as e:
    print(f"Error loading torch: {e}")

try:
    from facenet_pytorch import MTCNN, InceptionResnetV1
    from scipy.spatial.distance import cosine
    mtcnn = MTCNN(device=device)
    facenet = InceptionResnetV1(pretrained='vggface2').eval().to(device)
    print("FaceNet loaded successfully.")
except Exception as e:
    print(f"Error loading FaceNet: {e}")
    traceback.print_exc()

try:
    from transformers import DetrImageProcessor, DetrForObjectDetection
    wp = DetrImageProcessor.from_pretrained("NabilaLM/detr-weapons-detection_40ep")
    wm = DetrForObjectDetection.from_pretrained("NabilaLM/detr-weapons-detection_40ep").eval().to(device)
    print("DETR Weapon Detection loaded successfully.")
except Exception as e:
    print(f"Error loading DETR: {e}")
    traceback.print_exc()

# Dynamic Watchlist
watchlist = {}
watchlist_metadata = []

class LoginRequest(BaseModel):
    username: str
    password: str

class SettingsRequest(BaseModel):
    confidence: int
    nms_threshold: float
    model_type: str

ai_alerts = []
settings = {"confidence": 50, "nms_threshold": 0.45, "model_type": "yolov8"}

@app.websocket("/ws/alerts")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/api/login")
async def login(request: LoginRequest):
    if len(request.username) >= 5 and request.password:
        return {"success": True, "token": "mock_token"}
    raise HTTPException(status_code=401, detail="Invalid Service ID or Passcode")

@app.get("/api/alerts")
async def get_alerts():
    return ai_alerts

@app.post("/api/settings")
async def save_settings(request: SettingsRequest):
    settings["confidence"] = request.confidence
    return {"success": True}

@app.get("/api/status")
async def get_status():
    status = f"Active ({settings['model_type']})"
    if wp: status += " + DETR + FaceNet"
    return {"model": status, "latency_ms": 12, "connection": "Secure Connection (WS)"}

@app.post("/api/upload")
async def upload_video(file: UploadFile = File(...)):
    file_path = os.path.join("uploads", file.filename)
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    return {"success": True, "filename": file.filename}

@app.get("/api/videos")
async def get_videos():
    videos = [{"name": "Default Drone", "path": "assets/video/normal1.mp4"},
              {"name": "Default CCTV", "path": "assets/video/anomoly1.mp4"}]
    for f in os.listdir("uploads"):
        if f.endswith(".mp4"):
            videos.append({"name": f, "path": os.path.join("uploads", f).replace("\\","/")})
    return videos

@app.post("/api/watchlist/upload")
async def upload_suspect(name: str, file: UploadFile = File(...)):
    if not facenet or not mtcnn:
        raise HTTPException(status_code=500, detail="FaceNet model not loaded")
        
    file_path = os.path.join("watchlist_images", file.filename)
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
        
    img = cv2.imread(file_path)
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    import torch
    faces = mtcnn(rgb)
    if faces is None:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail="No face detected in image")
        
    if not isinstance(faces, list):
        faces = [faces]
        
    emb = facenet(faces[0].unsqueeze(0).to(device)).cpu().detach().numpy().flatten()
    watchlist[name] = emb
    
    suspect_info = {"name": name, "image": f"/watchlist_images/{file.filename}"}
    watchlist_metadata.append(suspect_info)
    
    return {"success": True, "suspect": suspect_info}

@app.get("/api/watchlist")
async def get_watchlist():
    return watchlist_metadata

async def add_alert(cam_name, level, title, description):
    now = datetime.datetime.now()
    for a in ai_alerts:
        if cam_name in a['description'] and a['title'] == title:
            last_time = datetime.datetime.strptime(a['time'], "%H:%M:%S")
            if (now - last_time).seconds < 10:
                return
    
    alert = {
        "id": str(uuid.uuid4())[:8],
        "time": now.strftime("%H:%M:%S"),
        "level": level,
        "title": title,
        "description": f"{cam_name} - {description}"
    }
    ai_alerts.insert(0, alert)
    if len(ai_alerts) > 15:
        ai_alerts.pop()
        
    # Broadcast in real-time
    await manager.broadcast(alert)

async def generate_frames(video_path: str, cam_name: str, is_anomaly_cam: bool = False):
    if not os.path.exists(video_path):
        img = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.putText(img, "VIDEO NOT FOUND", (50, 240), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,255), 2)
        _, buffer = cv2.imencode('.jpg', img)
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
        return

    cap = cv2.VideoCapture(video_path)
    frame_count = 0

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue
        
        frame_count += 1
        if frame_count % 3 == 0 and model is not None:
            conf_thresh = settings["confidence"] / 100.0
            
            results = model(frame, conf=conf_thresh, verbose=False)
            annotated_frame = results[0].plot()

            for box in results[0].boxes:
                if int(box.cls[0]) == 0 and float(box.conf[0]) > conf_thresh:
                    await add_alert(cam_name, "warning", "Person Detected", f"Confidence: {box.conf[0]*100:.0f}%")

            if wp and wm:
                try:
                    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    inputs = wp(images=rgb_frame, return_tensors="pt").to(device)
                    import torch
                    with torch.no_grad():
                        outputs = wm(**inputs)
                    post = wp.post_process_object_detection(outputs, 0.4, torch.tensor([frame.shape[:2]]))[0]
                    if len(post["scores"]) > 0:
                        for score, label, box in zip(post["scores"], post["labels"], post["boxes"]):
                            if score > 0.4:
                                b = [int(i) for i in box.tolist()]
                                cv2.rectangle(annotated_frame, (b[0], b[1]), (b[2], b[3]), (0, 0, 255), 4)
                                cv2.putText(annotated_frame, f"WEAPON {score:.2f}", (b[0], b[1]-10), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,255), 3)
                                await add_alert(cam_name, "high", "Lethal Weapon Detected", f"Confidence: {score*100:.0f}%")
                except Exception as e:
                    pass
            
            if mtcnn and facenet and len(watchlist) > 0:
                try:
                    import torch
                    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    faces = mtcnn(rgb)
                    if faces is not None:
                        if not isinstance(faces, list): faces = [faces]
                        for face in faces:
                            emb = facenet(face.unsqueeze(0).to(device)).cpu().detach().numpy().flatten()
                            for name, db_emb in watchlist.items():
                                from scipy.spatial.distance import cosine
                                sim = 1 - cosine(emb, db_emb)
                                if sim > 0.6:  
                                    cv2.putText(annotated_frame, f"SUSPECT: {name}", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 165, 255), 3)
                                    await add_alert(cam_name, "high", "Suspect Identified", f"Matched against watchlist: {name}")
                except Exception as e:
                    pass
            
            ret, buffer = cv2.imencode('.jpg', annotated_frame)
        else:
            ret, buffer = cv2.imencode('.jpg', frame)
            
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
        await asyncio.sleep(0.03)

@app.get("/api/stream/cam1")
async def video_feed_cam1(video: str = "assets/video/normal1.mp4"):
    return StreamingResponse(generate_frames(video, "Cam 1"), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/api/stream/cam2")
async def video_feed_cam2(video: str = "assets/video/anomoly1.mp4"):
    return StreamingResponse(generate_frames(video, "Cam 2", True), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/")
async def root():
    return RedirectResponse(url="/index.html")

app.mount("/watchlist_images", StaticFiles(directory="watchlist_images"), name="watchlist_images")
app.mount("/", StaticFiles(directory="c:/Theta major project", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
