import os
import uuid
import asyncio
from datetime import datetime
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import openai
from dotenv import load_dotenv

from database import get_db, SessionLocal, init_db
from models import ChatSession, Message
from ai_service import AIService

# Load environment variables
load_dotenv()

# Initialize database on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    yield
    # Shutdown
    pass

app = FastAPI(
    title="AI Chatbot Backend",
    description="Python-based AI chatbot backend for React frontend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI service
ai_service = AIService()

# Pydantic models for request/response
class MessageRequest(BaseModel):
    content: str
    session_id: str

class MessageResponse(BaseModel):
    id: str
    content: str
    sender: str
    timestamp: datetime
    type: str = "text"

class ChatSessionResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    message_count: int

class CreateSessionRequest(BaseModel):
    title: Optional[str] = None

# API Routes
@app.get("/")
async def root():
    return {"message": "AI Chatbot Backend is running!", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

@app.post("/api/chat/send", response_model=MessageResponse)
async def send_message(message_request: MessageRequest, db: SessionLocal = Depends(get_db)):
    """Send a message and get AI response"""
    try:
        # Validate session exists
        session = db.query(ChatSession).filter(ChatSession.id == message_request.session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")
        
        # Save user message
        user_message = Message(
            id=str(uuid.uuid4()),
            content=message_request.content,
            sender="user",
            session_id=message_request.session_id,
            timestamp=datetime.now(),
            type="text"
        )
        db.add(user_message)
        db.commit()
        
        # Get chat history for context
        chat_history = db.query(Message).filter(
            Message.session_id == message_request.session_id
        ).order_by(Message.timestamp).all()
        
        # Generate AI response
        ai_response = await ai_service.generate_response(
            message_request.content, 
            [{"role": msg.sender, "content": msg.content} for msg in chat_history[:-1]]  # Exclude the just-added user message
        )
        
        # Save AI response
        assistant_message = Message(
            id=str(uuid.uuid4()),
            content=ai_response,
            sender="assistant",
            session_id=message_request.session_id,
            timestamp=datetime.now(),
            type="text"
        )
        db.add(assistant_message)
        db.commit()
        
        return MessageResponse(
            id=assistant_message.id,
            content=assistant_message.content,
            sender=assistant_message.sender,
            timestamp=assistant_message.timestamp,
            type=assistant_message.type
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@app.get("/api/chat/sessions", response_model=List[ChatSessionResponse])
async def get_chat_sessions(db: SessionLocal = Depends(get_db)):
    """Get all chat sessions"""
    try:
        sessions = db.query(ChatSession).order_by(ChatSession.created_at.desc()).all()
        return [
            ChatSessionResponse(
                id=session.id,
                title=session.title,
                created_at=session.created_at,
                message_count=len(session.messages)
            )
            for session in sessions
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching sessions: {str(e)}")

@app.get("/api/chat/sessions/{session_id}/messages", response_model=List[MessageResponse])
async def get_session_messages(session_id: str, db: SessionLocal = Depends(get_db)):
    """Get all messages for a specific session"""
    try:
        # Validate session exists
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")
        
        messages = db.query(Message).filter(
            Message.session_id == session_id
        ).order_by(Message.timestamp).all()
        
        return [
            MessageResponse(
                id=message.id,
                content=message.content,
                sender=message.sender,
                timestamp=message.timestamp,
                type=message.type
            )
            for message in messages
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching messages: {str(e)}")

@app.post("/api/chat/sessions", response_model=ChatSessionResponse)
async def create_chat_session(request: CreateSessionRequest, db: SessionLocal = Depends(get_db)):
    """Create a new chat session"""
    try:
        session_id = str(uuid.uuid4())
        title = request.title or f"Chat {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        
        new_session = ChatSession(
            id=session_id,
            title=title,
            created_at=datetime.now()
        )
        db.add(new_session)
        db.commit()
        
        # Add welcome message
        welcome_message = Message(
            id=str(uuid.uuid4()),
            content="Hello! I'm your Python AI Assistant. How can I help you today?",
            sender="assistant",
            session_id=session_id,
            timestamp=datetime.now(),
            type="text"
        )
        db.add(welcome_message)
        db.commit()
        
        return ChatSessionResponse(
            id=new_session.id,
            title=new_session.title,
            created_at=new_session.created_at,
            message_count=1
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating session: {str(e)}")

@app.delete("/api/chat/sessions/{session_id}")
async def delete_chat_session(session_id: str, db: SessionLocal = Depends(get_db)):
    """Delete a chat session and all its messages"""
    try:
        # Delete messages first
        db.query(Message).filter(Message.session_id == session_id).delete()
        
        # Delete session
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")
        
        db.delete(session)
        db.commit()
        
        return {"message": "Session deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting session: {str(e)}")

@app.get("/api/chat/sessions/{session_id}/export")
async def export_chat_session(session_id: str, db: SessionLocal = Depends(get_db)):
    """Export chat session as JSON"""
    try:
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")
        
        messages = db.query(Message).filter(
            Message.session_id == session_id
        ).order_by(Message.timestamp).all()
        
        export_data = {
            "session_id": session.id,
            "title": session.title,
            "created_at": session.created_at.isoformat(),
            "messages": [
                {
                    "id": msg.id,
                    "content": msg.content,
                    "sender": msg.sender,
                    "timestamp": msg.timestamp.isoformat(),
                    "type": msg.type
                }
                for msg in messages
            ]
        }
        
        return export_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting session: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=os.getenv("DEBUG", "True").lower() == "true"
    )