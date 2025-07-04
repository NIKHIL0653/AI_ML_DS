"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Send, Bot, User, Settings, History, Plus, Trash2, Download, Upload, Mic, MicOff, Zap } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
  type?: "text" | "code" | "error"
}

interface ChatSession {
  id: string
  title: string
  created_at: Date
  message_count: number
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// API Functions
const api = {
  async createSession(title?: string) {
    const response = await fetch(`${API_BASE_URL}/api/chat/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    })
    if (!response.ok) throw new Error('Failed to create session')
    return response.json()
  },

  async getSessions() {
    const response = await fetch(`${API_BASE_URL}/api/chat/sessions`)
    if (!response.ok) throw new Error('Failed to fetch sessions')
    return response.json()
  },

  async getMessages(sessionId: string) {
    const response = await fetch(`${API_BASE_URL}/api/chat/sessions/${sessionId}/messages`)
    if (!response.ok) throw new Error('Failed to fetch messages')
    const messages = await response.json()
    return messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }))
  },

  async sendMessage(content: string, sessionId: string) {
    const response = await fetch(`${API_BASE_URL}/api/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, session_id: sessionId }),
    })
    if (!response.ok) throw new Error('Failed to send message')
    const message = await response.json()
    return {
      ...message,
      timestamp: new Date(message.timestamp)
    }
  },

  async deleteSession(sessionId: string) {
    const response = await fetch(`${API_BASE_URL}/api/chat/sessions/${sessionId}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete session')
    return response.json()
  },

  async exportSession(sessionId: string) {
    const response = await fetch(`${API_BASE_URL}/api/chat/sessions/${sessionId}/export`)
    if (!response.ok) throw new Error('Failed to export session')
    return response.json()
  }
}

export default function AIAssistantGUI() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize the app
  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      // Test connection
      const healthResponse = await fetch(`${API_BASE_URL}/health`)
      setIsConnected(healthResponse.ok)
      
      if (healthResponse.ok) {
        // Load existing sessions
        const sessions = await api.getSessions()
        setChatSessions(sessions)
        
        // If no sessions exist or no current session, create a new one
        if (sessions.length === 0 || !currentSessionId) {
          await createNewChat()
        } else {
          // Load the first session
          const firstSession = sessions[0]
          setCurrentSessionId(firstSession.id)
          const messages = await api.getMessages(firstSession.id)
          setMessages(messages)
        }
      } else {
        setError("Cannot connect to AI backend. Please ensure the server is running on " + API_BASE_URL)
      }
    } catch (err) {
      console.error("Failed to initialize app:", err)
      setError("Failed to connect to AI backend. Please check if the server is running.")
      setIsConnected(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !currentSessionId || !isConnected) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
      type: "text",
    }

    // Add user message immediately for better UX
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)
    setError(null)

    try {
      // Send message to backend and get AI response
      const aiResponse = await api.sendMessage(inputValue, currentSessionId)
      
      // Add AI response to messages
      setMessages((prev) => [...prev, aiResponse])
    } catch (err) {
      console.error("Failed to send message:", err)
      setError("Failed to send message. Please try again.")
      
      // Remove the user message that failed to send
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleVoiceInput = () => {
    setIsListening(!isListening)
    // Voice input implementation would go here
  }

  const createNewChat = async () => {
    try {
      const newSession = await api.createSession(`Chat ${chatSessions.length + 1}`)
      
      // Update sessions list
      const updatedSessions = await api.getSessions()
      setChatSessions(updatedSessions)
      
      // Switch to new session
      setCurrentSessionId(newSession.id)
      
      // Load welcome message
      const messages = await api.getMessages(newSession.id)
      setMessages(messages)
      
      setError(null)
    } catch (err) {
      console.error("Failed to create new chat:", err)
      setError("Failed to create new chat session.")
    }
  }

  const selectSession = async (sessionId: string) => {
    try {
      setCurrentSessionId(sessionId)
      const messages = await api.getMessages(sessionId)
      setMessages(messages)
      setError(null)
    } catch (err) {
      console.error("Failed to load session:", err)
      setError("Failed to load chat session.")
    }
  }

  const deleteChat = async (sessionId: string) => {
    try {
      await api.deleteSession(sessionId)
      
      // Update sessions list
      const updatedSessions = await api.getSessions()
      setChatSessions(updatedSessions)
      
      // If we deleted the current session, switch to another one or create new
      if (currentSessionId === sessionId) {
        if (updatedSessions.length > 0) {
          await selectSession(updatedSessions[0].id)
        } else {
          await createNewChat()
        }
      }
      
      setError(null)
    } catch (err) {
      console.error("Failed to delete chat:", err)
      setError("Failed to delete chat session.")
    }
  }

  const exportChat = async (sessionId: string) => {
    try {
      const exportData = await api.exportSession(sessionId)
      
      // Download as JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `chat-${exportData.title}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Failed to export chat:", err)
      setError("Failed to export chat session.")
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Error Banner */}
      {error && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-3 text-center z-50">
          {error}
          <button onClick={() => setError(null)} className="ml-4 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-80" : "w-0"} transition-all duration-300 overflow-hidden bg-white border-r border-gray-200 ${error ? 'mt-12' : ''}`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-800">AI Assistant</h1>
            <Badge variant={isConnected ? "secondary" : "destructive"} className="bg-green-100 text-green-800">
              <Zap className="w-3 h-3 mr-1" />
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>

          <Button onClick={createNewChat} className="w-full mb-4 bg-transparent" variant="outline" disabled={!isConnected}>
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Recent Chats</h3>
            <ScrollArea className="h-64">
              {chatSessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    currentSessionId === session.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                  }`}
                  onClick={() => selectSession(session.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{session.title}</span>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          exportChat(session.id)
                        }}
                        title="Export chat"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteChat(session.id)
                        }}
                        title="Delete chat"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {new Date(session.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {session.message_count} messages
                    </span>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => window.open(`${API_BASE_URL}/docs`, '_blank')}>
              <History className="w-4 h-4 mr-2" />
              API Docs
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={initializeApp}>
              <Upload className="w-4 h-4 mr-2" />
              Reconnect
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${error ? 'mt-12' : ''}`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <History className="w-4 h-4" />
              </Button>
              <Avatar>
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  <Bot className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-gray-800">Python AI Assistant</h2>
                <p className="text-sm text-gray-500">
                  {isConnected ? "Ready to help with your tasks" : "Disconnected from backend"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isLoading ? "destructive" : isConnected ? "secondary" : "destructive"}>
                {isLoading ? "Processing..." : isConnected ? "Online" : "Offline"}
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => exportChat(currentSessionId || '')}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback
                    className={message.sender === "user" ? "bg-gray-100 text-gray-600" : "bg-blue-100 text-blue-600"}
                  >
                    {message.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
                <Card className={`max-w-2xl ${message.sender === "user" ? "bg-blue-500 text-white" : "bg-white"}`}>
                  <CardContent className="p-3">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span
                      className={`text-xs mt-2 block ${message.sender === "user" ? "text-blue-100" : "text-gray-500"}`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </CardContent>
                </Card>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <Card className="bg-white">
                  <CardContent className="p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isConnected ? "Type your message here..." : "Backend disconnected..."}
                  className="pr-12"
                  disabled={isLoading || !isConnected || !currentSessionId}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={toggleVoiceInput}
                  disabled={!isConnected}
                >
                  {isListening ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4" />}
                </Button>
              </div>
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputValue.trim() || isLoading || !isConnected || !currentSessionId} 
                className="px-6"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>{isConnected ? `Connected to ${API_BASE_URL}` : "Backend Disconnected"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}