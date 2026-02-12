"use client";
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Cpu, Loader2, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

const FALLBACK_MESSAGE = "I don't have the specific details for that right now. I'll check with the senior team/project lead and get back to you.";

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I am the Nexor Navigator AI Agent. I can help you with Skill Gap Analysis, Role Mapping, and Upskilling queries.", sender: 'bot' }
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

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userText = inputValue;
        setInputValue('');

        const newUserMessage = {
            id: Date.now(),
            text: userText,
            sender: 'user'
        };

        setMessages(prev => [...prev, newUserMessage]);
        setIsTyping(true);

        try {
            const response = await fetch('/api/agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: userText,
                    history: messages.filter(m => (m.sender !== 'bot' || !m.isError) && m.id !== 1).map(m => ({
                        role: m.sender === 'user' ? 'user' : 'model',
                        parts: [{ text: m.text }]
                    }))
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Network response was not ok');
            }

            const data = await response.json();
            const botText = data.response;

            // Check for fallback/escalation
            const isEscalation = botText.includes("senior team/project lead");

            const newBotMessage = {
                id: Date.now() + 1,
                text: botText,
                sender: 'bot',
                isEscalation
            };

            setMessages(prev => [...prev, newBotMessage]);

        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage = {
                id: Date.now() + 1,
                text: error.message || "I'm having trouble connecting to the knowledge base right now. Please try again later.",
                sender: 'bot',
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] md:w-[400px] h-[600px] bg-black/90 backdrop-blur-xl border border-primary/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300 ring-1 ring-white/10">
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 bg-gradient-to-r from-primary/10 to-transparent flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/40 rounded-full blur-md animate-pulse"></div>
                                <div className="relative p-2 bg-black border border-primary/30 rounded-full">
                                    <Cpu size={20} className="text-primary" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold tracking-wide">Nexor AI Agent</h3>
                                <p className="text-[10px] text-primary/80 uppercase tracking-wider font-medium">RAG Powered v1.0</p>
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
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={clsx(
                                    "flex gap-3 max-w-[90%]",
                                    msg.sender === 'user' ? "ml-auto flex-row-reverse" : ""
                                )}
                            >
                                <div className={clsx(
                                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border",
                                    msg.sender === 'user'
                                        ? "bg-secondary/10 border-secondary/30 text-secondary"
                                        : msg.isEscalation
                                            ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                                            : "bg-primary/10 border-primary/30 text-primary"
                                )}>
                                    {msg.sender === 'user' ? <User size={14} /> : msg.isEscalation ? <AlertTriangle size={14} /> : <Bot size={14} />}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <div className={clsx(
                                        "p-3 rounded-2xl text-sm leading-relaxed",
                                        msg.sender === 'user'
                                            ? "bg-secondary/20 text-white rounded-tr-none border border-secondary/20"
                                            : msg.isEscalation
                                                ? "bg-amber-900/20 text-amber-100 rounded-tl-none border border-amber-500/20"
                                                : "bg-white/5 text-gray-200 rounded-tl-none border border-white/5"
                                    )}>
                                        {msg.text}
                                    </div>
                                    {msg.sender === 'bot' && (
                                        <span className="text-[10px] text-gray-500 ml-1">
                                            {msg.isEscalation ? "Escalated to Senior Team" : "AI Generated"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex gap-3 max-w-[85%]">
                                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 text-primary flex items-center justify-center flex-shrink-0">
                                    <Loader2 size={14} className="animate-spin" />
                                </div>
                                <div className="bg-white/5 text-gray-400 p-3 rounded-2xl rounded-tl-none border border-white/5 text-xs flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    <span className="ml-1">Retreiving context...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-black/40">
                        <div className="relative flex items-center group">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask about Skill Gaps, Roadmap..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-4 pr-12 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner"
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim()}
                                className="absolute right-2 p-2 bg-primary/80 hover:bg-primary text-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                        <div className="text-center mt-2">
                            <p className="text-[10px] text-gray-600">Powered by RAG & Gemini 1.5 Pro</p>
                        </div>
                    </form>
                </div>
            )}

            {/* Toggle Button - Pulsing Effect */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "relative p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 z-50 group",
                    isOpen
                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 rotate-90 scale-90"
                        : "bg-black border border-primary/50 text-primary"
                )}
            >
                {/* Ping animation behind the button */}
                {!isOpen && (
                    <span className="absolute inline-flex h-full w-full rounded-full bg-primary/30 opacity-75 animate-ping inset-0 z-[-1]"></span>
                )}

                {isOpen ? <X size={24} /> : <Cpu size={28} className="drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" />}

                {/* Status Dot */}
                {!isOpen && (
                    <span className="absolute top-0 right-0 h-3 w-3 bg-green-500 border-2 border-black rounded-full"></span>
                )}
            </button>
        </div>
    );
}
