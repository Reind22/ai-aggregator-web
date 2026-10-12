"use client";

import { useState, useRef, useEffect } from "react";
import Logo from "../../components/Logo";
import LanguageMenu from "../../components/LanguageMenu";
import { apiFetch } from "../../lib/api";

const API_BASE = "/api";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [model, setModel] = useState("glm-5.3-flash");
  const [sidebarOpen, setSidebarOpen] = useState(false); // мобайл: закрыт
  const [isMobile, setIsMobile] = useState(false);
  const [isTemp, setIsTemp] = useState(false);
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatsHasMore, setChatsHasMore] = useState(false);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const models = [
    { id: "glm-5.3-flash", name: "GLM 5.3 Flash" },
    { id: "glm-5.3-flashx", name: "GLM 5.3 FlashX" },
    { id: "glm-5.2", name: "GLM 5.2" },
    { id: "glm-5.3", name: "GLM 5.3" },
    { id: "glm-5.1", name: "GLM 5.1" },
    { id: "mimo-v2.6-flash", name: "MiMo v2.6 Flash" },
    { id: "mimo-v2.6-pro", name: "MiMo v2.6 Pro" },
    { id: "mimo-v2.5-pro", name: "MiMo v2.5 Pro" },
    { id: "mimo-v2.5", name: "MiMo v2.5" },
    { id: "deepseek-flash", name: "DeepSeek Flash" },
    { id: "deepseek-v4-pro", name: "DeepSeek V4 Pro" },
  ];

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    const saved = localStorage.getItem("ai_token");
    if (saved) {
      setToken(saved);
      loadChats(saved);
    }
    // На десктопе сайдбар открыт по умолчанию
    if (window.innerWidth >= 768) setSidebarOpen(true);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChats = async () => {
    try {
      setChatsLoading(true);
      const res = await apiFetch("/chats/?limit=30");
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats || []);
        setChatsHasMore(!!data.has_more);
      }
    } catch (e) {}
    finally { setChatsLoading(false); }
  };

  const loadMoreChats = async () => {
    if (chatsLoading || !chatsHasMore) return;
    try {
      setChatsLoading(true);
      const res = await apiFetch(`/chats/?limit=30&offset=${chats.length}`);
      if (res.ok) {
        const data = await res.json();
        setChats((prev) => [...prev, ...(data.chats || [])]);
        setChatsHasMore(!!data.has_more);
      }
    } catch (e) {}
    finally { setChatsLoading(false); }
  };

  const openChat = async (id) => {
    try {
      const res = await apiFetch(`/chats/${id}/messages`);
      if (!res.ok) return;
      const msgs = await res.json();
      setMessages(msgs.map((m) => ({ role: m.role, content: m.content })));
      setIsTemp(false);
      setCurrentChatId(id);
      setSidebarOpen(window.innerWidth >= 768);
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
      // Стриминг через SSE: ответ появляется по мере генерации
      const res = await fetch(`${API_BASE}/chats/send/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: text, model, chat_id: currentChatId, is_temp: isTemp }),
      });

      if (!res.ok || !res.body) {
        // Ошибка может быть JSON или plain text
        let detail = "Ошибка сервера";
        try {
          const j = await res.json();
          detail = j.detail || detail;
        } catch (_) {
          const t = await res.text();
          if (t) detail = "Сервер недоступен";
        }
        setError(detail);
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: `⚠️ ${detail}`,
        }]);
        return;
      }

      // Читаем SSE-поток
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";
      let finished = false;

      const appendAssistant = (piece) => {
        setMessages((prev) => {
          const base = prev[prev.length - 1]?.role === "assistant" && !finished
            ? prev.slice(0, -1)
            : prev;
          return [...base, { role: "assistant", content: piece }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();  // незавершённая строка — в следующий чанк
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") continue;
          try {
            const ev = JSON.parse(payload);
            if (ev.text) {
              assistantText += ev.text;
              appendAssistant(assistantText);
            }
            if (ev.chat_id) setCurrentChatId(ev.chat_id);
            if (ev.usage) {
              // финальные цифры: input/output/cost_usd
              if (typeof ev.usage.cost_usd === "number") setBalance((b) => b);
            }
            if (ev.done) finished = true;
          } catch (_) {}
        }
      }

      if (assistantText) {
        loadChats();  // чат появился/обновился в истории
      } else if (!finished) {
        setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Пустой ответ сервера" }]);
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

  const newChat = () => { setMessages([]); setIsTemp(false); setCurrentChatId(null); };
  const tempChat = () => { setMessages([]); setIsTemp(true); };

  return (
    <div className="flex h-screen bg-surface-dark overflow-hidden">
      {/* Sidebar — белый */}
      {/* Overlay для мобилы */}
      {sidebarOpen && isMobile && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`${sidebarOpen ? "w-64" : "w-0"} ${
        isMobile ? "fixed z-40 h-full left-0 top-0 shadow-2xl" : "relative"
      } transition-all duration-300 bg-[#0d0d14] border-r border-white/[0.06] flex flex-col overflow-hidden flex-shrink-0`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <a href="/" className="flex items-center gap-2">
              <Logo size={24} />
              <span className="font-extrabold text-sm text-white">AI Combiner</span>
            </a>
            {isMobile && (
              <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-white p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center" aria-label="Закрыть меню">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button onClick={newChat} className="w-full bg-[#00FF00] hover:bg-[#00CC00] text-black rounded-lg py-2.5 font-bold transition-colors flex items-center justify-center gap-2">
            <span className="text-lg">+</span> Новый чат
          </button>
          <button onClick={() => { tempChat(); setCurrentChatId(null); }} className="w-full mt-2 border border-white/10 hover:border-[#00CC00]/50 rounded-lg py-2 text-sm text-gray-300 transition-colors">
            Временный чат
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2">
          {chats.length === 0 ? (
            <div className="px-3 py-2 text-xs text-ink-mute">История пуста</div>
          ) : (
            <>
            {chats.map((chat) => (
              <div key={chat.id} onClick={() => openChat(chat.id)} className="px-3 py-2.5 rounded-lg cursor-pointer text-sm text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-colors">
                {chat.title}
              </div>
            ))}
            {chatsHasMore && (
              <button
                onClick={loadMoreChats}
                disabled={chatsLoading}
                className="w-full mt-1 mb-2 px-3 py-2 text-xs text-[#00CC00] hover:bg-white/5 rounded-lg transition-colors disabled:opacity-40"
              >
                {chatsLoading ? "Загрузка…" : "Загрузить ещё"}
              </button>
            )}
            </>
          )}
        </div>
        <div className="p-4 border-t border-white/[0.06]">
          <div className="text-xs text-gray-500 mb-2">Остаток сегодня:</div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div className="bg-[#00CC00] h-2 rounded-full transition-all" style={{ width: balance !== null ? `${Math.min(100, balance * 200)}%` : "100%" }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {balance !== null ? `$${balance.toFixed(2)}` : "$0.50 (Free)"}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-white/[0.06] bg-[#0d0d14] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0" aria-label="Меню">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* Лого видно всегда (когда сайдбар закрыт) — быстрый выход на главную */}
            {(!sidebarOpen || isMobile) && (
              <a href="/" className="flex items-center gap-2 px-2 min-h-[44px] ml-1 border-l border-white/[0.08] pl-3" title="На главную">
                <Logo size={24} />
                <span className="font-extrabold text-sm text-white hidden sm:inline">AI Combiner</span>
              </a>
            )}
          </div>
          {isTemp && <span className="text-[#00FF00] text-sm">Временный чат (автоочистка 24ч)</span>}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageMenu compact />
            <select value={model} onChange={(e) => setModel(e.target.value)}
              className="bg-[#0d0d14] border border-white/10 rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-200 outline-none focus:border-[#00CC00] transition-colors max-w-[140px] sm:max-w-none">
              {models.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-center flex flex-col items-center justify-center" style={{ minHeight: "60vh" }}>
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
              {isGenerating ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
            </button>
          </div>
          {error && <div className="max-w-3xl mx-auto mt-2 text-xs text-red-400">{error}</div>}
        </div>
      </div>
    </div>
  );
}
