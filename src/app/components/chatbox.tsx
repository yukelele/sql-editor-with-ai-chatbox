"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Copy, Check, Play } from "lucide-react"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";

const AI_LOADING_MESSAGE = { role: "assistant", content: '###Thinking###'};
const AI_ERROR_MESSAGE = {role: "assistant", content: `Sorry, I'm currently unable to provide a response. There seems to be an error on the server side. Please try again later.`}

interface SQLEditorPageProps {
    handleInsertSQL: (sql:string) => void
}

export default function ChatBox({handleInsertSQL}: SQLEditorPageProps) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [insertedIndex, setInsertedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 1500)
  };

  const handleInsert = async (text: string, index: number) => {
    handleInsertSQL(text);
    setInsertedIndex(index)
    setTimeout(() => setInsertedIndex(null), 1500)
  };
  

  const handleSend = async () => {
    if (!input.trim()) return;

    setLoading(true);

    const updatedMessages = [...messages, { role: "user", content: input } ]

    setMessages([...updatedMessages, AI_LOADING_MESSAGE]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: updatedMessages})
            });
      const data = await res.json();
      
      setMessages([...updatedMessages, { role: "assistant", content: data.aiResponse}]);
    } catch(err) {
      console.error(err);
      setMessages([...updatedMessages, AI_ERROR_MESSAGE]);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col h-screen bg-gray-50 p-4">
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((msg, idx) => {
            const sqlMatch = msg.content.match(/```sql([\s\S]*?)```/i);
            const sqlCode = sqlMatch ? sqlMatch[1].trim() : null;
            const plainText = msg.content.replace(/```sql[\s\S]*?```/gi, "").trim();

            return(
            <div
                key={idx}
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
                    {plainText === AI_LOADING_MESSAGE.content 
                    ? <div className="flex items-center gap-2"><Spinner />{"Thinking..."}</div> 
                    : <div>{plainText}</div>}

                    {sqlCode && (
                        <div className="mt-3">
                        <div className="relative bg-zinc-950 text-white rounded-xl border border-zinc-800 overflow-hidden">
                            <div className="flex items-center justify-between px-3 py-2 bg-zinc-900 border-b border-zinc-800">
                            <span className="text-xs text-zinc-400 font-mono uppercase">
                                SQL
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleInsert(sqlCode, idx)}
                                    className="text-zinc-400 hover:text-gray"
                                >
                                    {insertedIndex === idx ? <Check size={16} /> : <Play size={16} />}
                                </Button>
                                
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(sqlCode, idx)}
                                    className="text-zinc-400 hover:text-gray"
                                >
                                    {copiedIndex === idx ? <Check size={16} /> : <Copy size={16} />}
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

      <div className="flex border-t border-gray-300 pt-2">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-gray-300 rounded-l-lg outline-none"
          disabled={loading}
        />
        <Button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 rounded-r-lg"
          disabled={loading}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
