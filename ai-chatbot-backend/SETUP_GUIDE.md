# AI Chatbot Complete Setup Guide

This guide will help you set up the complete AI chatbot system with both the Python backend and React frontend integration.

## 📋 Prerequisites

- **Python 3.8+** - Check with `python3 --version`
- **Node.js 16+** - For the React frontend (if you're using one)
- **OpenAI API Key** - Get one from [OpenAI Platform](https://platform.openai.com/)

## 🚀 Quick Start

### Option 1: Automatic Installation

```bash
# Navigate to the backend directory
cd ai-chatbot-backend

# Run the installation script
./install.sh

# Edit the environment file with your OpenAI API key
nano .env

# Start the server
python run.py
```

### Option 2: Manual Installation

1. **Create a virtual environment:**
   ```bash
   cd ai-chatbot-backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

4. **Start the server:**
   ```bash
   python main.py
   # or
   python run.py
   ```

## 🔧 Configuration

### Environment Variables (.env file)

```env
# Required: Your OpenAI API key
OPENAI_API_KEY=sk-your-actual-openai-api-key-here

# Optional: Database configuration
DATABASE_URL=sqlite:///./chatbot.db

# Optional: CORS configuration
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Optional: Server configuration
DEBUG=True
HOST=0.0.0.0
PORT=8000
```

### Frontend Integration

#### For React/TypeScript Projects:

1. **Replace your existing component with the updated version:**
   - Copy the contents of `frontend-integration.tsx`
   - Replace your existing AI assistant component

2. **Add environment variable to your React app (.env.local):**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Install additional dependencies if needed:**
   ```bash
   npm install @radix-ui/react-avatar @radix-ui/react-badge @radix-ui/react-button
   npm install @radix-ui/react-card @radix-ui/react-input @radix-ui/react-scroll-area
   npm install @radix-ui/react-separator lucide-react
   ```

#### For Other Frameworks:

The backend provides a REST API that can be integrated with any frontend framework:

**API Endpoints:**
- `POST /api/chat/send` - Send message and get AI response
- `GET /api/chat/sessions` - Get all chat sessions
- `POST /api/chat/sessions` - Create new session
- `DELETE /api/chat/sessions/{id}` - Delete session

**Example JavaScript API calls:**
```javascript
// Send a message
const response = await fetch('http://localhost:8000/api/chat/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: "Hello, AI!",
    session_id: "your-session-id"
  })
});
const aiResponse = await response.json();
```

## 🧪 Testing

### Test the Backend

```bash
# Run the test script
python test_backend.py
```

### Manual Testing

1. **Health Check:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **API Documentation:**
   - Visit: http://localhost:8000/docs
   - Interactive API testing interface

3. **Create a session and send a message:**
   ```bash
   # Create session
   curl -X POST http://localhost:8000/api/chat/sessions \
        -H "Content-Type: application/json" \
        -d '{"title": "Test Chat"}'
   
   # Send message (replace SESSION_ID)
   curl -X POST http://localhost:8000/api/chat/send \
        -H "Content-Type: application/json" \
        -d '{"content": "Hello!", "session_id": "SESSION_ID"}'
   ```

## 🎯 Features

### Backend Features
- ✅ OpenAI GPT integration
- ✅ Multiple chat sessions
- ✅ Message persistence (SQLite)
- ✅ RESTful API
- ✅ CORS support
- ✅ Error handling
- ✅ Session management
- ✅ Chat export/import
- ✅ Real-time responses

### Frontend Features (Updated Component)
- ✅ Real backend integration
- ✅ Session management UI
- ✅ Error handling and reconnection
- ✅ Chat export functionality
- ✅ Connection status indicators
- ✅ Responsive design
- ✅ Loading states

## 🛠️ Customization

### AI Model Configuration

Edit `ai_service.py`:

```python
class AIService:
    def __init__(self):
        # Change model here
        self.model = "gpt-4"  # or "gpt-3.5-turbo"
        
        # Customize system prompt
        self.system_prompt = """Your custom system prompt here..."""
```

### Database Configuration

For production, change `DATABASE_URL` in `.env`:

```env
# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost/chatbot

# MySQL
DATABASE_URL=mysql://user:password@localhost/chatbot
```

### Frontend Customization

The React component is fully customizable:
- Update styling in the component
- Modify API calls in the `api` object
- Add new features like file upload, voice input, etc.

## 🚨 Troubleshooting

### Common Issues

1. **"ModuleNotFoundError" errors:**
   ```bash
   # Ensure virtual environment is activated
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **OpenAI API errors:**
   - Check your API key in `.env`
   - Verify you have OpenAI credits
   - Test with: `curl -H "Authorization: Bearer YOUR_API_KEY" https://api.openai.com/v1/models`

3. **CORS errors in frontend:**
   - Add your frontend URL to `ALLOWED_ORIGINS` in `.env`
   - Restart the backend after changes

4. **Connection refused:**
   - Check if backend is running: `curl http://localhost:8000/health`
   - Verify firewall settings
   - Check if port 8000 is available

5. **Database errors:**
   - Delete `chatbot.db` to reset
   - Check file permissions in project directory

### Debug Mode

Enable detailed logging:
```env
DEBUG=True
```

Then check console output for detailed error messages.

## 📁 Project Structure

```
ai-chatbot-backend/
├── main.py                 # FastAPI application
├── models.py               # Database models
├── database.py             # Database configuration
├── ai_service.py           # OpenAI integration
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables
├── .env.example            # Environment template
├── run.py                  # Simple run script
├── test_backend.py         # Test suite
├── install.sh              # Installation script
├── frontend-integration.tsx # Updated React component
├── README.md               # Basic documentation
└── SETUP_GUIDE.md          # This file
```

## 🌐 Production Deployment

### Backend Deployment

1. **Use a production WSGI server:**
   ```bash
   pip install gunicorn
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```

2. **Set production environment variables:**
   ```env
   DEBUG=False
   DATABASE_URL=postgresql://...  # Production database
   ALLOWED_ORIGINS=https://yourdomain.com
   ```

3. **Use environment-specific configuration management**

### Frontend Deployment

1. **Build your React app:**
   ```bash
   npm run build
   ```

2. **Update API URL for production:**
   ```env
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   ```

## 📞 Support

If you encounter issues:

1. Check this guide thoroughly
2. Review the console logs for error messages
3. Test individual components using the provided scripts
4. Verify all environment variables are set correctly

## 🎉 Next Steps

Once everything is working:

1. **Customize the AI assistant** - Modify prompts and behavior
2. **Add new features** - File upload, voice input, code execution
3. **Improve the UI** - Add themes, animations, better mobile support
4. **Scale the backend** - Add authentication, rate limiting, multi-tenancy
5. **Deploy to production** - Set up proper hosting and monitoring

Happy chatting with your AI assistant! 🤖