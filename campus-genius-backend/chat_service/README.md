`# Chat Service

A real-time chat service built with FastAPI and Socket.IO, using MongoDB for message storage.

## Features

- Real-time messaging using Socket.IO
- Room-based chat functionality
- Message persistence in MongoDB
- User-specific message retrieval
- CORS support for cross-origin requests

## Prerequisites

- Python 3.8+
- MongoDB instance
- Virtual environment (recommended)

## Installation

1. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=campus_chat
```

## Running the Service

Start the server using Uvicorn:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The service will be available at `http://localhost:8000`

## API Endpoints

### HTTP Endpoints

- `GET /`: Health check endpoint
- `GET /messages/{user_id}`: Retrieve messages for a specific user

### Socket.IO Events

- `connect`: Client connection
- `disconnect`: Client disconnection
- `send_message`: Send a message to a room
- `join_room`: Join a chat room
- `leave_room`: Leave a chat room

## Message Format

Messages are stored in MongoDB with the following structure:
```json
{
    "room": "room_name",
    "user_id": "user_id",
    "message": "message_content",
    "timestamp": "ISO-8601 timestamp"
}
```

## Error Handling

The service includes error handling for:
- Invalid message formats
- Database connection issues
- Room join/leave operations
- Message sending failures

## Security Considerations

- CORS is configured to allow specific origins
- Input validation is performed on all messages
- MongoDB connection is secured with environment variables

## Development

To run tests:
```bash
pytest
```

To format code:
```bash
black .
```

## License

MIT License 