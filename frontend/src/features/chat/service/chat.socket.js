import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_API_URL, {
    withCredentials: true,
    autoConnect: false
});

export const initializeSocketConnection = () => {
    socket.connect()
    socket.on("connect", () => {
        console.log("Connected to Socket.IO server:", socket.id)
    })
}

export const getChats = (userId) => {
    return new Promise((resolve) => {
        socket.emit("get_chats", userId)
        socket.once("chats", (chats) => resolve(chats))
    })
}

export const getMessages = (chatId) => {
    return new Promise((resolve) => {
        socket.emit("get_messages", { chatId })
        socket.once("messages", ({ messages }) => resolve(messages))
    })
}

export const sendMessage = (message, chatId, userId) => {
    socket.emit("send_message", { message, chatId, userId })
}

export const sendImage = (base64Image, mimeType, userPrompt, chatId, userId) => {
    socket.emit("send_image", { base64Image, mimeType, userPrompt, chatId, userId })
}

export const onMessageResponse = (callback) => {
    socket.on("message_response", callback)
}

export const offMessageResponse = () => {
    socket.off("message_response")
}

export const onImageUserMessage = (callback) => {
    socket.on("image_user_message", callback)
}

export const offImageUserMessage = () => {
    socket.off("image_user_message")
}