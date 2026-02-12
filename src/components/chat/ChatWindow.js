"use client";
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Send, MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react';
import axios from 'axios';

// Ensure this matches your Chat Server Port
const CHAT_SERVER_URL = 'http://localhost:5000';

const ChatWindow = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimize, setIsMinimize] = useState(false);

    const [currentUser, setCurrentUser] = useState(null); // { userId, name, email }
    const [targetEmail, setTargetEmail] = useState('marpar7777@gmail.com');
    const [userEmail, setUserEmail] = useState('maraheem812@gmail.com');
    const [targetUser, setTargetUser] = useState(null); // { userId, name }

    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');

    const scrollRef = useRef(null);

    // Initial Login / Connection
    const handleLogin = async () => {
        if (!userEmail) return;
        try {
            // Get My ID
            const res = await axios.post(`${CHAT_SERVER_URL}/api/auth/login`, { email: userEmail });
            const myUser = { ...res.data, email: userEmail };
            setCurrentUser(myUser);

            // Connect Socket
            const newSocket = io(CHAT_SERVER_URL);
            newSocket.emit('join_chat', myUser.userId);
            setSocket(newSocket);

            // Listener is now handled in a separate useEffect to support dynamic target filtering

        } catch (error) {
            console.error("Login failed", error);
        }
    };

    // Generate a simple unique ID
    const generateMessageId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    // Handle Incoming Messages
    useEffect(() => {
        if (!socket) return;

        socket.on('receive_message', (data) => {
            if (!targetUser) return;

            const isFromTarget = data.senderId === targetUser.userId;
            const isToTarget = data.receiverId === targetUser.userId;
            const isMe = data.senderId === currentUser?.userId;

            if (isFromTarget || (isMe && isToTarget)) {
                setMessages((prev) => {
                    // Deduplicate based on unique ID (limit double entry bug)
                    // If the message has an ID, check if we already have it.
                    // If no ID (legacy), fall back to timestamp+sender check.
                    const exists = prev.some((msg) => {
                        if (data.id && msg.id) {
                            return msg.id === data.id;
                        }
                        return msg.timestamp === data.timestamp && msg.senderId === data.senderId;
                    });

                    if (exists) return prev;

                    return [...prev, data];
                });
            }
        });

        return () => {
            socket.off('receive_message');
        };
    }, [socket, targetUser, currentUser]);

    // Prepare Chat with Target
    const startChat = async () => {
        if (!targetEmail || !currentUser) return;
        try {
            // Resolve Target ID
            const res = await axios.post(`${CHAT_SERVER_URL}/api/auth/login`, { email: targetEmail });
            setTargetUser(res.data);

            // Fetch History
            const histRes = await axios.get(`${CHAT_SERVER_URL}/api/chat/history/${currentUser.userId}/${res.data.userId}`);
            // Ensure history doesn't have partial duplicates if we fetch multiple times (though setMessages replaces it here)
            setMessages(histRes.data);

        } catch (error) {
            console.error("Failed to setup chat target", error);
        }
    };

    const sendMessage = () => {
        if (!inputText.trim() || !socket || !targetUser) return;

        const msgData = {
            id: generateMessageId(), // Client-generated unique ID
            senderId: currentUser.userId,
            receiverId: targetUser.userId,
            text: inputText,
            timestamp: new Date().toISOString()
        };

        socket.emit('send_message', msgData);
        // Optimistic update is removed to prevent "triple" entry if server is slow.
        // We rely on the server echo (which we now listen to and deduplicate).
        setInputText('');
    };

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (socket) socket.disconnect();
        };
    }, [socket]);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all z-[100]"
            >
                <MessageSquare className="text-white h-7 w-7" />
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-[100] transition-all duration-300 flex flex-col ${isMinimize ? 'h-16 w-72' : 'h-[500px] w-96'}`}>
            {/* Header */}
            <div className="bg-indigo-600 p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-white font-semibold">
                        {targetUser ? `Chat with ${targetUser.name}` : 'Support Chat'}
                    </span>
                </div>
                <div className="flex gap-2 text-indigo-200">
                    <button onClick={() => setIsMinimize(!isMinimize)}>
                        {isMinimize ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                    </button>
                    <button onClick={() => setIsOpen(false)}>
                        <X size={18} />
                    </button>
                </div>
            </div>

            {!isMinimize && (
                <div className="flex-1 flex flex-col bg-slate-50 dark:bg-zinc-900/50">
                    {/* Setup / Login Area if not ready */}
                    {!currentUser ? (
                        <div className="p-6 flex flex-col gap-4 justify-center h-full">
                            <h3 className="text-lg font-bold text-zinc-800 dark:text-white">Welcome!</h3>
                            <input
                                className="p-2 rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                placeholder="Your Email"
                                value={userEmail}
                                onChange={e => setUserEmail(e.target.value)}
                            />
                            <button onClick={handleLogin} className="bg-indigo-600 text-white p-2 rounded">Start</button>
                        </div>
                    ) : !targetUser ? (
                        <div className="p-6 flex flex-col gap-4 justify-center h-full">
                            <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Logged in as {currentUser.name}</h3>
                            <label className="text-xs uppercase font-bold text-zinc-500">Chat with (Email):</label>
                            <input
                                className="p-2 rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                placeholder="Target Email"
                                value={targetEmail}
                                onChange={e => setTargetEmail(e.target.value)}
                            />
                            <button onClick={startChat} className="bg-indigo-600 text-white p-2 rounded">Connect</button>
                        </div>
                    ) : (
                        <>
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {messages.map((msg, idx) => {
                                    const isMe = msg.senderId === currentUser.userId;
                                    return (
                                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-sm border border-zinc-100 dark:border-zinc-700 rounded-tl-sm'}`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={scrollRef} />
                            </div>

                            {/* Input */}
                            <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex gap-2">
                                <input
                                    className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 ring-indigo-500/50 dark:text-white"
                                    placeholder="Type a message..."
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                />
                                <button
                                    onClick={sendMessage}
                                    className="h-9 w-9 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 transition-colors"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatWindow;
