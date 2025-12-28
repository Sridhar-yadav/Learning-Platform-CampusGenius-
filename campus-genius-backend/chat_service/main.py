from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import socketio
from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="CampusGenius Chat Service")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Socket.IO
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio, app)

# MongoDB connection
client = MongoClient(os.getenv("MONGODB_URI", "mongodb://localhost:27017"))
db = client[os.getenv("DATABASE_NAME", "campusgenius")]
messages_collection = db["messages"]

# Socket.IO event handlers
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def send_message(sid, data):
    try:
        # Validate message data
        if not all(key in data for key in ["sender", "receiver", "content"]):
            raise ValueError("Missing required fields")
        
        # Add timestamp
        data["timestamp"] = datetime.utcnow().isoformat()
        
        # Save message to MongoDB
        result = await messages_collection.insert_one(data)
        
        # Emit message to receiver
        await sio.emit("new_message", data, room=data["receiver"])
        
        return {"status": "success", "message_id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@sio.event
async def join_room(sid, room):
    sio.enter_room(sid, room)
    await sio.emit("room_joined", {"room": room}, room=sid)

@sio.event
async def leave_room(sid, room):
    sio.leave_room(sid, room)
    await sio.emit("room_left", {"room": room}, room=sid)

# HTTP endpoints
@app.get("/")
async def root():
    return {"message": "CampusGenius Chat Service"}

@app.get("/messages/{user_id}")
async def get_messages(user_id: str):
    try:
        messages = await messages_collection.find({
            "$or": [
                {"sender": user_id},
                {"receiver": user_id}
            ]
        }).sort("timestamp", -1).limit(100)
        return {"messages": list(messages)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Mount Socket.IO app
app.mount("/socket.io", socket_app) 