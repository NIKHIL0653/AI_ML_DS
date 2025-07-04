#!/bin/bash

# AI Chatbot Backend Installation Script
echo "🤖 Installing AI Chatbot Backend..."
echo "=" * 50

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check Python version
python_version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
required_version="3.8"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" = "$required_version" ]; then
    echo "✓ Python $python_version detected"
else
    echo "❌ Python $python_version is too old. Please install Python 3.8 or higher."
    exit 1
fi

# Navigate to backend directory
cd ai-chatbot-backend || { echo "❌ Backend directory not found"; exit 1; }

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️ Setting up environment configuration..."
    cp .env.example .env
    echo "📝 Please edit .env file and add your OpenAI API key"
else
    echo "✓ Environment file already exists"
fi

# Make scripts executable
chmod +x run.py
chmod +x test_backend.py

echo "=" * 50
echo "🎉 Installation completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit the .env file and add your OpenAI API key:"
echo "   OPENAI_API_KEY=your_actual_openai_api_key_here"
echo ""
echo "2. Start the server:"
echo "   python run.py"
echo ""
echo "3. Test the backend:"
echo "   python test_backend.py"
echo ""
echo "4. Access the API documentation:"
echo "   http://localhost:8000/docs"
echo ""
echo "Happy chatting! 🚀"