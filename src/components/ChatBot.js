"use client";
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, MessageSquare } from 'lucide-react';
import clsx from 'clsx';

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I'm your AI career assistant. How can I help you today?", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isTyping, isOpen]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newUserMessage = {
            id: Date.now(),
            text: inputValue,
            sender: 'user'
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInputValue('');
        setIsTyping(true);

        setTimeout(() => {
            const newBotMessage = {
                id: Date.now() + 1,
                text: "I am a frontend demo bot. Backend is coming soon!",
                sender: 'bot'
            };
            setMessages(prev => [...prev, newBotMessage]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300">
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/20 rounded-lg">
                                <Bot size={20} className="text-primary" />
                            </div>
                            <div>
                                <h3 className="text-white font-medium">AI Assistant</h3>
                                <p className="text-xs text-gray-400">Always here to help</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={clsx(
                                    "flex gap-3 max-w-[85%]",
                                    msg.sender === 'user' ? "ml-auto flex-row-reverse" : ""
                                )}
                            >
                                <div className={clsx(
                                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                    msg.sender === 'user' ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-primary"
                                )}>
                                    {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                                </div>
                                <div className={clsx(
                                    "p-3 rounded-2xl text-sm",
                                    msg.sender === 'user'
                                        ? "bg-secondary/20 text-white rounded-tr-none"
                                        : "bg-white/10 text-gray-200 rounded-tl-none"
                                )}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex gap-3 max-w-[85%]">
                                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                                    <Bot size={14} />
                                </div>
                                <div className="bg-white/10 text-gray-200 p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-white/5">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask anything..."
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim()}
                                className="absolute right-2 p-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "p-4 rounded-full shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-110 active:scale-95",
                    isOpen
                        ? "bg-white/10 text-white hover:bg-white/20 rotate-90"
                        : "bg-gradient-to-r from-primary to-secondary text-white"
                )}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>
        </div>
    );
}
