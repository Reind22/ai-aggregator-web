"use client";

import { useState, useRef, useEffect } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [model, setModel] = useState("glm-5.3-flash");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chats, setChats] = useState([
    { id: 1, title: "Новый чат", active: true },
  ]);
  const [isTemp, setIsTemp] = useState(false);
  const messagesEndRef = useRef(null);

  const models = [
    { id: "glm-5.3-flash", name: "GLM 5.3 Flash", tier: "Free" },
    { id: "glm-5.3-flashx", name: "GLM 5.3 FlashX", tier: "Basic" },
    { id: "glm-5.2", name: "GLM 5.2", tier: "Pro" },
    { id: "glm-5.3", name: "GLM 5.3", tier: "Ultra" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isGenerating) return;

    const userMsg = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsGenerating(true);

    // Добавляю placeholder для ответа
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content, model }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Обновляю последний message (placeholder) с реальным ответом
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: data.response || data.error || "Ошибка ответа",
        };
        return updated;
      });
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: `❌ Ошибка: ${err.message}`,
        };
        return updated;
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const newChat = () => {
    setMessages([]);
    setIsTemp(false);
  };

  const tempChat = () => {
    setMessages([]);
    setIsTemp(true);
  };

  return (
    <div className="flex h-screen bg-surface-dark overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 bg-surface-card border-r border-surface-border flex flex-col overflow-hidden flex-shrink-0`}
      >
        <div className="p-4">
          <button
            onClick={newChat}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-lg py-2.5 font-medium transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span> Новый чат
          </button>
          <button
            onClick={tempChat}
            className="w-full mt-2 border border-surface-border hover:border-gray-500 rounded-lg py-2 text-sm text-gray-300 transition-colors"
          >
            👻 Временный чат
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors ${
                chat.active
                  ? "bg-surface-hover text-white"
                  : "text-gray-400 hover:bg-surface-hover hover:text-gray-200"
              }`}
            >
              {chat.title}
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-surface-border">
          <div className="text-xs text-gray-500 mb-2">Остаток сегодня:</div>
          <div className="w-full bg-surface-border rounded-full h-2">
            <div className="bg-accent-green h-2 rounded-full" style={{ width: "75%" }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">75% осталось</div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="border-b border-surface-border px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ☰
          </button>
          {isTemp && (
            <span className="text-yellow-500 text-sm">👻 Временный чат</span>
          )}
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="bg-surface-card border border-surface-border rounded-lg px-3 py-1.5 text-sm text-gray-200 outline-none"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.tier})
              </option>
            ))}
          </select>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">⚡</div>
                <h2 className="text-2xl font-semibold mb-2">AI Aggregator</h2>
                <p className="text-gray-500">
                  Напиши сообщение, чтобы начать диалог
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-primary-600 text-white rounded-br-sm"
                      : "bg-surface-card border border-surface-border rounded-bl-sm prose-chat"
                  }`}
                >
                  {msg.content || (isGenerating && i === messages.length - 1 ? (
                    <span className="inline-flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></span>
                    </span>
                  ) : msg.content)}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-surface-border p-4">
          <div className="max-w-3xl mx-auto flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Напиши сообщение..."
              className="flex-1 bg-surface-card border border-surface-border rounded-xl px-4 py-3 resize-none outline-none focus:border-primary-500 transition-colors placeholder:text-gray-600"
              rows={1}
              disabled={isGenerating}
              style={{ minHeight: "48px", maxHeight: "200px" }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isGenerating}
              className="bg-primary-600 hover:bg-primary-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl px-5 transition-colors"
            >
              {isGenerating ? "⏳" : "➤"}
            </button>
          </div>
          <div className="max-w-3xl mx-auto mt-2 text-xs text-gray-600">
            Enter — отправить, Shift+Enter — новая строка
          </div>
        </div>
      </div>
    </div>
  );
}
