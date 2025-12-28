import socketio
import eventlet
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Socket.IO server
sio = socketio.Server(cors_allowed_origins='*')
app = socketio.WSGIApp(sio)

# Initialize MongoDB client
mongo_client = MongoClient(os.getenv('MONGO_URI', 'mongodb://localhost:27017'))
db = mongo_client[os.getenv('MONGO_DB_NAME', 'campusgenius')]
chat_collection = db['chat_messages']

@sio.event
def connect(sid, environ):
    print(f'Client connected: {sid}')

@sio.event
def disconnect(sid):
    print(f'Client disconnected: {sid}')

@sio.event
def join_room(sid, data):
    room = data.get('room')
    if room:
        sio.enter_room(sid, room)
        sio.emit('user_joined', {'sid': sid}, room=room)

@sio.event
def leave_room(sid, data):
    room = data.get('room')
    if room:
        sio.leave_room(sid, room)
        sio.emit('user_left', {'sid': sid}, room=room)

@sio.event
def send_message(sid, data):
    room = data.get('room')
    message = {
        'sender': data.get('sender'),
        'content': data.get('content'),
        'timestamp': data.get('timestamp'),
        'room': room
    }
    
    # Store message in MongoDB
    chat_collection.insert_one(message)
    
    # Broadcast message to room
    sio.emit('receive_message', message, room=room)

@sio.event
def start_typing(sid, data):
    room = data.get('room')
    if room:
        sio.emit('user_typing', {'sid': sid}, room=room)

@sio.event
def stop_typing(sid, data):
    room = data.get('room')
    if room:
        sio.emit('user_stopped_typing', {'sid': sid}, room=room)

@sio.event
def get_chat_history(sid, data):
    room = data.get('room')
    limit = data.get('limit', 50)
    
    # Retrieve chat history from MongoDB
    messages = list(chat_collection.find(
        {'room': room}
    ).sort('timestamp', -1).limit(limit))
    
    # Send chat history to client
    sio.emit('chat_history', {'messages': messages}, room=sid)

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('', 8002)), app) 