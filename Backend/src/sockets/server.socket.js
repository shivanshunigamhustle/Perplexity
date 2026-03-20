import { Server } from "socket.io";
import { generateResponse, generateChatTitle } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";

let io;

export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true,
            allowedHeaders: ["Content-Type", "Authorization"]
        }
    })

    console.log("Socket.io server is RUNNING")

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id)

        socket.on("get_chats", async (userId) => {
            console.log("get_chats received, userId:", userId)
            try {
                const chats = await chatModel.find({ user: userId })
                console.log("Sending chats:", chats.length)
                socket.emit("chats", chats)
            } catch (error) {
                console.error("get_chats error:", error)
                socket.emit("error", { message: error.message })
            }
        })

        socket.on("send_message", async ({ message, chatId, userId }) => {
            console.log("send_message received:", { message, chatId, userId })
            try {
                let title = null, chat = null

                if (!chatId) {
                    title = await generateChatTitle(message)
                    chat = await chatModel.create({ user: userId, title })
                    console.log("New chat created:", chat._id)
                }

                const activeChatId = chatId || chat._id

                await messageModel.create({
                    chat: activeChatId,
                    content: message,
                    role: "user"
                })

                const messages = await messageModel.find({ chat: activeChatId })
                console.log("Generating AI response...")
                const result = await generateResponse(messages)
                console.log("AI response generated")

                const aiMessage = await messageModel.create({
                    chat: activeChatId,
                    content: result,
                    role: "ai"
                })

                socket.emit("message_response", {
                    chat: chat,
                    title,
                    aiMessage
                })

                console.log("message_response emitted")

            } catch (error) {
                console.error("send_message error:", error)
                socket.emit("error", { message: error.message })
            }
        })

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id)
        })
    })
}

export function getIO() {
    if (!io) throw new Error("Socket.io not initialized")
    return io
}