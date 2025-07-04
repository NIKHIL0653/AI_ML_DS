import os
import asyncio
from typing import List, Dict, Any
import openai
from dotenv import load_dotenv

load_dotenv()

class AIService:
    def __init__(self):
        self.client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = "gpt-3.5-turbo"  # You can change this to gpt-4 if you have access
        self.system_prompt = """You are a helpful Python AI Assistant. You are knowledgeable, friendly, and provide accurate information. 

Key capabilities:
- Answer questions about Python programming, data science, machine learning
- Help with code debugging and optimization
- Explain complex concepts in simple terms
- Provide code examples and best practices
- Assist with data analysis and visualization
- Help with web development, APIs, and databases

Guidelines:
- Be concise but thorough in your responses
- Provide code examples when relevant
- Ask clarifying questions if the user's request is ambiguous
- Be encouraging and supportive
- If you're unsure about something, acknowledge it honestly"""

    async def generate_response(self, user_message: str, chat_history: List[Dict[str, str]] = None) -> str:
        """Generate AI response using OpenAI API"""
        try:
            # Prepare messages for the API
            messages = [{"role": "system", "content": self.system_prompt}]
            
            # Add chat history if provided (limit to last 10 messages for context)
            if chat_history:
                # Convert sender format: "user" -> "user", "assistant" -> "assistant"
                for msg in chat_history[-10:]:
                    role = "user" if msg["role"] == "user" else "assistant"
                    messages.append({"role": role, "content": msg["content"]})
            
            # Add current user message
            messages.append({"role": "user", "content": user_message})
            
            # Call OpenAI API
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model=self.model,
                messages=messages,
                max_tokens=1000,
                temperature=0.7,
                top_p=1.0,
                frequency_penalty=0.0,
                presence_penalty=0.0
            )
            
            return response.choices[0].message.content.strip()
            
        except openai.AuthenticationError:
            return "I'm sorry, but there's an authentication issue with the AI service. Please check the API key configuration."
        except openai.RateLimitError:
            return "I'm currently experiencing high demand. Please try again in a moment."
        except openai.APIError as e:
            return f"I'm experiencing technical difficulties. Please try again later. (Error: {str(e)})"
        except Exception as e:
            return f"I encountered an unexpected error while processing your request. Please try again. (Error: {str(e)})"

    def get_supported_models(self) -> List[str]:
        """Get list of supported AI models"""
        return ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo-preview"]

    def set_model(self, model_name: str) -> bool:
        """Set the AI model to use"""
        if model_name in self.get_supported_models():
            self.model = model_name
            return True
        return False

    async def analyze_code(self, code: str, language: str = "python") -> str:
        """Analyze code and provide feedback"""
        prompt = f"""Please analyze the following {language} code and provide feedback on:
1. Code quality and best practices
2. Potential bugs or issues
3. Performance improvements
4. Security considerations (if applicable)
5. Suggestions for improvement

Code:
```{language}
{code}
```"""
        
        return await self.generate_response(prompt)

    async def explain_concept(self, concept: str, level: str = "intermediate") -> str:
        """Explain a programming or technical concept"""
        prompt = f"""Please explain the concept of "{concept}" at a {level} level. 
        
        Include:
        - Clear definition
        - Why it's important
        - Common use cases
        - Simple example (with code if applicable)
        - Related concepts
        
        Make it easy to understand and practical."""
        
        return await self.generate_response(prompt)

    async def debug_error(self, error_message: str, code_context: str = "") -> str:
        """Help debug an error message"""
        prompt = f"""I'm getting this error: {error_message}

        {f"Code context: {code_context}" if code_context else ""}
        
        Please help me understand:
        1. What this error means
        2. Common causes
        3. How to fix it
        4. How to prevent it in the future
        
        Provide specific, actionable solutions."""
        
        return await self.generate_response(prompt)