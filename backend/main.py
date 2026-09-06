from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Any
import json
import time

app = FastAPI(title="Webhook Catcher")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store connections per endpoint_id
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, endpoint_id: str):
        await websocket.accept()
        if endpoint_id not in self.active_connections:
            self.active_connections[endpoint_id] = []
        self.active_connections[endpoint_id].append(websocket)

    def disconnect(self, websocket: WebSocket, endpoint_id: str):
        if endpoint_id in self.active_connections:
            self.active_connections[endpoint_id].remove(websocket)
            if not self.active_connections[endpoint_id]:
                del self.active_connections[endpoint_id]

    async def broadcast(self, endpoint_id: str, message: dict):
        if endpoint_id in self.active_connections:
            for connection in self.active_connections[endpoint_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"Error sending to websocket: {e}")

manager = ConnectionManager()

# Store caught requests in memory (for simplicity)
# Format: { endpoint_id: [ {request_data}, ... ] }
requests_db: Dict[str, List[dict]] = {}

@app.websocket("/api/ws/{endpoint_id}")
async def websocket_endpoint(websocket: WebSocket, endpoint_id: str):
    await manager.connect(websocket, endpoint_id)
    try:
        # Send existing requests history when connected
        if endpoint_id in requests_db:
            await websocket.send_json({"type": "history", "data": requests_db[endpoint_id]})
            
        while True:
            # We don't expect client to send anything, but we keep connection open
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, endpoint_id)


# Catch all HTTP methods for a specific endpoint
@app.api_route("/api/webhook/{endpoint_id}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
async def catch_webhook(endpoint_id: str, request: Request):
    # Parse headers
    headers = dict(request.headers)
    
    # Try to parse JSON body, fallback to text
    body_str = ""
    body_json = None
    try:
        body_bytes = await request.body()
        body_str = body_bytes.decode('utf-8')
        if body_str:
            body_json = json.loads(body_str)
    except Exception:
        pass # Not json or not decodable
        
    request_data = {
        "id": str(time.time()),
        "timestamp": time.time(),
        "method": request.method,
        "url": str(request.url),
        "headers": headers,
        "body_str": body_str,
        "body_json": body_json,
        "query_params": dict(request.query_params)
    }
    
    # Store in memory
    if endpoint_id not in requests_db:
        requests_db[endpoint_id] = []
    
    requests_db[endpoint_id].insert(0, request_data) # insert at beginning
    
    # Keep only last 50 requests
    if len(requests_db[endpoint_id]) > 50:
        requests_db[endpoint_id] = requests_db[endpoint_id][:50]
        
    
    # Broadcast to connected frontend clients (if using WS)
    await manager.broadcast(endpoint_id, {"type": "new_request", "data": request_data})
    
    return {"status": "ok", "message": "Webhook caught successfully"}

@app.get("/api/webhook/{endpoint_id}/history")
def get_webhook_history(endpoint_id: str):
    return {"data": requests_db.get(endpoint_id, [])}

@app.get("/api/health")
def health():
    return {"status": "ok"}
