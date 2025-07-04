#!/usr/bin/env python3
"""
Simple script to run the AI Chatbot Backend server
"""

import os
import sys
import subprocess
import uvicorn
from dotenv import load_dotenv

def check_requirements():
    """Check if all required packages are installed"""
    try:
        import fastapi
        import openai
        import sqlalchemy
        print("✓ All required packages are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing required package: {e}")
        print("Please run: pip install -r requirements.txt")
        return False

def check_env_file():
    """Check if .env file exists and has required variables"""
    if not os.path.exists('.env'):
        print("❌ .env file not found")
        print("Please copy .env.example to .env and configure your settings")
        return False
    
    load_dotenv()
    openai_key = os.getenv('OPENAI_API_KEY')
    
    if not openai_key or openai_key == 'your_openai_api_key_here':
        print("❌ OPENAI_API_KEY not configured in .env file")
        print("Please add your OpenAI API key to the .env file")
        return False
    
    print("✓ Environment configuration looks good")
    return True

def main():
    print("🤖 Starting AI Chatbot Backend...")
    print("=" * 50)
    
    # Check requirements
    if not check_requirements():
        sys.exit(1)
    
    # Check environment
    if not check_env_file():
        sys.exit(1)
    
    # Load environment variables
    load_dotenv()
    
    # Get configuration
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 8000))
    debug = os.getenv('DEBUG', 'True').lower() == 'true'
    
    print(f"🚀 Starting server on http://{host}:{port}")
    print(f"📚 API Documentation: http://localhost:{port}/docs")
    print(f"🔧 Debug mode: {'ON' if debug else 'OFF'}")
    print("=" * 50)
    print("Press Ctrl+C to stop the server")
    
    try:
        uvicorn.run(
            "main:app",
            host=host,
            port=port,
            reload=debug,
            log_level="info" if debug else "warning"
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()