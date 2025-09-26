"use client";

import React, { useState, useRef, useEffect } from "react";

const SAMPLE_QUESTIONS = [
  "How much should I save monthly to reach ₹10 lakh in 5 years?",
  "What scholarships could I target with 85% in 12th and a 3.6 GPA?",
  "Show a starter budget if my monthly income is ₹50,000 and expenses are ₹35,000.",
  "How do I reduce my education loan interest burden effectively?",
  "What is a safe withdrawal rate for retirement planning in India?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I’m FinAid, your financial planning assistant. Ask about budgeting, scholarships, loans, or retirement.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function sendMessage(e) {
    e?.preventDefault?.();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const nextMessages = [
      ...messages,
      { id: `${Date.now()}-u`, role: "user", content: trimmed },
    ];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.map(({ role, content }) => ({ role, content })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-a`, role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-e`, role: "assistant", content: "Sorry, I had trouble responding. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function askSample(q) {
    setInput(q);
    setTimeout(() => sendMessage(), 0);
  }

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Financial Aid Chat</h1>
        <p className="text-sm text-gray-800">Budget planning, scholarships, grants, loans, and retirement guidance.</p>
      </header>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SAMPLE_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => askSample(q)}
            className="text-left bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg px-3 py-2 text-sm text-gray-900"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div ref={listRef} className="h-96 overflow-y-auto space-y-4 mb-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  m.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 rounded-2xl px-4 py-3 text-sm shadow-sm">
                <span>Thinking</span>
                <span className="ml-1 loading-dots">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            className="flex-1 form-input"
            placeholder="Ask anything about budgeting, scholarships, loans, or retirement..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}


