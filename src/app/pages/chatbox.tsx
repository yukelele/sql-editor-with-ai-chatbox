"use client";

import { useState, useEffect } from "react";

export default function ChatBox() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);

  const [input, setInput] = useState("");

  

  const handleSend = async () => {
    if (!input.trim()) return;

    const updatedMessages = [...messages,{ role: "user", content: input } ]

    setMessages(updatedMessages);
    setInput("");

    
    const res = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ messages: updatedMessages})
                });
                    const data = await res.json();
                    
                    console.log('CHAT: ', data);

    setMessages(prev => [...prev, { role: "assistant", content: data.aiResponse}])
  };


  return (
    <div className="flex flex-col h-screen bg-gray-50 p-4">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-xs break-words ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="flex border-t border-gray-300 pt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-gray-300 rounded-l-lg outline-none"
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 rounded-r-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
