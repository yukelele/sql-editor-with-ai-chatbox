"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Copy, Check, Plus, Play } from "lucide-react"
import { useState } from "react";
import { Button } from "@/src/components/ui/button";

export default function ChatBox(
  {onInsertSQL}: {onInsertSQL?: (sql:string) => void}
) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);

  const [input, setInput] = useState("");

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 1500)
  }
  

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
        {messages.map((msg, i) => {
            const sqlMatch = msg.content.match(/```sql([\s\S]*?)```/i);
            const sqlCode = sqlMatch ? sqlMatch[1].trim() : null;
            const plainText = msg.content.replace(/```sql[\s\S]*?```/gi, "").trim();

            return(
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
                    {plainText && <div>{plainText}</div>}

                    {sqlCode && (
                        <div className="mt-3">
                        <div className="relative bg-zinc-950 text-white rounded-xl border border-zinc-800 overflow-hidden">
                            <div className="flex items-center justify-between px-3 py-2 bg-zinc-900 border-b border-zinc-800">
                            <span className="text-xs text-zinc-400 font-mono uppercase">
                                SQL
                            </span>
                            <div className="flex items-center gap-2">
                              {onInsertSQL && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onInsertSQL(sqlCode)}
                                    className="text-zinc-400 hover:text-gray"
                                >
                                    <Play size={14} className="mr-1" />
                                </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(sqlCode, i)}
                                    className="text-zinc-400 hover:text-gray"
                                >
                                    {copiedIndex === i ? <Check size={16} /> : <Copy size={16} />}
                                </Button>
                            </div>
                            </div>
                            <SyntaxHighlighter
                                language="sql"
                                style={oneDark}
                                customStyle={{
                                    margin: 0,
                                    padding: "1rem",
                                    background: "transparent",
                                    fontSize: "0.875rem",
                            }}
                            >
                                {sqlCode}
                            </SyntaxHighlighter>
                        </div>
                        </div>
                    )}
                </div>
            </div>
            )
        })
        }
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
