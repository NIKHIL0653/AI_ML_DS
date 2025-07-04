#!/usr/bin/env python3
"""
Test script for the AI Chatbot Backend
Run this to verify the backend is working correctly
"""

import asyncio
import json
import sys
from datetime import datetime

import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_URL = "http://localhost:8000"

async def test_health_check():
    """Test basic health check endpoint"""
    print("🔍 Testing health check...")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/health")
            if response.status_code == 200:
                print("✓ Health check passed")
                return True
            else:
                print(f"❌ Health check failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Health check error: {e}")
            return False

async def test_create_session():
    """Test creating a new chat session"""
    print("🔍 Testing session creation...")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{BASE_URL}/api/chat/sessions",
                json={"title": "Test Session"}
            )
            if response.status_code == 200:
                session_data = response.json()
                print(f"✓ Session created: {session_data['id']}")
                return session_data['id']
            else:
                print(f"❌ Session creation failed: {response.status_code}")
                print(response.text)
                return None
        except Exception as e:
            print(f"❌ Session creation error: {e}")
            return None

async def test_send_message(session_id):
    """Test sending a message and getting AI response"""
    print("🔍 Testing message sending...")
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                f"{BASE_URL}/api/chat/send",
                json={
                    "content": "Hello! Can you tell me what 2 + 2 equals?",
                    "session_id": session_id
                }
            )
            if response.status_code == 200:
                message_data = response.json()
                print(f"✓ Message sent and response received")
                print(f"  AI Response: {message_data['content'][:100]}...")
                return True
            else:
                print(f"❌ Message sending failed: {response.status_code}")
                print(response.text)
                return False
        except Exception as e:
            print(f"❌ Message sending error: {e}")
            return False

async def test_get_sessions():
    """Test getting all sessions"""
    print("🔍 Testing session retrieval...")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/api/chat/sessions")
            if response.status_code == 200:
                sessions = response.json()
                print(f"✓ Retrieved {len(sessions)} sessions")
                return True
            else:
                print(f"❌ Session retrieval failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Session retrieval error: {e}")
            return False

async def test_get_messages(session_id):
    """Test getting messages for a session"""
    print("🔍 Testing message retrieval...")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/api/chat/sessions/{session_id}/messages")
            if response.status_code == 200:
                messages = response.json()
                print(f"✓ Retrieved {len(messages)} messages")
                return True
            else:
                print(f"❌ Message retrieval failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Message retrieval error: {e}")
            return False

async def run_tests():
    """Run all tests"""
    print("🤖 Testing AI Chatbot Backend")
    print("=" * 50)
    
    # Test health check
    if not await test_health_check():
        print("❌ Basic health check failed. Is the server running?")
        return False
    
    # Test session creation
    session_id = await test_create_session()
    if not session_id:
        print("❌ Session creation failed")
        return False
    
    # Test message sending (this tests AI integration)
    if not await test_send_message(session_id):
        print("❌ Message sending failed")
        return False
    
    # Test session retrieval
    if not await test_get_sessions():
        print("❌ Session retrieval failed")
        return False
    
    # Test message retrieval
    if not await test_get_messages(session_id):
        print("❌ Message retrieval failed")
        return False
    
    print("=" * 50)
    print("🎉 All tests passed! Backend is working correctly.")
    return True

def main():
    """Main test function"""
    try:
        success = asyncio.run(run_tests())
        if not success:
            print("\n❌ Some tests failed. Please check the server and configuration.")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n👋 Tests interrupted")
    except Exception as e:
        print(f"\n❌ Test error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()