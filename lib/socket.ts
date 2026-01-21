import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { ACCESS_TOKEN } from "./constants";
import {
    ChatMessageWithDetails,
    WsNewMessageEvent,
    WsMessageProcessingEvent,
    WsTypingEvent,
    WsMessageReadEvent,
} from "@/types/api-types";

const getSocketUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    // Extract base URL without /api/v1
    const baseUrl = apiUrl.replace(/\/api\/v1$/, "");
    return `${baseUrl}/chat`;
};

let socket: Socket | null = null;

export const connectSocket = (): Socket => {
    if (socket?.connected) {
        return socket;
    }

    const token = Cookies.get(ACCESS_TOKEN);
    if (!token) {
        throw new Error("No access token available");
    }

    const socketUrl = getSocketUrl();

    socket = io(socketUrl, {
        query: { token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
        console.log("Socket connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        if (reason === "io server disconnect") {
            // Server disconnected the socket, reconnect manually
            socket?.connect();
        }
    });

    socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const getSocket = (): Socket | null => {
    return socket;
};

// Join a conversation room
export const joinConversation = (conversationId: string) => {
    if (!socket?.connected) {
        connectSocket();
    }
    socket?.emit("joinConversation", { conversationId });
};

// Leave a conversation room
export const leaveConversation = (conversationId: string) => {
    socket?.emit("leaveConversation", { conversationId });
};

// Send typing indicator
export const sendTypingIndicator = (conversationId: string, isTyping: boolean) => {
    socket?.emit("typing", { conversationId, isTyping });
};

// Mark message as read
export const markMessageAsRead = (conversationId: string, messageId: string) => {
    socket?.emit("markAsRead", { conversationId, messageId });
};

// Re-export types for convenience
export type NewMessageEvent = WsNewMessageEvent;
export type MessageProcessingEvent = WsMessageProcessingEvent;
export type TypingEvent = WsTypingEvent;
export type MessageReadEvent = WsMessageReadEvent;

// Helper to add event listeners
export const onNewMessage = (callback: (data: NewMessageEvent) => void) => {
    socket?.on("newMessage", callback);
    return () => socket?.off("newMessage", callback);
};

export const onMessageProcessing = (callback: (data: MessageProcessingEvent) => void) => {
    socket?.on("messageProcessing", callback);
    return () => socket?.off("messageProcessing", callback);
};

export const onTyping = (callback: (data: TypingEvent) => void) => {
    socket?.on("typing", callback);
    return () => socket?.off("typing", callback);
};

export const onMessageRead = (callback: (data: MessageReadEvent) => void) => {
    socket?.on("messageRead", callback);
    return () => socket?.off("messageRead", callback);
};
