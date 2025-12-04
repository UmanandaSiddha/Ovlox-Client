"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Send,
    Sparkles,
    Copy,
    ThumbsUp,
    ThumbsDown,
    RotateCcw,
    Zap,
    Database,
    TrendingUp,
    Users,
    Calendar,
    AlertCircle
} from "lucide-react"

type Message = {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
    sources?: string[]
    suggestions?: string[]
}

const initialMessages: Message[] = [
    {
        id: "1",
        role: "assistant",
        content: "Hello! I'm your Project AI Assistant. I can help you understand your project data, analyze trends, and answer questions about your team's progress. What would you like to know?",
        timestamp: new Date(Date.now() - 600000),
        suggestions: [
            "How is our team performing?",
            "What are the overdue tasks?",
            "Show me recent data source updates",
            "How much progress have we made this week?"
        ]
    }
]

const suggestedQueries = [
    { icon: TrendingUp, text: "Show project progress", color: "text-green-600" },
    { icon: Users, text: "Team performance", color: "text-blue-600" },
    { icon: Database, text: "Data source summary", color: "text-purple-600" },
    { icon: AlertCircle, text: "Issues & blockers", color: "text-red-600" },
    { icon: Calendar, text: "Timeline overview", color: "text-orange-600" },
    { icon: Zap, text: "Recent updates", color: "text-yellow-600" },
]

export default function AIChat() {
    const [messages, setMessages] = React.useState<Message[]>(initialMessages)
    const [input, setInput] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const messagesEndRef = React.useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    React.useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSendMessage = async () => {
        if (!input.trim()) return

        // Add user message
        const userMessage: Message = {
            id: `msg-${Date.now()}`,
            role: "user",
            content: input,
            timestamp: new Date()
        }
        setMessages(prev => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        // Simulate AI response
        setTimeout(() => {
            const aiResponse: Message = {
                id: `msg-${Date.now() + 1}`,
                role: "assistant",
                content: `Based on your latest data sources (GitHub, Slack, Jira), here's what I found:\n\n📊 **Current Status:**\n• Total tasks: 42\n• Completed: 18 (42.8%)\n• In Progress: 15 (35.7%)\n• Overdue: 3\n\n👥 **Team Performance:**\n• John Doe: 8 completed tasks\n• Jane Smith: 7 completed tasks\n• Bob Wilson: 3 completed tasks\n\n🔄 **Recent Updates:**\n• 12 commits from GitHub integration (last 24h)\n• 5 new Jira tickets created\n• 23 Slack messages in #frontend channel\n\nWould you like me to dive deeper into any area?`,
                timestamp: new Date(),
                sources: ["GitHub", "Jira", "Slack"],
                suggestions: [
                    "What's blocking the overdue tasks?",
                    "Who needs support right now?",
                    "Compare this week vs last week"
                ]
            }
            setMessages(prev => [...prev, aiResponse])
            setIsLoading(false)
        }, 1500)
    }

    const handleSuggestionClick = (text: string) => {
        setInput(text)
    }

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    return (
        <div className="flex h-screen bg-background flex-col">
            {/* Header */}
            <div className="border-b border-border p-4">
                <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
                    <div className="flex items-center gap-2">
                        <div className="size-10 rounded-lg bg-linear-to-br from-primary to-purple-600 flex items-center justify-center">
                            <Sparkles className="size-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">Project AI Assistant</h1>
                            <p className="text-xs text-muted-foreground">Powered by normalized data from all sources</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm">
                        <RotateCcw className="size-4" />
                        Clear
                    </Button>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="max-w-4xl mx-auto space-y-4">
                    {messages.length === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                            {suggestedQueries.map((query, idx) => {
                                const Icon = query.icon
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleSuggestionClick(query.text)}
                                        className="p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left group"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Icon className={`size-4 ${query.color}`} />
                                            <span className="text-sm font-medium">{query.text}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Get insights about {query.text.toLowerCase()}
                                        </p>
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {message.role === "assistant" && (
                                <Avatar className="size-8 mt-1 shrink-0">
                                    <div className="size-8 rounded-full bg-linear-to-br from-primary to-purple-600 flex items-center justify-center">
                                        <Sparkles className="size-4 text-primary-foreground" />
                                    </div>
                                </Avatar>
                            )}

                            <div className={`max-w-2xl ${message.role === "user" ? "max-w-lg" : ""}`}>
                                {message.role === "assistant" ? (
                                    <Card className="p-4">
                                        <p className="text-sm whitespace-pre-wrap mb-3">{message.content}</p>

                                        {message.sources && message.sources.length > 0 && (
                                            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
                                                <Database className="size-3 text-muted-foreground" />
                                                <p className="text-xs text-muted-foreground">
                                                    Data from: {message.sources.join(", ")}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0"
                                                onClick={() => handleCopy(message.content)}
                                            >
                                                <Copy className="size-3" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                                <ThumbsUp className="size-3" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                                <ThumbsDown className="size-3" />
                                            </Button>
                                        </div>
                                    </Card>
                                ) : (
                                    <div className="bg-primary text-primary-foreground rounded-lg p-4">
                                        <p className="text-sm">{message.content}</p>
                                    </div>
                                )}

                                {message.suggestions && message.suggestions.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {message.suggestions.map((suggestion, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="w-full text-left p-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm text-muted-foreground hover:text-foreground"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <p className="text-xs text-muted-foreground mt-2">
                                    {message.timestamp.toLocaleTimeString()}
                                </p>
                            </div>

                            {message.role === "user" && (
                                <Avatar className="size-8 mt-1 shrink-0">
                                    <AvatarFallback className="bg-muted">You</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-3">
                            <Avatar className="size-8 mt-1 shrink-0">
                                <div className="size-8 rounded-full bg-linear-to-br from-primary to-purple-600 flex items-center justify-center">
                                    <Sparkles className="size-4 text-primary-foreground animate-pulse" />
                                </div>
                            </Avatar>
                            <Card className="p-4">
                                <div className="flex gap-2">
                                    <div className="size-2 bg-muted-foreground rounded-full animate-bounce" />
                                    <div className="size-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                                    <div className="size-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                                </div>
                            </Card>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-4 bg-background">
                <div className="max-w-4xl mx-auto">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Input
                                placeholder="Ask me about your project... (e.g., 'Which tasks are overdue?' or 'Show team performance')"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSendMessage()
                                    }
                                }}
                                className="pr-10"
                                disabled={isLoading}
                            />
                        </div>
                        <Button
                            onClick={handleSendMessage}
                            disabled={!input.trim() || isLoading}
                            className="gap-2"
                        >
                            <Send className="size-4" />
                            <span className="hidden sm:inline">Send</span>
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        💡 Tip: Ask natural questions about your data. I'll pull insights from all connected sources (GitHub, Slack, Jira, etc.)
                    </p>
                </div>
            </div>
        </div>
    )
}
