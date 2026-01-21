"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Send,
    Loader2,
    Sparkles,
    FileText,
    RefreshCw,
    AlertCircle,
    Plus,
    MessageSquare,
    GitCommit,
    GitPullRequest,
    CircleDot,
    ExternalLink,
    ChevronDown,
    ChevronUp,
} from "lucide-react"
import { useParams } from "next/navigation"
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
    joinConversation as joinConvSocket,
    leaveConversation as leaveConvSocket,
    sendTypingIndicator,
    onNewMessage,
    onMessageProcessing,
    onTyping,
    NewMessageEvent,
    MessageProcessingEvent,
    TypingEvent,
} from "@/lib/socket"
import { ChatMessageWithDetails, ChatMessageSourceDetails } from "@/types/api-types"
import { IConversation } from "@/types/prisma-generated"
import { ConversationType, ChatRole } from "@/types/enum"
import { toast } from "sonner"
import { llmMarkdownToHtml } from "@/lib/llm-format"

// Job status type for tracking
interface ProcessingJob {
    jobId: string
    status: "processing" | "completed" | "failed"
    error?: string
}

// Extended message with rendered HTML content
interface MessageWithHtml extends ChatMessageWithDetails {
    contentHtml?: string
}

export default function Chat() {
    const params = useParams()
    const { projectId } = params
    const { currentOrg } = useOrg()
    const { loadProject, currentProject } = useProject()
    const { auth } = useAuthStore()
    const accessToken = auth.accessToken

    const [conversation, setConversation] = React.useState<IConversation | null>(null)
    const [conversations, setConversations] = React.useState<IConversation[]>([])
    const [messages, setMessages] = React.useState<MessageWithHtml[]>([])
    const [messageInput, setMessageInput] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(true)
    const [isLoadingMessages, setIsLoadingMessages] = React.useState(false)
    const [isSending, setIsSending] = React.useState(false)
    const [processingJobs, setProcessingJobs] = React.useState<Record<string, ProcessingJob>>({}) // userMessageId -> job
    const [typingUsers, setTypingUsers] = React.useState<string[]>([])
    const [expandedSources, setExpandedSources] = React.useState<Set<string>>(new Set())
    const messagesEndRef = React.useRef<HTMLDivElement>(null)
    const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
    const hasLoadedRef = React.useRef(false)

    // Helper to render markdown for assistant messages
    const renderMessageHtml = React.useCallback(async (message: ChatMessageWithDetails): Promise<MessageWithHtml> => {
        if (message.role === ChatRole.ASSISTANT) {
            const contentHtml = await llmMarkdownToHtml(message.content)
            return { ...message, contentHtml }
        }
        return message
    }, [])

    // Load conversations and project (only once)
    React.useEffect(() => {
        if (currentOrg?.id && projectId && !hasLoadedRef.current) {
            hasLoadedRef.current = true
            if (currentProject?.id !== projectId) {
                loadProject(currentOrg.id, projectId as string)
            }
            loadConversations()
        }
    }, [currentOrg?.id, projectId, currentProject?.id, loadProject])

    // Load messages when conversation changes
    React.useEffect(() => {
        if (conversation?.id) {
            loadMessages()
        }
    }, [conversation?.id])

    // WebSocket connection and event listeners
    React.useEffect(() => {
        if (!accessToken || !conversation?.id) return

        let unsubNewMessage: (() => void) | undefined
        let unsubProcessing: (() => void) | undefined
        let unsubTyping: (() => void) | undefined

        try {
            connectSocket()
            joinConvSocket(conversation.id)

            // Listen for new messages
            unsubNewMessage = onNewMessage(async (data: NewMessageEvent) => {
                if (data.conversationId === conversation.id) {
                    const messageWithHtml = await renderMessageHtml(data.message)
                    setMessages((prev) => {
                        // Avoid duplicates
                        if (prev.find((m) => m.id === data.message.id)) {
                            return prev
                        }
                        return [...prev, messageWithHtml]
                    })

                    // If it's an assistant message, clear the processing state
                    if (data.message.role === ChatRole.ASSISTANT && data.jobId) {
                        setProcessingJobs((prev) => {
                            const next = { ...prev }
                            // Find and remove the job by jobId
                            for (const key of Object.keys(next)) {
                                if (next[key].jobId === data.jobId) {
                                    delete next[key]
                                    break
                                }
                            }
                            return next
                        })
                    }
                }
            })

            // Listen for processing status updates
            unsubProcessing = onMessageProcessing((data: MessageProcessingEvent) => {
                if (data.conversationId === conversation.id) {
                    if (data.status === "failed") {
                        setProcessingJobs((prev) => ({
                            ...prev,
                            [data.userMessageId]: {
                                jobId: data.jobId,
                                status: "failed",
                                error: data.error,
                            },
                        }))
                        toast.error(data.error || "Failed to process message")
                    } else if (data.status === "completed") {
                        // Will be handled by newMessage event
                        setProcessingJobs((prev) => {
                            const next = { ...prev }
                            delete next[data.userMessageId]
                            return next
                        })
                    } else {
                        // processing
                        setProcessingJobs((prev) => ({
                            ...prev,
                            [data.userMessageId]: {
                                jobId: data.jobId,
                                status: "processing",
                            },
                        }))
                    }
                }
            })

            // Listen for typing indicators
            unsubTyping = onTyping((data: TypingEvent) => {
                if (data.conversationId === conversation.id && data.isTyping) {
                    setTypingUsers((prev) => {
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
                        setTypingUsers((prev) => prev.filter((u) => u !== data.userName))
                    }, 3000)
                } else {
                    setTypingUsers((prev) => prev.filter((u) => u !== data.userName))
                }
            })
        } catch (error) {
            console.error("Failed to connect WebSocket:", error)
            toast.error("Failed to connect to chat server")
        }

        return () => {
            unsubNewMessage?.()
            unsubProcessing?.()
            unsubTyping?.()
            if (conversation?.id) {
                leaveConvSocket(conversation.id)
            }
        }
    }, [accessToken, conversation?.id])

    // Scroll to bottom when messages change
    React.useEffect(() => {
        scrollToBottom()
    }, [messages, processingJobs])

    // Poll job status for processing jobs (fallback if WebSocket misses events)
    React.useEffect(() => {
        const checkJobStatus = async () => {
            for (const [userMessageId, job] of Object.entries(processingJobs)) {
                if (job.status !== "processing") continue
                
                try {
                    const status = await getJobStatus(job.jobId)
                    if (status.status === "FAILED") {
                        setProcessingJobs((prev) => ({
                            ...prev,
                            [userMessageId]: {
                                ...prev[userMessageId],
                                status: "failed",
                                error: status.payload?.error || "Unknown error",
                            },
                        }))
                    } else if (status.status === "COMPLETED") {
                        // Refresh messages to get the assistant response
                        await loadMessages()
                        setProcessingJobs((prev) => {
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

        const processingCount = Object.values(processingJobs).filter((j) => j.status === "processing").length
        if (processingCount > 0) {
            const interval = setInterval(checkJobStatus, 3000)
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
        setIsLoadingMessages(true)
        try {
            const response = await listMessages(conversation.id)
            // Render HTML for assistant messages
            const messagesWithHtml = await Promise.all(
                (response || []).map(renderMessageHtml)
            )
            setMessages(messagesWithHtml)
        } catch (error) {
            console.error("Failed to load messages", error)
            toast.error("Failed to load messages")
        } finally {
            setIsLoadingMessages(false)
        }
    }

    const handleCreateConversation = async () => {
        if (!currentOrg?.id || !projectId) return
        try {
            const newConv = await createConversation({
                projectId: projectId as string,
                type: ConversationType.RAG_CHAT,
            })
            setConversations((prev) => [newConv, ...prev])
            setConversation(newConv)
            setMessages([])
            toast.success("New conversation created")
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } }
            toast.error(err?.response?.data?.message || "Failed to create conversation")
        }
    }

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !conversation?.id || isSending) return

        const question = messageInput.trim()
        setMessageInput("")
        setIsSending(true)

        try {
            const response = await sendMessageApi(conversation.id, { question })

            // Add user message to UI immediately
            setMessages((prev) => [...prev, response.userMessage])

            // Track processing job
            setProcessingJobs((prev) => ({
                ...prev,
                [response.userMessage.id]: {
                    jobId: response.jobId,
                    status: "processing",
                },
            }))
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } }
            toast.error(err?.response?.data?.message || "Failed to send message")
        } finally {
            setIsSending(false)
        }
    }

    const handleRetryJob = async (userMessageId: string) => {
        const job = processingJobs[userMessageId]
        if (!job) return

        try {
            await retryJob(job.jobId)
            setProcessingJobs((prev) => ({
                ...prev,
                [userMessageId]: {
                    ...prev[userMessageId],
                    status: "processing",
                    error: undefined,
                },
            }))
            toast.success("Retrying message...")
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } }
            toast.error(err?.response?.data?.message || "Failed to retry message")
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

    const toggleSources = (messageId: string) => {
        setExpandedSources((prev) => {
            const next = new Set(prev)
            if (next.has(messageId)) {
                next.delete(messageId)
            } else {
                next.add(messageId)
            }
            return next
        })
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

    const getSenderName = (message: ChatMessageWithDetails) => {
        if (message.sender) {
            return `${message.sender.firstName || ""} ${message.sender.lastName || ""}`.trim() || "User"
        }
        if (message.senderMember?.user) {
            return `${message.senderMember.user.firstName || ""} ${message.senderMember.user.lastName || ""}`.trim() || "User"
        }
        return "User"
    }

    const getSenderAvatar = (message: ChatMessageWithDetails) => {
        return message.sender?.avatarUrl || message.senderMember?.user?.avatarUrl || null
    }

    const getSourceIcon = (source: ChatMessageSourceDetails) => {
        const eventType = source.rawEvent?.type?.toLowerCase() || ""
        if (eventType.includes("commit")) return <GitCommit className="size-3" />
        if (eventType.includes("pr") || eventType.includes("pull")) return <GitPullRequest className="size-3" />
        if (eventType.includes("issue")) return <CircleDot className="size-3" />
        return <FileText className="size-3" />
    }

    const getSourceTitle = (source: ChatMessageSourceDetails) => {
        if (source.rawEvent?.title) return source.rawEvent.title
        if (source.rawEvent?.type) return source.rawEvent.type
        return `Source`
    }

    const isProcessing = Object.values(processingJobs).some((j) => j.status === "processing")

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center h-[calc(100vh-80px)]">
                <Loader2 className="size-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="flex h-[calc(100vh-80px)] bg-background">
            {/* Sidebar - Conversations */}
            <div className="w-72 border-r border-border flex flex-col bg-muted/30">
                <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="font-bold text-lg flex items-center gap-2">
                            <MessageSquare className="size-5" />
                            Chats
                        </h1>
                        <Button variant="ghost" size="sm" onClick={handleCreateConversation}>
                            <Plus className="size-4" />
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Ask questions about {currentProject?.name || "your project"}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {conversations.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Sparkles className="size-8 mx-auto mb-3 opacity-50" />
                            <p className="text-sm mb-3">No conversations yet</p>
                            <Button variant="outline" size="sm" onClick={handleCreateConversation}>
                                <Plus className="size-4 mr-2" />
                                Start New Chat
                            </Button>
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => setConversation(conv)}
                                className={`w-full text-left px-3 py-3 rounded-lg mb-1 transition-all ${
                                    conversation?.id === conv.id
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "hover:bg-muted"
                                }`}
                            >
                                <p className="text-sm font-medium truncate">{conv.title || "New Chat"}</p>
                                {conv.updatedAt && (
                                    <p className="text-xs opacity-70 truncate mt-1">
                                        {formatTime(conv.updatedAt)}
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
                    <div className="border-b border-border p-4 bg-background">
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            <Sparkles className="size-5 text-primary" />
                            {conversation.title || "AI Assistant"}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1">
                            Ask questions about commits, PRs, issues, and project activity
                        </p>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {isLoadingMessages ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-3">
                                        <Skeleton className="size-8 rounded-full shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-4 w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="bg-primary/10 rounded-full p-4 mb-4">
                                    <Sparkles className="size-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                                <p className="text-sm text-muted-foreground max-w-md mb-4">
                                    Ask questions about your project's activity - commits, pull requests, issues, and more.
                                    The AI will search through your data to provide relevant answers.
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                                    {[
                                        "What features were completed last week?",
                                        "Summarize recent bug fixes",
                                        "Who contributed the most this month?",
                                    ].map((suggestion) => (
                                        <Button
                                            key={suggestion}
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                setMessageInput(suggestion)
                                            }}
                                        >
                                            {suggestion}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((message) => {
                                const job = processingJobs[message.id]
                                const isFailed = job?.status === "failed"
                                const hasSources = message.sources && message.sources.length > 0
                                const isSourcesExpanded = expandedSources.has(message.id)

                                return (
                                    <div
                                        key={message.id}
                                        className={`flex gap-3 ${message.role === ChatRole.USER ? "justify-end" : "justify-start"}`}
                                    >
                                        {message.role === ChatRole.ASSISTANT && (
                                            <Avatar className="size-8 mt-1 shrink-0">
                                                <AvatarFallback className="bg-primary text-primary-foreground">
                                                    <Sparkles className="size-4" />
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className={`max-w-[75%] ${message.role === ChatRole.USER ? "order-2" : ""}`}>
                                            <Card
                                                className={`p-4 ${
                                                    message.role === ChatRole.USER
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-muted/50"
                                                }`}
                                            >
                                                {message.role === ChatRole.ASSISTANT && message.contentHtml ? (
                                                    <div 
                                                        className="text-sm prose prose-sm dark:prose-invert max-w-none"
                                                        dangerouslySetInnerHTML={{ __html: message.contentHtml }}
                                                    />
                                                ) : (
                                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                                )}
                                                
                                                {/* Sources */}
                                                {hasSources && (
                                                    <div className="mt-3 pt-3 border-t border-border/50">
                                                        <button
                                                            onClick={() => toggleSources(message.id)}
                                                            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                                                        >
                                                            <FileText className="size-3" />
                                                            {message.sources!.length} source{message.sources!.length !== 1 ? "s" : ""}
                                                            {isSourcesExpanded ? (
                                                                <ChevronUp className="size-3" />
                                                            ) : (
                                                                <ChevronDown className="size-3" />
                                                            )}
                                                        </button>
                                                        {isSourcesExpanded && (
                                                            <div className="mt-2 space-y-2">
                                                                {message.sources!.map((source, idx) => (
                                                                    <div
                                                                        key={source.id || idx}
                                                                        className="flex items-start gap-2 text-xs bg-background/50 rounded p-2"
                                                                    >
                                                                        {getSourceIcon(source)}
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-medium truncate">
                                                                                {getSourceTitle(source)}
                                                                            </p>
                                                                            {source.relevanceScore && (
                                                                                <p className="text-muted-foreground">
                                                                                    Relevance: {Math.round(source.relevanceScore * 100)}%
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Failed state */}
                                                {isFailed && (
                                                    <div className="mt-3 pt-3 border-t border-border/50">
                                                        <div className="flex items-center gap-2 text-xs text-destructive">
                                                            <AlertCircle className="size-4" />
                                                            <span>{job?.error || "Failed to process"}</span>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-6 text-xs ml-auto"
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
                                        {message.role === ChatRole.USER && (
                                            <Avatar className="size-8 mt-1 shrink-0">
                                                <AvatarImage src={getSenderAvatar(message) || undefined} />
                                                <AvatarFallback>
                                                    {getSenderName(message).charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                )
                            })
                        )}

                        {/* Processing indicator */}
                        {isProcessing && (
                            <div className="flex gap-3">
                                <Avatar className="size-8 mt-1 shrink-0">
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        <Sparkles className="size-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <Card className="p-4 bg-muted/50">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                        <p className="text-sm text-muted-foreground">AI is thinking...</p>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* Typing indicator */}
                        {typingUsers.length > 0 && (
                            <div className="flex gap-3">
                                <Avatar className="size-8 mt-1 shrink-0">
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                                <Card className="p-4 bg-muted/50">
                                    <p className="text-sm text-muted-foreground">
                                        {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                                    </p>
                                </Card>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="border-t border-border p-4 bg-background">
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
                                    className="bg-muted/50"
                                />
                            </div>
                            <Button
                                onClick={handleSendMessage}
                                disabled={!messageInput.trim() || isSending || isProcessing}
                                size="icon"
                            >
                                {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Press Enter to send. AI responses are based on your project's data.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center bg-muted/10">
                    <div className="text-center max-w-md">
                        <div className="bg-primary/10 rounded-full p-6 w-fit mx-auto mb-6">
                            <Sparkles className="size-12 text-primary" />
                        </div>
                        <h3 className="text-2xl font-semibold mb-3">RAG Chatbot</h3>
                        <p className="text-muted-foreground mb-6">
                            Ask questions about your project and get AI-powered answers based on your commits, pull requests, issues, and other activity.
                        </p>
                        <Button onClick={handleCreateConversation} size="lg">
                            <Plus className="size-4 mr-2" />
                            Start New Chat
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
