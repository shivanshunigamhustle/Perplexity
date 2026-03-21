import { Server } from "socket.io";
import { generateResponse, generateChatTitle, generateImageDescription } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";

let io;

export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true,
            allowedHeaders: ["Content-Type", "Authorization"]
        },
        maxHttpBufferSize: 10 * 1024 * 1024
    })

    console.log("Socket.io server is RUNNING")

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id)

        socket.on("get_chats", async (userId) => {
            console.log("get_chats received, userId:", userId)
            try {
                const chats = await chatModel.find({ user: userId }).sort({ createdAt: -1 })
                socket.emit("chats", chats)
            } catch (error) {
                console.error("get_chats error:", error)
                socket.emit("error", { message: error.message })
            }
        })

        socket.on("get_messages", async ({ chatId }) => {
            console.log("get_messages received, chatId:", chatId)
            try {
                const messages = await messageModel.find({ chat: chatId }).sort({ createdAt: 1 })
                socket.emit("messages", { chatId, messages })
            } catch (error) {
                console.error("get_messages error:", error)
                socket.emit("error", { message: error.message })
            }
        })

        socket.on("send_message", async ({ message, chatId, userId }) => {
            console.log("send_message received:", { message, chatId, userId })

            if (!userId) {
                socket.emit("error", { message: "User not authenticated" })
                return
            }

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

                socket.emit("message_response", { chat, title, aiMessage })
                console.log("message_response emitted")

            } catch (error) {
                console.error("send_message error:", error)
                socket.emit("error", { message: error.message })
            }
        })

        socket.on("send_image", async ({ base64Image, mimeType, userPrompt, chatId, userId }) => {
            console.log("send_image received, userId:", userId, "chatId:", chatId)

            if (!userId) {
                socket.emit("error", { message: "User not authenticated" })
                return
            }

            try {
                let title = null, chat = null

                if (!chatId) {
                    title = await generateChatTitle(userPrompt || "Image description")
                    chat = await chatModel.create({ user: userId, title })
                    console.log("New chat created for image:", chat._id)
                }

                const activeChatId = chatId || chat._id

                await messageModel.create({
                    chat: activeChatId,
                    content: userPrompt || "Describe this image",
                    role: "user",
                    imageUrl: `data:${mimeType};base64,${base64Image}`
                })

                console.log("Generating image description...")
                const result = await generateImageDescription(base64Image, mimeType, userPrompt)
                console.log("Image description generated")

                const aiMessage = await messageModel.create({
                    chat: activeChatId,
                    content: result,
                    role: "ai"
                })

                socket.emit("message_response", { chat, title, aiMessage })
                socket.emit("image_user_message", {
                    chatId: activeChatId,
                    content: userPrompt || "Describe this image",
                    imageUrl: `data:${mimeType};base64,${base64Image}`
                })

                console.log("image response emitted")

            } catch (error) {
                console.error("send_image error:", error)
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