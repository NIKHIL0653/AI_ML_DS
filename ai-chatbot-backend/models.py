from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    
    # Relationship to messages
    messages = relationship("Message", back_populates="session", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(String, primary_key=True)
    content = Column(Text, nullable=False)
    sender = Column(String, nullable=False)  # "user" or "assistant"
    session_id = Column(String, ForeignKey("chat_sessions.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.now)
    type = Column(String, default="text")  # "text", "code", "error"
    
    # Relationship to session
    session = relationship("ChatSession", back_populates="messages")