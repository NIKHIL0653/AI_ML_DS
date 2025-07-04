# AI Chatbot Backend

A Python-based AI chatbot backend built with FastAPI that integrates with OpenAI's API to provide intelligent responses. This backend is designed to work seamlessly with the React frontend GUI.

## Features

- **RESTful API** - FastAPI-based backend with automatic API documentation
- **AI Integration** - OpenAI GPT integration for intelligent responses
- **Session Management** - Multiple chat sessions with persistent storage
- **Database Storage** - SQLite database for storing chat history
- **CORS Support** - Cross-origin resource sharing for frontend integration
- **Error Handling** - Comprehensive error handling and logging
- **Export/Import** - Chat session export functionality
- **Real-time Responses** - Async processing for fast response times

## Prerequisites

- Python 3.8 or higher
- OpenAI API key (get one from [OpenAI](https://platform.openai.com/))

## Installation

1. **Clone and navigate to the backend directory:**
   ```bash
   cd ai-chatbot-backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

## Running the Server

1. **Start the FastAPI server:**
   ```bash
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **The server will be available at:**
   - API: http://localhost:8000
   - Interactive API docs: http://localhost:8000/docs
   - Alternative docs: http://localhost:8000/redoc

## API Endpoints

### Chat Operations
- `POST /api/chat/send` - Send a message and get AI response
- `GET /api/chat/sessions` - Get all chat sessions
- `GET /api/chat/sessions/{session_id}/messages` - Get messages for a session
- `POST /api/chat/sessions` - Create a new chat session
- `DELETE /api/chat/sessions/{session_id}` - Delete a chat session
- `GET /api/chat/sessions/{session_id}/export` - Export chat session

### Health Check
- `GET /` - Basic health check
- `GET /health` - Detailed health status

## Frontend Integration

This backend is designed to work with the React frontend. To integrate:

1. **Update the frontend API calls to point to:** `http://localhost:8000`

2. **Example frontend API call:**
   ```javascript
   const response = await fetch('http://localhost:8000/api/chat/send', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       content: message,
       session_id: currentSessionId
     })
   });
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Required |
| `DATABASE_URL` | Database connection string | `sqlite:///./chatbot.db` |
| `SECRET_KEY` | Secret key for security | Random generated |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000` |
| `DEBUG` | Enable debug mode | `True` |

## Database

The application uses SQLite by default, but you can configure it to use other databases by changing the `DATABASE_URL` environment variable.

**Database Tables:**
- `chat_sessions` - Stores chat session information
- `messages` - Stores individual messages

## AI Configuration

The backend uses OpenAI's GPT models. You can customize:

- **Model Selection** - Change `self.model` in `ai_service.py`
- **System Prompt** - Modify `self.system_prompt` in `ai_service.py`
- **Response Parameters** - Adjust temperature, max_tokens, etc.

## Development

### Project Structure
```
ai-chatbot-backend/
├── main.py              # FastAPI application and routes
├── models.py            # Database models
├── database.py          # Database configuration
├── ai_service.py        # AI/OpenAI integration
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variables template
└── README.md           # This file
```

### Adding New Features

1. **New API endpoints** - Add to `main.py`
2. **Database models** - Add to `models.py`
3. **AI functionality** - Extend `ai_service.py`

## Troubleshooting

### Common Issues

1. **OpenAI API Key Error**
   - Ensure your API key is correctly set in `.env`
   - Check that you have sufficient OpenAI credits

2. **CORS Issues**
   - Update `ALLOWED_ORIGINS` in `.env` to include your frontend URL

3. **Database Issues**
   - Delete `chatbot.db` to reset the database
   - Check file permissions in the project directory

4. **Import Errors**
   - Ensure all dependencies are installed: `pip install -r requirements.txt`
   - Activate your virtual environment

### Logs and Debugging

- Enable debug mode by setting `DEBUG=True` in `.env`
- Check console output for error messages
- Use the interactive API docs at `/docs` to test endpoints

## Production Deployment

For production deployment:

1. Set `DEBUG=False` in environment variables
2. Use a production WSGI server like Gunicorn:
   ```bash
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```
3. Use a production database (PostgreSQL, MySQL)
4. Set up proper security measures and HTTPS
5. Configure environment variables securely

## License

This project is open source and available under the MIT License.