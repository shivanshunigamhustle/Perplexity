import React, { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { useSelector } from 'react-redux'
import { useChat } from '../hooks/useChat'

const Dashboard = () => {
    const chat = useChat()
    const [chatInput, setChatInput] = React.useState('')
    const [isTyping, setIsTyping] = React.useState(false)
    const [selectedImage, setSelectedImage] = React.useState(null) // { base64, mimeType, preview }
    const chats = useSelector((state) => state.chat.chats)
    const currentChatId = useSelector((state) => state.chat.currentChatId)
    const user = useSelector((state) => state.auth.user)
    const messagesEndRef = useRef(null)
    const fileInputRef = useRef(null)

    useEffect(() => {
        chat.initializeSocketConnection()
        chat.handleGetChats()
    }, [])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chats, currentChatId])

    const handleImageSelect = (e) => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = () => {
            const base64 = reader.result.split(',')[1]
            setSelectedImage({
                base64,
                mimeType: file.type,
                preview: reader.result
            })
        }
        reader.readAsDataURL(file)
    }

    const handleSubmitMessage = (event) => {
        event.preventDefault()
        if (!chatInput.trim() && !selectedImage) return

        setIsTyping(true)
        setTimeout(() => setIsTyping(false), 5000)

        if (selectedImage) {
            chat.handleSendImage(selectedImage.base64, selectedImage.mimeType, chatInput)
            setSelectedImage(null)
            setChatInput('')
        } else {
            chat.handleSendMessage(chatInput)
            setChatInput('')
        }
    }

    const openChat = (chatId) => {
        chat.handleOpenChat(chatId)
    }

    const currentMessages = currentChatId ? (chats[currentChatId]?.messages || []) : []

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');

                * { box-sizing: border-box; margin: 0; padding: 0; }

                :root {
                    --bg: #04050a;
                    --surface: #080c14;
                    --surface2: #0d1220;
                    --border: rgba(99, 179, 237, 0.08);
                    --border-active: rgba(99, 179, 237, 0.25);
                    --accent: #63b3ed;
                    --accent2: #9f7aea;
                    --accent-glow: rgba(99, 179, 237, 0.15);
                    --text: #e8edf5;
                    --text-muted: rgba(232, 237, 245, 0.4);
                    --user-bubble: rgba(99, 179, 237, 0.12);
                    --ai-bubble: rgba(13, 18, 32, 0.95);
                    --font-display: 'Syne', sans-serif;
                    --font-mono: 'JetBrains Mono', monospace;
                }

                body { background: var(--bg); }

                .dashboard {
                    display: flex;
                    height: 100vh;
                    width: 100vw;
                    overflow: hidden;
                    font-family: var(--font-display);
                    background: var(--bg);
                    position: relative;
                }

                .dashboard::before {
                    content: '';
                    position: fixed;
                    top: -20%;
                    left: 30%;
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(ellipse, rgba(99, 179, 237, 0.04) 0%, transparent 70%);
                    pointer-events: none;
                    z-index: 0;
                }

                .sidebar {
                    width: 280px;
                    min-width: 280px;
                    height: 100vh;
                    background: var(--surface);
                    border-right: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    padding: 0;
                    position: relative;
                    z-index: 10;
                }

                .sidebar-header {
                    padding: 28px 24px 20px;
                    border-bottom: 1px solid var(--border);
                }

                .logo {
                    font-size: 20px;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                    color: var(--text);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .logo-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: var(--accent);
                    box-shadow: 0 0 12px var(--accent);
                    animation: pulse 2s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.8); }
                }

                .new-chat-btn {
                    margin: 16px 24px;
                    padding: 10px 16px;
                    background: var(--accent-glow);
                    border: 1px solid var(--border-active);
                    border-radius: 10px;
                    color: var(--accent);
                    font-family: var(--font-display);
                    font-size: 13px;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                    cursor: pointer;
                    text-transform: uppercase;
                    transition: all 0.2s ease;
                    width: calc(100% - 48px);
                    text-align: left;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .new-chat-btn:hover {
                    background: rgba(99, 179, 237, 0.2);
                    border-color: var(--accent);
                }

                .sidebar-section-label {
                    padding: 0 24px 8px;
                    font-size: 10px;
                    font-weight: 600;
                    letter-spacing: 2px;
                    color: var(--text-muted);
                    text-transform: uppercase;
                }

                .chat-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 0 12px 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .chat-list::-webkit-scrollbar { width: 3px; }
                .chat-list::-webkit-scrollbar-track { background: transparent; }
                .chat-list::-webkit-scrollbar-thumb { background: var(--border-active); border-radius: 10px; }

                .chat-item {
                    padding: 10px 12px;
                    border-radius: 8px;
                    background: transparent;
                    border: 1px solid transparent;
                    color: var(--text-muted);
                    font-family: var(--font-display);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.15s ease;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    width: 100%;
                }

                .chat-item:hover {
                    background: var(--surface2);
                    border-color: var(--border);
                    color: var(--text);
                }

                .chat-item.active {
                    background: var(--accent-glow);
                    border-color: var(--border-active);
                    color: var(--accent);
                }

                .sidebar-footer {
                    padding: 16px 24px;
                    border-top: 1px solid var(--border);
                }

                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .user-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: linear-gradient(135deg, var(--accent), var(--accent2));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 13px;
                    font-weight: 700;
                    color: white;
                    flex-shrink: 0;
                }

                .user-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    overflow: hidden;
                    position: relative;
                    z-index: 1;
                }

                .messages-area {
                    flex: 1;
                    overflow-y: auto;
                    padding: 32px 0;
                    scroll-behavior: smooth;
                }

                .messages-area::-webkit-scrollbar { width: 4px; }
                .messages-area::-webkit-scrollbar-track { background: transparent; }
                .messages-area::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }

                .messages-inner {
                    max-width: 760px;
                    margin: 0 auto;
                    padding: 0 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: calc(100vh - 160px);
                    gap: 16px;
                }

                .empty-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 20px;
                    background: var(--accent-glow);
                    border: 1px solid var(--border-active);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                }

                .empty-title {
                    font-size: 22px;
                    font-weight: 700;
                    color: var(--text);
                    letter-spacing: -0.5px;
                }

                .empty-sub {
                    font-size: 14px;
                    color: var(--text-muted);
                    font-family: var(--font-mono);
                }

                .message-row {
                    display: flex;
                    flex-direction: column;
                    animation: fadeUp 0.3s ease;
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .message-row.user { align-items: flex-end; }
                .message-row.ai { align-items: flex-start; }

                .message-label {
                    font-size: 10px;
                    font-weight: 600;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    margin-bottom: 6px;
                    font-family: var(--font-mono);
                }

                .message-row.user .message-label { color: rgba(99, 179, 237, 0.5); }
                .message-row.ai .message-label { color: rgba(159, 122, 234, 0.5); }

                .message-bubble {
                    max-width: 80%;
                    border-radius: 16px;
                    padding: 14px 18px;
                    font-size: 15px;
                    line-height: 1.65;
                    font-weight: 400;
                }

                .message-row.user .message-bubble {
                    background: var(--user-bubble);
                    border: 1px solid rgba(99, 179, 237, 0.2);
                    color: var(--text);
                    border-bottom-right-radius: 4px;
                }

                .message-row.ai .message-bubble {
                    background: var(--ai-bubble);
                    border: 1px solid var(--border);
                    color: var(--text);
                    border-bottom-left-radius: 4px;
                }

                .message-image {
                    max-width: 300px;
                    max-height: 300px;
                    border-radius: 12px;
                    object-fit: cover;
                    margin-bottom: 8px;
                    border: 1px solid var(--border-active);
                }

                .message-bubble p { margin-bottom: 8px; }
                .message-bubble p:last-child { margin-bottom: 0; }
                .message-bubble ul, .message-bubble ol { padding-left: 20px; margin-bottom: 8px; }
                .message-bubble li { margin-bottom: 4px; }
                .message-bubble code {
                    font-family: var(--font-mono);
                    font-size: 13px;
                    background: rgba(99, 179, 237, 0.1);
                    border: 1px solid rgba(99, 179, 237, 0.15);
                    padding: 2px 6px;
                    border-radius: 4px;
                    color: var(--accent);
                }
                .message-bubble pre {
                    background: rgba(0,0,0,0.4);
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    padding: 14px;
                    overflow-x: auto;
                    margin: 8px 0;
                    font-family: var(--font-mono);
                    font-size: 13px;
                }
                .message-bubble pre code {
                    background: none;
                    border: none;
                    padding: 0;
                    color: var(--text);
                }

                .typing-indicator {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    padding: 14px 18px;
                    background: var(--ai-bubble);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    border-bottom-left-radius: 4px;
                    width: fit-content;
                    animation: fadeUp 0.3s ease;
                }

                .typing-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: var(--accent);
                    animation: typingBounce 1.2s ease-in-out infinite;
                }

                .typing-dot:nth-child(2) { animation-delay: 0.2s; background: var(--accent2); }
                .typing-dot:nth-child(3) { animation-delay: 0.4s; }

                @keyframes typingBounce {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                    30% { transform: translateY(-6px); opacity: 1; }
                }

                .input-area {
                    padding: 16px 24px 24px;
                    background: linear-gradient(to top, var(--bg) 70%, transparent);
                }

                .input-inner {
                    max-width: 760px;
                    margin: 0 auto;
                }

                /* Image preview */
                .image-preview-box {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 14px;
                    background: var(--surface2);
                    border: 1px solid var(--border-active);
                    border-radius: 12px;
                    margin-bottom: 8px;
                }

                .image-preview-thumb {
                    width: 48px;
                    height: 48px;
                    border-radius: 8px;
                    object-fit: cover;
                    border: 1px solid var(--border-active);
                }

                .image-preview-info {
                    flex: 1;
                    font-size: 13px;
                    color: var(--text-muted);
                    font-family: var(--font-mono);
                }

                .image-preview-remove {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    font-size: 18px;
                    line-height: 1;
                    transition: color 0.15s;
                    padding: 4px;
                }

                .image-preview-remove:hover { color: #fc8181; }

                .input-box {
                    display: flex;
                    align-items: flex-end;
                    gap: 12px;
                    background: var(--surface);
                    border: 1px solid var(--border-active);
                    border-radius: 16px;
                    padding: 12px 12px 12px 18px;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }

                .input-box:focus-within {
                    border-color: rgba(99, 179, 237, 0.4);
                    box-shadow: 0 0 0 3px rgba(99, 179, 237, 0.06);
                }

                .input-field {
                    flex: 1;
                    background: transparent;
                    border: none;
                    outline: none;
                    color: var(--text);
                    font-family: var(--font-display);
                    font-size: 15px;
                    font-weight: 400;
                    resize: none;
                    min-height: 24px;
                    max-height: 120px;
                    line-height: 1.5;
                    padding: 2px 0;
                }

                .input-field::placeholder { color: var(--text-muted); }

                .upload-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: var(--surface2);
                    border: 1px solid var(--border-active);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: all 0.2s ease;
                    color: var(--text-muted);
                }

                .upload-btn:hover {
                    background: var(--accent-glow);
                    border-color: var(--accent);
                    color: var(--accent);
                }

                .upload-btn.has-image {
                    background: var(--accent-glow);
                    border-color: var(--accent);
                    color: var(--accent);
                }

                .send-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: var(--accent);
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: all 0.2s ease;
                    color: #04050a;
                }

                .send-btn:hover:not(:disabled) {
                    background: #90cdf4;
                    transform: scale(1.05);
                }

                .send-btn:disabled {
                    background: var(--border-active);
                    cursor: not-allowed;
                    color: var(--text-muted);
                }

                .send-btn svg, .upload-btn svg { width: 18px; height: 18px; }

                .input-hint {
                    margin-top: 8px;
                    text-align: center;
                    font-size: 11px;
                    color: var(--text-muted);
                    font-family: var(--font-mono);
                }

                @media (max-width: 768px) {
                    .sidebar { display: none; }
                }
            `}</style>

            <div className="dashboard">
                {/* Sidebar */}
                <aside className="sidebar">
                    <div className="sidebar-header">
                        <div className="logo">
                            <div className="logo-dot" />
                            Perplexity
                        </div>
                    </div>

                    <button className="new-chat-btn" onClick={() => chat.handleOpenChat(null)}>
                        <span>+</span> New Chat
                    </button>

                    <div className="sidebar-section-label">Recent</div>

                    <div className="chat-list">
                        {Object.values(chats).map((c, index) => (
                            <button
                                key={index}
                                className={`chat-item ${(c._id || c.id) === currentChatId ? 'active' : ''}`}
                                onClick={() => openChat(c._id || c.id)}
                                type="button"
                            >
                                {c.title || "New Chat"}
                            </button>
                        ))}
                    </div>

                    <div className="sidebar-footer">
                        <div className="user-info">
                            <div className="user-avatar">
                                {user?.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="user-name">{user?.username || 'User'}</div>
                        </div>
                    </div>
                </aside>

                {/* Main */}
                <main className="main">
                    <div className="messages-area">
                        <div className="messages-inner">
                            {currentMessages.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">⚡</div>
                                    <div className="empty-title">Ask anything</div>
                                    <div className="empty-sub">// start a new conversation</div>
                                </div>
                            ) : (
                                currentMessages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`message-row ${message.role === 'user' ? 'user' : 'ai'}`}
                                    >
                                        <div className="message-label">
                                            {message.role === 'user' ? 'You' : 'AI'}
                                        </div>
                                        <div className="message-bubble">
                                            {/* Image show karo agar hai */}
                                            {message.imageUrl && (
                                                <img
                                                    src={message.imageUrl}
                                                    alt="uploaded"
                                                    className="message-image"
                                                />
                                            )}
                                            {message.role === 'user' ? (
                                                <p>{message.content}</p>
                                            ) : (
                                                <ReactMarkdown
                                                    components={{
                                                        p: ({ children }) => <p>{children}</p>,
                                                        ul: ({ children }) => <ul>{children}</ul>,
                                                        ol: ({ children }) => <ol>{children}</ol>,
                                                        code: ({ children }) => <code>{children}</code>,
                                                        pre: ({ children }) => <pre>{children}</pre>,
                                                    }}
                                                >
                                                    {message.content}
                                                </ReactMarkdown>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}

                            {isTyping && (
                                <div className="message-row ai">
                                    <div className="message-label">AI</div>
                                    <div className="typing-indicator">
                                        <div className="typing-dot" />
                                        <div className="typing-dot" />
                                        <div className="typing-dot" />
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input */}
                    <div className="input-area">
                        <div className="input-inner">

                            {/* Image preview */}
                            {selectedImage && (
                                <div className="image-preview-box">
                                    <img src={selectedImage.preview} alt="preview" className="image-preview-thumb" />
                                    <div className="image-preview-info">Image selected — add a prompt or just send</div>
                                    <button
                                        className="image-preview-remove"
                                        onClick={() => setSelectedImage(null)}
                                        type="button"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}

                            <form onSubmit={handleSubmitMessage}>
                                <div className="input-box">
                                    {/* Hidden file input */}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleImageSelect}
                                    />

                                    {/* Upload button */}
                                    <button
                                        type="button"
                                        className={`upload-btn ${selectedImage ? 'has-image' : ''}`}
                                        onClick={() => fileInputRef.current?.click()}
                                        title="Upload image"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                            <circle cx="8.5" cy="8.5" r="1.5"/>
                                            <polyline points="21 15 16 10 5 21"/>
                                        </svg>
                                    </button>

                                    <input
                                        className="input-field"
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder={selectedImage ? "Add a prompt for the image..." : "Ask anything..."}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault()
                                                handleSubmitMessage(e)
                                            }
                                        }}
                                    />

                                    <button
                                        type="submit"
                                        className="send-btn"
                                        disabled={!chatInput.trim() && !selectedImage}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="22" y1="2" x2="11" y2="13" />
                                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                            <div className="input-hint">Enter to send · Shift+Enter for new line · 🖼 Upload image for AI description</div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}

export default Dashboard