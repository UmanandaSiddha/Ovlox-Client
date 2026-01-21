"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
    Send,
    Loader2,
    Sparkles,
    FileText,
    RefreshCw,
    AlertCircle,
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useOrg } from "@/hooks/useOrg"
import { useProject } from "@/hooks/useProject"
import { useAuthStore } from "@/store/auth.store"
import {
    createConversation,
    sendMessage as sendMessageApi,
    listMessages,
    listConversations,
    getJobStatus,
    retryJob,
} from "@/services/chat.service"
import {
    connectSocket,
    disconnectSocket,
    joinConversation,
    leaveConversation,
    sendTypingIndicator,
    onNewMessage,
    onMessageProcessing,
    onTyping,
    NewMessageEvent,
    MessageProcessingEvent,
    TypingEvent,
} from "@/lib/socket"
import { IConversation, IChatMessage } from "@/types/prisma-generated"
import { ConversationType } from "@/types/enum"
import { toast } from "sonner"

export default function Chat() {
    const params = useParams()
    const router = useRouter()
    const { projectId } = params
    const { currentOrg } = useOrg()
    const { loadProject, currentProject } = useProject()
    const { auth } = useAuthStore()
    const accessToken = auth.accessToken

    const [conversation, setConversation] = React.useState<IConversation | null>(null)
    const [conversations, setConversations] = React.useState<IConversation[]>([])
    const [messages, setMessages] = React.useState<IChatMessage[]>([])
    const [messageInput, setMessageInput] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(true)
    const [isSending, setIsSending] = React.useState(false)
    const [processingJobs, setProcessingJobs] = React.useState<Record<string, string>>({}) // userMessageId -> jobId
    const [typingUsers, setTypingUsers] = React.useState<string[]>([])
    const [failedJobs, setFailedJobs] = React.useState<Set<string>>(new Set())
    const messagesEndRef = React.useRef<HTMLDivElement>(null)
    const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

    // Load conversations and project
    React.useEffect(() => {
        if (currentOrg?.id && projectId) {
            loadProject(currentOrg.id, projectId as string)
            loadConversations()
        }
    }, [currentOrg?.id, projectId])

    // Load messages when conversation changes
    React.useEffect(() => {
        if (conversation?.id) {
            loadMessages()
        }
    }, [conversation?.id])

    // WebSocket connection and event listeners
    React.useEffect(() => {
        if (!accessToken || !conversation?.id) return

        try {
            const socket = connectSocket()
            joinConversation(conversation.id)

            // Listen for new messages
            const unsubNewMessage = onNewMessage((data: NewMessageEvent) => {
                if (data.conversationId === conversation.id) {
                    setMessages(prev => {
                        // Avoid duplicates
                        if (prev.find(m => m.id === data.message.id)) {
                            return prev
                        }
                        return [...prev, data.message]
                    })

                    // If it's an assistant message, remove processing indicator
                    if (data.message.role === "ASSISTANT") {
                        const userMessageId = Object.keys(processingJobs).find(
                            key => processingJobs[key]
                        )
                        if (userMessageId) {
                            setProcessingJobs(prev => {
                                const next = { ...prev }
                                delete next[userMessageId]
                                return next
                            })
                        }
                    }
                }
            })

            // Listen for processing status
            const unsubProcessing = onMessageProcessing((data: MessageProcessingEvent) => {
                if (data.conversationId === conversation.id) {
                    setProcessingJobs(prev => ({
                        ...prev,
                        [data.userMessageId]: data.jobId,
                    }))
                }
            })

            // Listen for typing indicators
            const unsubTyping = onTyping((data: TypingEvent) => {
                if (data.conversationId === conversation.id && data.isTyping) {
                    setTypingUsers(prev => {
                        if (!prev.includes(data.userName)) {
                            return [...prev, data.userName]
                        }
                        return prev
                    })

                    // Clear typing after 3 seconds
                    if (typingTimeoutRef.current) {
                        clearTimeout(typingTimeoutRef.current)
                    }
                    typingTimeoutRef.current = setTimeout(() => {
                        setTypingUsers(prev => prev.filter(u => u !== data.userName))
                    }, 3000)
                } else {
                    setTypingUsers(prev => prev.filter(u => u !== data.userName))
                }
            })

            return () => {
                unsubNewMessage()
                unsubProcessing()
                unsubTyping()
                leaveConversation(conversation.id)
            }
        } catch (error) {
            console.error("Failed to connect WebSocket:", error)
            toast.error("Failed to connect to chat server")
        }

        return () => {
            if (conversation?.id) {
                leaveConversation(conversation.id)
            }
        }
    }, [accessToken, conversation?.id])

    // Scroll to bottom when messages change
    React.useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Check job status periodically for failed jobs
    React.useEffect(() => {
        const checkJobStatus = async () => {
            for (const [userMessageId, jobId] of Object.entries(processingJobs)) {
                try {
                    const job = await getJobStatus(jobId)
                    if (job.status === "FAILED") {
                        setFailedJobs(prev => new Set(prev).add(userMessageId))
                        setProcessingJobs(prev => {
                            const next = { ...prev }
                            delete next[userMessageId]
                            return next
                        })
                    } else if (job.status === "COMPLETED") {
                        setProcessingJobs(prev => {
                            const next = { ...prev }
                            delete next[userMessageId]
                            return next
                        })
                    }
                } catch (error) {
                    console.error("Failed to check job status:", error)
                }
            }
        }

        if (Object.keys(processingJobs).length > 0) {
            const interval = setInterval(checkJobStatus, 2000)
            return () => clearInterval(interval)
        }
    }, [processingJobs])

    const loadConversations = async () => {
        if (!currentOrg?.id || !projectId) return
        setIsLoading(true)
        try {
            const response = await listConversations({ projectId: projectId as string })
            setConversations(Array.isArray(response) ? response : [])
            if (Array.isArray(response) && response.length > 0 && !conversation) {
                setConversation(response[0])
            }
        } catch (error) {
            console.error("Failed to load conversations", error)
            toast.error("Failed to load conversations")
        } finally {
            setIsLoading(false)
        }
    }

    const loadMessages = async () => {
        if (!conversation?.id) return
        try {
            const response = await listMessages(conversation.id)
            setMessages(response.data || [])
        } catch (error) {
            console.error("Failed to load messages", error)
            toast.error("Failed to load messages")
        }
    }

    const handleCreateConversation = async () => {
        if (!currentOrg?.id || !projectId) return
        try {
            const newConv = await createConversation({
                projectId: projectId as string,
                type: ConversationType.RAG_CHAT,
            })
            setConversations(prev => [newConv, ...prev])
            setConversation(newConv)
            toast.success("New conversation created")
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to create conversation")
        }
    }

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !conversation?.id || isSending) return

        const question = messageInput.trim()
        setMessageInput("")
        setIsSending(true)

        try {
            // Send user message
            const response = await sendMessageApi(conversation.id, {
                question,
            })

            // Add user message to UI immediately
            setMessages(prev => [...prev, response.userMessage])

            // Track processing job
            setProcessingJobs(prev => ({
                ...prev,
                [response.userMessage.id]: response.jobId,
            }))

            // Send typing indicator
            sendTypingIndicator(conversation.id, true)
            setTimeout(() => sendTypingIndicator(conversation.id, false), 1000)
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to send message")
        } finally {
            setIsSending(false)
        }
    }

    const handleRetryJob = async (userMessageId: string) => {
        const jobId = processingJobs[userMessageId]
        if (!jobId) return

        try {
            await retryJob(jobId)
            setFailedJobs(prev => {
                const next = new Set(prev)
                next.delete(userMessageId)
                return next
            })
            setProcessingJobs(prev => ({
                ...prev,
                [userMessageId]: jobId,
            }))
            toast.success("Retrying message...")
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to retry message")
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageInput(e.target.value)
        if (conversation?.id) {
            sendTypingIndicator(conversation.id, true)
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current)
            }
            typingTimeoutRef.current = setTimeout(() => {
                sendTypingIndicator(conversation.id!, false)
            }, 1000)
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const formatTime = (date: string | Date) => {
        const d = new Date(date)
        const now = new Date()
        const diff = now.getTime() - d.getTime()
        const hours = Math.floor(diff / 3600000)
        const minutes = Math.floor((diff % 3600000) / 60000)

        if (hours > 24) {
            return d.toLocaleDateString()
        } else if (hours > 0) {
            return `${hours}h ago`
        } else if (minutes > 0) {
            return `${minutes}m ago`
        }
        return "just now"
    }

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center h-[calc(100vh-80px)]">
                <Loader2 className="size-8 animate-spin" />
            </div>
        )
    }

    const isProcessing = Object.keys(processingJobs).length > 0

    return (
        <div className="flex h-[calc(100vh-80px)] bg-background">
            {/* Sidebar - Conversations */}
            <div className="w-64 border-r border-border flex flex-col">
                <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="font-bold text-lg">Conversations</h1>
                        <Button variant="ghost" size="sm" onClick={handleCreateConversation}>
                            <Sparkles className="size-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {conversations.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p className="text-sm mb-2">No conversations yet</p>
                            <Button variant="outline" size="sm" onClick={handleCreateConversation}>
                                Start New Chat
                            </Button>
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => setConversation(conv)}
                                className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                                    conversation?.id === conv.id
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-muted"
                                }`}
                            >
                                <p className="text-sm font-medium truncate">{conv.title || "New Chat"}</p>
                                {conv.updatedAt && (
                                    <p className="text-xs opacity-70 truncate mt-1">
                                        Updated {new Date(conv.updatedAt).toLocaleDateString()}
                                    </p>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            {conversation ? (
                <div className="flex-1 flex flex-col">
                    {/* Chat Header */}
                    <div className="border-b border-border p-4">
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            <Sparkles className="size-5" />
                            {conversation.title || "AI Assistant"}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1">
                            Ask questions about your project data
                        </p>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <Sparkles className="size-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                                <p className="text-sm text-muted-foreground max-w-md">
                                    Ask questions about your project data and get AI-powered insights
                                </p>
                            </div>
                        ) : (
                            messages.map((message) => {
                                const isFailed = failedJobs.has(message.id)
                                const isProcessingMessage = processingJobs[message.id]

                                return (
                                    <div
                                        key={message.id}
                                        className={`flex gap-3 ${message.role === "USER" ? "justify-end" : "justify-start"}`}
                                    >
                                        {message.role === "ASSISTANT" && (
                                            <Avatar className="size-8 mt-1 shrink-0">
                                                <AvatarFallback className="bg-primary text-primary-foreground">
                                                    <Sparkles className="size-4" />
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className={`max-w-[70%] ${message.role === "USER" ? "order-2" : ""}`}>
                                            <Card className={`p-4 ${message.role === "USER" ? "bg-primary text-primary-foreground" : ""}`}>
                                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                                {message.sources && message.sources.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-border/50">
                                                        <p className="text-xs font-medium mb-2">Sources:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {message.sources.map((source: any, idx: number) => (
                                                                <Badge key={idx} variant="secondary" className="text-xs">
                                                                    <FileText className="size-3 mr-1" />
                                                                    {source.title || source.rawEvent?.type || `Source ${idx + 1}`}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {isFailed && (
                                                    <div className="mt-3 pt-3 border-t border-border/50">
                                                        <div className="flex items-center gap-2 text-xs text-destructive">
                                                            <AlertCircle className="size-4" />
                                                            <span>Failed to process message</span>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-6 text-xs"
                                                                onClick={() => handleRetryJob(message.id)}
                                                            >
                                                                <RefreshCw className="size-3 mr-1" />
                                                                Retry
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                                <p className="text-xs opacity-70 mt-2">{formatTime(message.createdAt)}</p>
                                            </Card>
                                        </div>
                                        {message.role === "USER" && (
                                            <Avatar className="size-8 mt-1 shrink-0">
                                                <AvatarFallback>U</AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                )
                            })
                        )}

                        {isProcessing && (
                            <div className="flex gap-3">
                                <Avatar className="size-8 mt-1 shrink-0">
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        <Sparkles className="size-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <Card className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="size-4 animate-spin" />
                                        <p className="text-sm text-muted-foreground">AI is thinking...</p>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {typingUsers.length > 0 && (
                            <div className="flex gap-3">
                                <Avatar className="size-8 mt-1 shrink-0">
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                                <Card className="p-4">
                                    <p className="text-sm text-muted-foreground">
                                        {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                                    </p>
                                </Card>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="border-t border-border p-4">
                        <div className="flex gap-2 items-end">
                            <div className="flex-1">
                                <Input
                                    placeholder="Ask a question about your project..."
                                    value={messageInput}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSendMessage()
                                        }
                                    }}
                                    disabled={isSending || isProcessing}
                                />
                            </div>
                            <Button
                                onClick={handleSendMessage}
                                disabled={!messageInput.trim() || isSending || isProcessing}
                            >
                                {isSending ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Send className="size-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Sparkles className="size-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No conversation selected</h3>
                        <p className="text-muted-foreground mb-4">
                            Create a new conversation to start chatting
                        </p>
                        <Button onClick={handleCreateConversation}>
                            <Sparkles className="size-4 mr-2" />
                            Start New Chat
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
