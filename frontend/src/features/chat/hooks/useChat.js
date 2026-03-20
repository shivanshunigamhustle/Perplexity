import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { socket, initializeSocketConnection, getChats, sendMessage, onMessageResponse, offMessageResponse } from "../service/chat.socket"
import { setChats, setCurrentChatId, createNewChat, addNewMessage } from '../chat.slice'

export const useChat = () => {
    const dispatch = useDispatch()
    const currentChatId = useSelector((state) => state.chat.currentChatId)
    const user = useSelector((state) => state.auth.user)

    useEffect(() => {
        onMessageResponse(({ chat, title, aiMessage }) => {
            console.log("message_response received:", { chat, title, aiMessage })

            const activeChatId = chat?._id || currentChatId

            if (chat) {
                dispatch(createNewChat({ chatId: chat._id, title: chat.title }))
            }

            dispatch(addNewMessage({
                chatId: activeChatId,
                content: aiMessage.content,
                role: "ai"
            }))

            dispatch(setCurrentChatId(activeChatId))
        })

        return () => offMessageResponse()
    }, [currentChatId])

    const handleGetChats = async () => {
        console.log("handleGetChats called, user:", user)
        if (!user) return

        if (!socket.connected) {
            console.log("Socket not connected, waiting for connect...")
            socket.once("connect", async () => {
                console.log("Socket connected, now getting chats")
                const chats = await getChats(user._id)
                console.log("chats received:", chats)
                if (chats) {
                    const chatsMap = {}
                    chats.forEach(chat => {
                        chatsMap[chat._id] = { ...chat, messages: [] }
                    })
                    dispatch(setChats(chatsMap))
                }
            })
            return
        }

        const chats = await getChats(user._id)
        console.log("chats received:", chats)
        if (chats) {
            const chatsMap = {}
            chats.forEach(chat => {
                chatsMap[chat._id] = { ...chat, messages: [] }
            })
            dispatch(setChats(chatsMap))
        }
    }

    const handleOpenChat = (chatId) => {
        dispatch(setCurrentChatId(chatId))
    }

    const handleSendMessage = (message) => {
        console.log("handleSendMessage called, user:", user?._id)
        console.log("currentChatId:", currentChatId)
        console.log("Socket connected?", socket.connected)

        if (!user) {
            console.log("NO USER - returning")
            return
        }

        if (!socket.connected) {
            console.log("Socket not connected - returning")
            return
        }

        if (currentChatId) {
            dispatch(addNewMessage({
                chatId: currentChatId,
                content: message,
                role: "user"
            }))
        }

        console.log("Emitting send_message to socket...")
        sendMessage(message, currentChatId, user._id)
    }

    return {
        initializeSocketConnection,
        handleGetChats,
        handleOpenChat,
        handleSendMessage,
    }
}