'use client';

import { useState, useRef, useEffect } from 'react';
import { generateFinancialAidResponse } from '@/lib/gemini';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => scrollToBottom(), [messages]);

  // Load chat history from Firebase
  useEffect(() => {
    const q = query(collection(db, 'financialAidChat'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData = [];
      querySnapshot.forEach((doc) => messagesData.push({ id: doc.id, ...doc.data() }));
      setMessages(messagesData);
    });
    return unsubscribe;
  }, []);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);
    setError('');

    try {
      const userMessageData = { content: userMessage, role: 'user', timestamp: serverTimestamp() };
      await addDoc(collection(db, 'financialAidChat'), userMessageData);

      const recentMessages = messages.slice(-6);
      const aiResponse = await generateFinancialAidResponse(userMessage, recentMessages);

      const aiMessageData = { content: aiResponse, role: 'assistant', timestamp: serverTimestamp() };
      await addDoc(collection(db, 'financialAidChat'), aiMessageData);
    } catch (err) {
      console.error(err);
      setError('Failed to send message. Please try again.');
      const errorMessageData = {
        content: "I'm sorry, I encountered an error processing your request.",
        role: 'assistant',
        timestamp: serverTimestamp(),
      };
      await addDoc(collection(db, 'financialAidChat'), errorMessageData);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    "How do I apply for FAFSA?",
    "What's the difference between grants and loans?",
    "When is the FAFSA deadline for next year?",
    "How can I find scholarships I qualify for?",
    "What documents do I need for financial aid?",
    "How does the financial aid appeal process work?",
  ];

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto bg-white shadow-xl rounded-lg border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-lg">💬</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">Financial Aid Assistant</h1>
            <p className="text-sm opacity-90">Expert help with FAFSA, scholarships, loans, and more</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-600 mt-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎓</span>
            </div>
            <p className="text-lg font-medium mb-2">Welcome to Financial Aid Help!</p>
            <p className="text-sm mb-6">I'm here to assist with all your financial aid questions.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInput(question)}
                  className="p-3 bg-white border border-gray-200 rounded-lg text-sm text-left hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 shadow-sm"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white border border-gray-200 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
              <span className={`text-xs block mt-2 ${message.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500">Researching financial aid information...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-w-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={sendMessage} className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
        <div className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about FAFSA, scholarships, loans, deadlines..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow-md"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          <span className="text-xs text-gray-500">Try asking about: </span>
          {suggestedQuestions.slice(0, 2).map((question, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setInput(question)}
              className="text-xs text-blue-600 hover:text-blue-800 underline transition-colors"
            >
              {question.split('?')[0]}?
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
