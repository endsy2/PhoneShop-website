import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { NETWORK_CONFIG } from '../network/Network_EndPoint';

const API_URL_COMMON = `${NETWORK_CONFIG.apiBaseUrl}/common`;

const ChatSupport = () => {
    const [chatOpen, setChatOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [conversationId, setConversationId] = useState(null);
    const [roomCode, setRoomCode] = useState(null);
    const [messageInput, setMessageInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Start chat
    const handleStartChat = async () => {
        if (chatOpen) {
            setChatOpen(false);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${API_URL_COMMON}/chat/start`,
                {},
                { withCredentials: true }
            );
            setConversationId(response.data.conversation_id);
            setRoomCode(response.data.room_code);
            setChatOpen(true);
            loadMessages(response.data.conversation_id);
        } catch (error) {
            console.error("Error starting chat:", error);
            alert("Error starting chat. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Load messages
    const loadMessages = async (convId) => {
        try {
            const response = await axios.get(
                `${API_URL_COMMON}/chat/${convId}/messages`,
                { withCredentials: true }
            );
            setMessages(response.data.messages || []);
        } catch (error) {
            console.error("Error loading messages:", error);
        }
    };

    // Send message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim()) return;

        const messageToSend = messageInput;
        setMessageInput("");

        try {
            await axios.post(
                `${API_URL_COMMON}/chat/message`,
                {
                    conversation_id: conversationId,
                    message: messageToSend,
                    sender_type: "customer"
                },
                { withCredentials: true }
            );
            loadMessages(conversationId);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessageInput(messageToSend);
        }
    };

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Poll for new messages every 3 seconds
    useEffect(() => {
        if (!conversationId || !chatOpen) return;

        const interval = setInterval(() => {
            loadMessages(conversationId);
        }, 3000);

        return () => clearInterval(interval);
    }, [conversationId, chatOpen]);

    return (
        <>
            {/* Chat Button */}
            <button
                onClick={handleStartChat}
                className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center font-bold text-white text-2xl transition-all ${
                    chatOpen
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
                }`}
                title={chatOpen ? "Close Chat" : "Open Chat"}
            >
                {chatOpen ? '✕' : '💬'}
            </button>

            {/* Chat Window */}
            {chatOpen && (
                <div className="fixed bottom-24 right-6 w-96 h-96 bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200 z-50">
                    {/* Header */}
                    <div className="bg-green-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                        <div>
                            <h3 className="font-bold">Live Chat Support</h3>
                            <p className="text-xs text-green-100">We're here to help!</p>
                        </div>
                        <button
                            onClick={() => setChatOpen(false)}
                            className="text-white hover:bg-green-700 p-1 rounded"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {messages.length === 0 ? (
                            <div className="text-center text-gray-500 mt-8">
                                <p className="text-sm">Start a conversation</p>
                                <p className="text-xs">Our team will respond shortly</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-xs px-4 py-2 rounded-lg ${
                                            msg.sender_type === 'customer'
                                                ? 'bg-green-600 text-white rounded-br-none'
                                                : 'bg-gray-300 text-gray-800 rounded-bl-none'
                                        }`}
                                    >
                                        <p className="text-sm">{msg.message}</p>
                                        <p className="text-xs opacity-70 mt-1">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="border-t p-3 flex gap-2 bg-white rounded-b-lg">
                        <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !messageInput.trim()}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Send
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default ChatSupport;
