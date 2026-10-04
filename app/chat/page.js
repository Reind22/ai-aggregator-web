"use client";

import { useState, useRef, useEffect } from "react";
import Logo from "../../components/Logo";
import LanguageMenu from "../../components/LanguageMenu";

const API_BASE = "/api";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [model, setModel] = useState("glm-5.3-flash");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isTemp, setIsTemp] = useState(false);
  const [chats, setChats] = useState([]);
  const [token, setToken] = useState(null);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const models = [
    { id: "glm-5.3-flash", name: "GLM 5.3 Flash", tier: "Free" },
    { id: "glm-5.3-flashx", name: "GLM 5.3 FlashX", tier: "Basic" },
    { id: "glm-5.2", name: "GLM 5.2", tier: "Pro" },
    { id: "glm-5.3", name: "GLM 5.3", tier: "Ultra" },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("ai_token");
    if (saved) {
      setToken(saved);
      loadChats(saved);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChats = async (t) => {
    try {
      const res = await fetch(`${API_BASE}/chats/`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) setChats(await res.json());
    } catch (e) {}
  };

  const sendMessage = async () => {
    if (!input.trim() || isGenerating) return;
    const text = input.trim();
    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/chats/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: text, model, chat_id: null }),
      });
      const data = await res.json();
      if (res.ok && data.content) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
        if (data.balance_remaining !== undefined) setBalance(data.balance_remaining);
      } else {
        const detail = data.detail || "Ошибка сервера";
        setError(detail);
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: `⚠️ ${detail}\n\nAI-ответы появятся после подключения API-ключей модели.`,
        }]);
      }
    } catch (e) {
      setError(String(e));
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Сервер недоступен" }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const newChat = () => { setMessages([]); setIsTemp(false); };
  const tempChat = () => { setMessages([]); setIsTemp(true); };

  return (
    <div className="flex h-screen bg-surface-dark overflow-hidden">
      {/* Sidebar — белый */}
      <div className={`${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 bg-[#0d0d14] border-r border-white/[0.06] flex flex-col overflow-hidden flex-shrink-0`}>
        <div className="p-4">
          <a href="/" className="flex items-center gap-2 mb-4">
            <Logo size={24} />
            <span className="font-extrabold text-sm text-white">AI Combiner</span>
          </a>
          <button onClick={newChat} className="w-full bg-[#00FF00] hover:bg-[#00CC00] text-black rounded-lg py-2.5 font-bold transition-colors flex items-center justify-center gap-2">
            <span className="text-lg">+</span> Новый чат
          </button>
          <button onClick={tempChat} className="w-full mt-2 border border-white/10 hover:border-[#00CC00]/50 rounded-lg py-2 text-sm text-gray-300 transition-colors">
            👻 Временный чат
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2">
          {chats.length === 0 ? (
            <div className="px-3 py-2 text-xs text-ink-mute">История пуста</div>
          ) : (
            chats.map((chat) => (
              <div key={chat.id} className="px-3 py-2.5 rounded-lg cursor-pointer text-sm text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-colors">
                {chat.title}
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t border-white/[0.06]">
          <div className="text-xs text-gray-500 mb-2">Остаток сегодня:</div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div className="bg-[#00CC00] h-2 rounded-full transition-all" style={{ width: balance !== null ? `${Math.min(100, balance * 200)}%` : "100%" }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {balance !== null ? `$${balance.toFixed(3)}` : "$0.500 (Free)"}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-white/[0.06] bg-[#0d0d14] px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition-colors text-lg">☰</button>
          {isTemp && <span className="text-[#00FF00] text-sm">👻 Временный чат</span>}
          <div className="flex items-center gap-2">
            <LanguageMenu />
            <select value={model} onChange={(e) => setModel(e.target.value)}
              className="bg-[#0d0d14] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-200 outline-none focus:border-[#00CC00] transition-colors">
              {models.map((m) => (<option key={m.id} value={m.id}>{m.name} ({m.tier})</option>))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-20">
                <div className="mx-auto mb-4 w-fit"><Logo size={64} /></div>
                <h2 className="text-2xl font-extrabold mb-2 text-white">AI Combiner</h2>
                <p className="text-gray-400 mb-1">Напиши сообщение, чтобы начать диалог</p>
                <p className="text-gray-600 text-sm">GLM 5.3, 5.2, 5.1, DeepSeek — переключай модель сверху</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-[#00CC00] text-black rounded-br-sm font-medium"
                    : "bg-white/[0.06] border border-white/[0.06] rounded-bl-sm text-gray-200"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-white/[0.06] border border-white/[0.06] rounded-2xl rounded-bl-sm px-4 py-3">
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#999] rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-[#999] rounded-full animate-bounce" style={{animationDelay:'0.15s'}}></span>
                    <span className="w-1.5 h-1.5 bg-[#999] rounded-full animate-bounce" style={{animationDelay:'0.3s'}}></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-white/[0.06] bg-[#0d0d14] p-4">
          <div className="max-w-3xl mx-auto flex gap-3">
            <textarea value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Напиши сообщение..."
              className="flex-1 bg-[#0d0d14] border border-white/10 rounded-xl px-4 py-3 resize-none outline-none focus:border-[#00CC00] transition-colors placeholder:text-gray-600 text-gray-100"
              rows={1} disabled={isGenerating}
              style={{ minHeight: "48px", maxHeight: "200px" }} />
            <button onClick={sendMessage} disabled={!input.trim() || isGenerating}
              className="bg-[#00FF00] hover:bg-[#00CC00] disabled:opacity-30 disabled:cursor-not-allowed text-[#0A2A0A] rounded-xl px-5 font-semibold transition-colors">
              {isGenerating ? "⏳" : "➤"}
            </button>
          </div>
          {error && <div className="max-w-3xl mx-auto mt-2 text-xs text-red-400">{error}</div>}
        </div>
      </div>
    </div>
  );
}
