import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { socket, initializeSocketConnection, getChats, getMessages, sendMessage, sendImage, onMessageResponse, offMessageResponse, onImageUserMessage, offImageUserMessage } from "../service/chat.socket"
import { setChats, setCurrentChatId, createNewChat, addNewMessage, addMessages } from '../chat.slice'

export const useChat = () => {
    const dispatch = useDispatch()
    const currentChatId = useSelector((state) => state.chat.currentChatId)
    const user = useSelector((state) => state.auth.user)

    useEffect(() => {
        onMessageResponse(({ chat, title, aiMessage }) => {
            const activeChatId = chat?._id || currentChatId
            if (chat) dispatch(createNewChat({ chatId: chat._id, title: chat.title }))
            dispatch(addNewMessage({ chatId: activeChatId, content: aiMessage.content, role: "ai" }))
            dispatch(setCurrentChatId(activeChatId))
        })

        onImageUserMessage(({ chatId, content, imageUrl }) => {
            dispatch(addNewMessage({ chatId, content, role: "user", imageUrl }))
        })

        return () => {
            offMessageResponse()
            offImageUserMessage()
        }
    }, [currentChatId])

    const handleGetChats = async () => {
        if (!user) return

        if (!socket.connected) {
            socket.once("connect", async () => {
                const chats = await getChats(user._id)
                if (chats) {
                    const chatsMap = {}
                    chats.forEach(chat => { chatsMap[chat._id] = { ...chat, messages: [] } })
                    dispatch(setChats(chatsMap))
                }
            })
            return
        }

        const chats = await getChats(user._id)
        if (chats) {
            const chatsMap = {}
            chats.forEach(chat => { chatsMap[chat._id] = { ...chat, messages: [] } })
            dispatch(setChats(chatsMap))
        }
    }

    const handleOpenChat = async (chatId) => {
        dispatch(setCurrentChatId(chatId))
        if (!chatId || !socket.connected) return
        const messages = await getMessages(chatId)
        if (messages) dispatch(addMessages({ chatId, messages }))
    }

    const handleSendMessage = (message) => {
        if (!user || !socket.connected) return
        if (currentChatId) {
            dispatch(addNewMessage({ chatId: currentChatId, content: message, role: "user" }))
        }
        sendMessage(message, currentChatId, user._id)
    }

    const handleSendImage = (base64Image, mimeType, userPrompt) => {
        if (!user || !socket.connected) return

        const previewUrl = `data:${mimeType};base64,${base64Image}`

        if (currentChatId) {
            dispatch(addNewMessage({
                chatId: currentChatId,
                content: userPrompt || "Describe this image",
                role: "user",
                imageUrl: previewUrl
            }))
        }

        sendImage(base64Image, mimeType, userPrompt, currentChatId, user._id)
    }

    return {
        initializeSocketConnection,
        handleGetChats,
        handleOpenChat,
        handleSendMessage,
        handleSendImage,
    }
}