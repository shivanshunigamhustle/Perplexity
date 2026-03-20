import React, { useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { useSelector } from 'react-redux'
import { useChat } from '../hooks/useChat'

const Dashboard = () => {
    const chat = useChat()
    const [chatInput, setChatInput] = React.useState('')
    const chats = useSelector((state) => state.chat.chats)
    const currentChatId = useSelector((state) => state.chat.currentChatId)
    const user = useSelector((state) => state.auth.user)

    useEffect(() => {
        chat.initializeSocketConnection()
        chat.handleGetChats()
    }, [])

    const handleSubmitMessage = (event) => {
        event.preventDefault()
        if (!chatInput.trim()) return
        console.log("Sending message:", chatInput)
        console.log("Current user:", user)
        console.log("Current chatId:", currentChatId)
        chat.handleSendMessage(chatInput)
        setChatInput('')
    }

    const openChat = (chatId) => {
        chat.handleOpenChat(chatId)
    }

    const currentMessages = currentChatId ? (chats[currentChatId]?.messages || []) : []

    return (
        <main className='min-h-screen w-full bg-[#07090f] p-3 text-white md:p-5'>
            <section className='mx-auto flex h-[calc(100vh-1.5rem)] w-full gap-4 rounded-3xl p-1 md:h-[calc(100vh-2.5rem)] md:gap-6 md:p-1'>

                {/* Sidebar */}
                <aside className='hidden h-full w-72 shrink-0 rounded-3xl border border-white/20 bg-[#080b12] p-4 md:flex md:flex-col'>
                    <h1 className='mb-5 text-3xl font-semibold tracking-tight'>Perplexity</h1>
                    <div className='space-y-2 overflow-y-auto'>
                        {Object.values(chats).map((c, index) => (
                            <button
                                onClick={() => openChat(c._id || c.id)}
                                key={index}
                                type='button'
                                className='w-full cursor-pointer rounded-xl border border-white/60 bg-transparent px-3 py-2 text-left text-base font-medium text-white/90 transition hover:border-white hover:text-white'
                            >
                                {c.title || "New Chat"}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Main Chat Area */}
                <div className='relative flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/20 bg-[#080b12]'>

                    {/* Messages */}
                    <div className='flex-1 overflow-y-auto p-4 pb-28'>
                        {currentMessages.length === 0 ? (
                            <div className='flex h-full items-center justify-center text-white/30'>
                                <p>Start a conversation...</p>
                            </div>
                        ) : (
                            currentMessages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`mb-4 max-w-[75%] rounded-2xl px-4 py-3 ${
                                        message.role === 'user'
                                            ? 'ml-auto bg-white/10 text-white'
                                            : 'mr-auto border border-white/25 bg-[#0f1626] text-white/90'
                                    }`}
                                >
                                    {message.role === 'user' ? (
                                        <p>{message.content}</p>
                                    ) : (
                                        <ReactMarkdown
                                            components={{
                                                p: ({ children }) => <p className='mb-2 last:mb-0'>{children}</p>,
                                                ul: ({ children }) => <ul className='mb-2 list-disc pl-5'>{children}</ul>,
                                                ol: ({ children }) => <ol className='mb-2 list-decimal pl-5'>{children}</ol>,
                                                code: ({ children }) => <code className='rounded bg-white/10 px-1 py-0.5'>{children}</code>,
                                                pre: ({ children }) => <pre className='mb-2 overflow-x-auto rounded-xl bg-black/30 p-3'>{children}</pre>,
                                            }}
                                        >
                                            {message.content}
                                        </ReactMarkdown>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Input Footer */}
                    <footer className='absolute bottom-2 left-2 right-2 rounded-3xl border border-white/60 bg-[#080b12] p-4 md:p-5'>
                        <form onSubmit={handleSubmitMessage} className='flex flex-col gap-3 md:flex-row'>
                            <input
                                type='text'
                                value={chatInput}
                                onChange={(event) => setChatInput(event.target.value)}
                                placeholder='Type your message...'
                                className='w-full rounded-2xl border border-white/50 bg-transparent px-4 py-3 text-lg text-white outline-none transition placeholder:text-white/45 focus:border-white/90'
                            />
                            <button
                                type='submit'
                                disabled={!chatInput.trim()}
                                className='rounded-2xl border border-white/60 px-6 py-3 text-lg font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50'
                            >
                                Send
                            </button>
                        </form>
                    </footer>

                </div>
            </section>
        </main>
    )
}

export default Dashboard