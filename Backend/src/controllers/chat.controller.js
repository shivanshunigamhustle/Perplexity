import { generateResponse, generateChatTitle } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";

export const sendMessage = async (req, res) => {
    try {
        const { message, chat: chatId } = req.body;

        let title = null, chat = null;

        if (!chatId) {
            title = await generateChatTitle(message);
            chat = await chatModel.create({
                user: req.user.id,
                title
            });
        }

        const activeChatId = chatId || chat._id;

        const userMessage = await messageModel.create({
            chat: activeChatId,
            content: message,
            role: "user"
        });

        const messages = await messageModel.find({ chat: activeChatId });
        const result = await generateResponse(messages);

        const aiMessage = await messageModel.create({
            chat: activeChatId,
            content: result,
            role: "ai"
        });

        res.status(201).json({
            title,
            chat,
            aiMessage
        });

    } catch (error) {
        console.error("sendMessage error:", error);
        res.status(500).json({ message: error.message });
    }
};

export async function getChats(req, res) {
    try {
        const user = req.user;
        const chats = await chatModel.find({ user: user.id });

        res.status(200).json({
            message: "chat retrieved successfully",
            chats
        });
    } catch (error) {
        console.error("getChats error:", error);
        res.status(500).json({ message: error.message });
    }
}

export async function getMessages(req, res) {
    try {
        const { chatId } = req.params;

        const chat = await chatModel.findOne({
            _id: chatId,
            user: req.user.id
        });

        if (!chat) {
            return res.status(404).json({ message: "chat not found" });
        }

        const messages = await messageModel.find({ chat: chatId });

        res.status(200).json({
            message: "messages retrieved successfully",
            messages
        });
    } catch (error) {
        console.error("getMessages error:", error);
        res.status(500).json({ message: error.message });
    }
}

export async function deleteChat(req, res) {
    try {
        const { chatId } = req.params;

        const chat = await chatModel.findOneAndDelete({
            _id: chatId,
            user: req.user.id
        });

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        await messageModel.deleteMany({ chat: chatId });

        res.status(200).json({ message: "Chat deleted successfully" });

    } catch (error) {
        console.error("deleteChat error:", error);
        res.status(500).json({ message: error.message });
    }
}