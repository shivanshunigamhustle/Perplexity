import { io } from "socket.io-client";

export const socket = io("http://localhost:3000", {
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
        socket.once("chats", (chats) => {
            resolve(chats)
        })
    })
}

export const sendMessage = (message, chatId, userId) => {
    socket.emit("send_message", { message, chatId, userId })
}

export const onMessageResponse = (callback) => {
    socket.on("message_response", callback)
}

export const offMessageResponse = () => {
    socket.off("message_response")
}