"use client";

import { useState, useRef, useEffect } from "react";
import Logo from "../../components/Logo";
import ModelPickerModal from "../../components/ModelPickerModal";
import MarkdownRenderer from "../../components/MarkdownRenderer";
import LanguageMenu from "../../components/LanguageMenu";
import { apiFetch } from "../../lib/api";

const API_BASE = "/api";
const MAX_MESSAGE_CHARS = 100000;

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [model, setModel] = useState("claude-haiku-5-5");
  const [sidebarOpen, setSidebarOpen] = useState(false); // мобайл: закрыт
  const [isMobile, setIsMobile] = useState(false);
  const [isTemp, setIsTemp] = useState(false);
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatsHasMore, setChatsHasMore] = useState(false);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [attachedFile, setAttachedFile] = useState(null); // {name, content}
  const [branchPoint, setBranchPoint] = useState(null); // {messageId, variantIndex}
  const [token, setToken] = useState(null);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);
  const [composerExpanded, setComposerExpanded] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const fallbackModels = [
    // ═══ Zhipu GLM ═══
    { id: "glm-5.3-flash", name: "GLM 5.3 Flash" },
    { id: "glm-5.3-flashx", name: "GLM 5.3 FlashX" },
    { id: "glm-5.2", name: "GLM 5.2" },
    { id: "glm-5.3", name: "GLM 5.3" },
    { id: "glm-5.1", name: "GLM 5.1" },
    // ═══ Claude (Anthropic) ═══
    { id: "claude-opus-5-5", name: "Claude Opus 5.5" },
    { id: "claude-opus-5", name: "Claude Opus 5" },
    { id: "claude-sonnet-5", name: "Claude Sonnet 5" },
    { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6" },
    { id: "claude-haiku-4-5", name: "Claude Haiku 4.5" },
    { id: "claude-opus-4-8", name: "Claude Opus 4.8" },
    { id: "claude-opus-4-7", name: "Claude Opus 4.7" },
    { id: "claude-opus-4-6", name: "Claude Opus 4.6" },
    // ═══ OpenAI GPT ═══
    { id: "gpt-6.1-sol", name: "GPT-6.1 Sol" },
    { id: "gpt-6-sol", name: "GPT-6 Sol" },
    { id: "gpt-6-astra", name: "GPT-6 Astra" },
    { id: "gpt-5.6-sol", name: "GPT-5.6 Sol" },
    { id: "gpt-5.6-terra", name: "GPT-5.6 Terra" },
    // ═══ Google Gemini ═══
    { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash" },
    { id: "gemini-3.7-flash", name: "Gemini 3.7 Flash" },
    { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash" },
    { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash" },
    { id: "gemini-3.1-pro", name: "Gemini 3.1 Pro" },
    { id: "gemini-3-pro", name: "Gemini 3 Pro" },
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
    // ═══ Alibaba Qwen ═══
    { id: "qwen3.8-max", name: "Qwen 3.8 Max" },
    { id: "qwen3.8-flash", name: "Qwen 3.8 Flash" },
    { id: "qwen3.7-plus", name: "Qwen 3.7 Plus" },
    // ═══ Moonshot Kimi ═══
    { id: "kimi-k2.6", name: "Kimi K2.6" },
    { id: "kimi-k2.7-code", name: "Kimi K2.7 Code" },
    { id: "kimi-k3", name: "Kimi K3" },
    // ═══ xAI Grok ═══
    { id: "grok-4.7", name: "Grok 4.7" },
    { id: "grok-4.7-build-fast", name: "Grok 4.7 Build Fast" },
    { id: "grok-4.6", name: "Grok 4.6" },
    { id: "grok-4.5", name: "Grok 4.5" },
    { id: "grok-4.3", name: "Grok 4.3" },
    { id: "grok-4.20-0309-reasoning", name: "Grok 4.20 Reasoning" },
    { id: "grok-4.20-0309-non-reasoning", name: "Grok 4.20" },
    { id: "grok-4.20-multi-agent-0309", name: "Grok 4.20 Multi-Agent" },
    { id: "grok-build-0.1", name: "Grok Build 0.1" },
    // ═══ Xiaomi MiMo ═══
    { id: "mimo-v2.6-flash", name: "MiMo v2.6 Flash" },
    { id: "mimo-v2.6-pro", name: "MiMo v2.6 Pro" },
    { id: "mimo-v2.5-pro", name: "MiMo v2.5 Pro" },
    { id: "mimo-v2.5", name: "MiMo v2.5" },
    // ═══ DeepSeek ═══
    { id: "deepseek-flash", name: "DeepSeek Flash" },
    { id: "deepseek-v4-pro", name: "DeepSeek V4 Pro" },
    // ═══ Tencent Hunyuan ═══
    { id: "hy4-preview", name: "Hunyuan H4 Preview" },
    { id: "hy3", name: "Hunyuan H3" },
    // ═══ MiniMax ═══
    { id: "minimax-m3", name: "MiniMax M3" },
    { id: "minimax-m2.7", name: "MiniMax M2.7" },
    // ═══ Meta Muse ═══
    { id: "muse-spark-1.3-contributor", name: "Muse Spark 1.3" },
    // ═══ RelayFast (R) ═══
    { id: "claude-fable-5", name: "Claude fable 5 (R)" },
    { id: "claude-fable-5-1", name: "Claude fable 5 1 (R)" },
    { id: "claude-haiku-5-5", name: "Claude haiku 5 5 (R)" },
    { id: "claude-sonnet-5-5", name: "Claude sonnet 5 5 (R)" },
    { id: "deepseek-v4-flash", name: "DeepSeek v4 flash (R)" },
    { id: "deepseek-v4-flash-0731", name: "DeepSeek v4 flash 0731 (R)" },
    { id: "deepseek-v4-flash-vision-exp", name: "DeepSeek v4 flash vision exp (R)" },
    { id: "deepseek-v4-pro-0813", name: "DeepSeek v4 pro 0813 (R)" },
    { id: "deepseek-v4.1-flash", name: "DeepSeek v4.1 flash (R)" },
    { id: "deepseek-v4.1-flash-1017", name: "DeepSeek v4.1 flash 1017 (R)" },
    { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 pro preview (R)" },
    { id: "gemini-4-argon", name: "Gemini 4 argon (R)" },
    { id: "gemini-nano-banana-2.1", name: "Gemini nano banana 2.1 (R)" },
    { id: "gemini-omni-fast", name: "Gemini omni fast (R)" },
    { id: "gpt-5.5", name: "GPT 5.5 (R)" },
    { id: "gpt-5.6-luna", name: "GPT 5.6 luna (R)" },
    { id: "gpt-6-luna", name: "GPT 6 luna (R)" },
    { id: "gpt-image-2", name: "GPT Image 2 (R)" },
    { id: "gpt-image-2.5", name: "GPT Image 2.5 (R)" },
    { id: "gpt-image-2.5-flare", name: "GPT Image 2.5 flare (R)" },
    { id: "gpt-image-2.5-flare-2k", name: "GPT Image 2.5 flare 2k (R)" },
    { id: "gpt-image-2.5-flare-4k", name: "GPT Image 2.5 flare 4k (R)" },
    { id: "gpt-image-2.5-sunburst", name: "GPT Image 2.5 sunburst (R)" },
    { id: "gpt-image-2.5-sunburst-2k", name: "GPT Image 2.5 sunburst 2k (R)" },
    { id: "gpt-image-2.5-sunburst-4k", name: "GPT Image 2.5 sunburst 4k (R)" },
    { id: "grok-imagine-image-2.0", name: "Grok Imagine image 2.0 (R)" },
    { id: "grok-imagine-video-1.5", name: "Grok Imagine video 1.5 (R)" },
    { id: "hy4", name: "Hunyuan 4 (R)" },
    { id: "kling-3.0", name: "Kling 3.0 (R)" },
    { id: "minimax-h3-1440p", name: "MiniMax h3 1440p (R)" },
    { id: "minimax-h3-768p", name: "MiniMax h3 768p (R)" },
    { id: "minimax-m3.1-flash-preview", name: "MiniMax m3.1 flash preview (R)" },
    { id: "muse-spark-1.3", name: "Muse spark 1.3 (R)" },
    { id: "muse-wonder", name: "Muse wonder (R)" },
    { id: "seedance-2.0-fast", name: "Seedance 2.0 fast (R)" },
    { id: "seedance-2.0-mini", name: "Seedance 2.0 mini (R)" },
    { id: "seedance-2.5", name: "Seedance 2.5 (R)" },
    { id: "veo-3.1-lite", name: "Veo 3.1 lite (R)" },
    { id: "viduq3-turbo", name: "Vidu 3 turbo (R)" },
    { id: "wan-3.0", name: "Wan 3.0 (R)" },
  ];

  const [models, setModels] = useState(fallbackModels);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [modelStatuses, setModelStatuses] = useState({});
  const [usageCounts, setUsageCounts] = useState({});

  useEffect(() => {
    apiFetch("/models").then((data) => {
      if (Array.isArray(data) && data.length) setModels(data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    // Статусы моделей (green/yellow/red) — обновление раз в 60с
    const fetchStatuses = () => {
      apiFetch("/chats/models/status").then((d) => {
        if (d && d.statuses) setModelStatuses(d.statuses);
      }).catch(() => {});
      // Популярность моделей (сообщения за 30 дней) — сортировка в пикере
      apiFetch("/chats/models/usage").then((d) => {
        if (d && d.usage) setUsageCounts(d.usage);
      }).catch(() => {});
    };
    fetchStatuses();
    const st = setInterval(fetchStatuses, 60000);
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

  // Автоскролл к отправленному сообщению
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last && last.role === "user") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

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
      setMessages(msgs.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        variants: m.variants || (m.role === "assistant" ? [m.content] : undefined),
        variantIndex: m.role === "assistant" && m.variants?.length
          ? Math.max(0, m.variants.indexOf(m.content))
          : 0,
      })));
      setIsTemp(false);
      setCurrentChatId(id);
      setBranchPoint(null);
      setSidebarOpen(window.innerWidth >= 768);
    } catch (e) {}
  };

  const sendMessage = async (regenerateIndex = null) => {
    const isRegeneration = regenerateIndex !== null;
    if (isGenerating) return;
    const sourceUser = isRegeneration
      ? [...messages.slice(0, regenerateIndex)].reverse().find((m) => m.role === "user")
      : null;
    if (isRegeneration && !sourceUser) return;
    const text = isRegeneration ? "" : input.trim();
    if (!isRegeneration && !text) return;
    if (text.length > MAX_MESSAGE_CHARS) {
      setError(`Сообщение слишком длинное: ${text.length.toLocaleString("ru-RU")} из ${MAX_MESSAGE_CHARS.toLocaleString("ru-RU")} символов`);
      return;
    }
    if (!isRegeneration) {
      const userMsg = { role: "user", content: attachedFile ? `${text}\n\n📎 ${attachedFile.name}` : text };
      setMessages((prev) => {
        if (!branchPoint) return [...prev, userMsg];
        const branchIndex = prev.findIndex((msg) => msg.id === branchPoint.messageId);
        return [...(branchIndex >= 0 ? prev.slice(0, branchIndex + 1) : prev), userMsg];
      });
      setInput("");
      setBranchPoint(null);
    }
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
        body: JSON.stringify({
          message: text, model, chat_id: currentChatId, is_temp: isTemp,
          regenerate: isRegeneration,
          regenerate_message_id: isRegeneration ? messages[regenerateIndex]?.id || null : null,
          branch_message_id: !isRegeneration ? branchPoint?.messageId || null : null,
          branch_variant_index: !isRegeneration ? branchPoint?.variantIndex ?? null : null,
          file_name: isRegeneration ? null : (attachedFile?.name || null), file_content: isRegeneration ? null : (attachedFile?.content || null),
        }),
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
      let targetAssistantIndex = isRegeneration ? regenerateIndex : null;

      const appendAssistant = (piece) => {
        setMessages((prev) => {
          if (targetAssistantIndex !== null) {
            const next = [...prev];
            const current = next[targetAssistantIndex] || { role: "assistant", content: "" };
            next[targetAssistantIndex] = { ...current, content: piece };
            return next;
          }
          const last = prev[prev.length - 1];
          const base = last?.role === "assistant" && !finished ? prev.slice(0, -1) : prev;
          return [...base, { role: "assistant", content: piece, variants: [piece], variantIndex: 0 }];
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
            if (ev.message_id) {
              setMessages((prev) => {
                const index = targetAssistantIndex !== null ? targetAssistantIndex : prev.length - 1;
                return prev.map((msg, i) => i === index ? {
                  ...msg,
                  id: ev.message_id,
                  variants: ev.variants || msg.variants,
                  variantIndex: ev.variants?.length ? ev.variants.length - 1 : msg.variantIndex,
                } : msg);
              });
            }
            if (ev.usage) {
              // финальные цифры: input/output/cost_usd
              if (typeof ev.usage.cost_usd === "number") setBalance((b) => b);
            }
            if (ev.done) finished = true;
          } catch (_) {}
        }
      }

      if (assistantText) {
        setMessages((prev) => {
          const index = targetAssistantIndex !== null ? targetAssistantIndex : prev.length - 1;
          const current = prev[index];
          if (!current || current.role !== "assistant") return prev;
          const variants = current.variants || [];
          if (targetAssistantIndex !== null) {
            return prev.map((msg, i) => i === index
              ? { ...msg, content: assistantText, variants: [...variants, assistantText], variantIndex: variants.length }
              : msg);
          }
          return prev.map((msg, i) => i === index ? { ...msg, content: assistantText } : msg);
        });
        loadChats();  // чат появился/обновился в истории
      } else if (!finished) {
        setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Пустой ответ сервера" }]);
      }
    } catch (e) {
      setError(String(e));
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Сервер недоступен" }]);
    } finally {
      setIsGenerating(false);
      setAttachedFile(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const resizeComposer = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxHeight = composerExpanded ? Math.floor(window.innerHeight * 0.55) : 160;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  };

  useEffect(() => { resizeComposer(); }, [input, composerExpanded]);

  // Шапка: показывается при скролле вверх, прячется при скролле вниз (мобильный UX)
  const lastScrollY = useRef(0);
  const handleMessagesScroll = (e) => {
    const y = e.target.scrollTop;
    const delta = y - lastScrollY.current;
    if (y < 40) setHeaderVisible(true);        // у верха — всегда показываем
    else if (delta > 6) setHeaderVisible(false);  // тянем вниз — прячем
    else if (delta < -6) setHeaderVisible(true);  // тянем вверх — показываем
    lastScrollY.current = y;
  };

  const newChat = () => { setMessages([]); setIsTemp(false); setCurrentChatId(null); };
  const tempChat = () => { setMessages([]); setIsTemp(true); };

  const copyMessage = async (content) => {
    try { await navigator.clipboard.writeText(content); }
    catch (_) { setError("Не удалось скопировать сообщение"); }
  };

  const cycleVariant = (index, delta) => {
    const msg = messages[index];
    if (!msg?.variants?.length) return;
    const next = (msg.variantIndex + delta + msg.variants.length) % msg.variants.length;
    setBranchPoint({ messageId: msg.id, variantIndex: next });
    setMessages((prev) => prev.map((item, i) => i === index
      ? { ...item, variantIndex: next, content: item.variants[next] }
      : item));
  };

  return (
    <div className="flex h-screen bg-surface-dark overflow-hidden" style={{ height: "100dvh" }}>
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
            {!isMobile && (
              <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-white transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center" aria-label="Свернуть панель" title="Свернуть панель">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            )}
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
              <div key={chat.id} onClick={() => openChat(chat.id)} className="group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-colors">
                <span className="truncate">{chat.title}</span>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!confirm("Удалить чат «" + (chat.title || "") + "»?")) return;
                    const res = await apiFetch(`/chats/${chat.id}`, { method: "DELETE", auth: !!token });
                    if (res.ok) {
                      setChats((prev) => prev.filter((c) => c.id !== chat.id));
                      if (currentChatId === chat.id) { setCurrentChatId(null); setMessages([]); }
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all flex-shrink-0 ml-2 px-1"
                  title="Удалить чат" aria-label="Удалить чат"
                >✕</button>
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
        <div
          className={`border-b border-white/[0.06] bg-[#0d0d14] px-4 flex items-center justify-between overflow-hidden transition-all duration-200 ${headerVisible ? "max-h-20 opacity-100 py-3" : "max-h-0 opacity-0 py-0"}`}
        >
          {/* Мобайл: бургер открывает панель; десктоп: панель открыта постоянно, бургер в шапке не нужен */}
          <div className="flex items-center gap-1">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0" aria-label="Меню">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            {(!sidebarOpen || isMobile) && (
              <a href="/" className="flex items-center gap-2 px-2 min-h-[44px] border-l border-white/[0.08] pl-3" title="На главную">
                <Logo size={24} />
                <span className="font-extrabold text-sm text-white hidden sm:inline">AI Combiner</span>
              </a>
            )}
          </div>
          {isTemp && <span className="text-[#00FF00] text-sm">Временный чат (автоочистка 24ч)</span>}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageMenu compact />
            <button onClick={() => setPickerOpen(true)}
              className="bg-[#0d0d14] border border-white/10 rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-200 outline-none focus:border-[#00CC00] transition-colors max-w-[170px] sm:max-w-none flex items-center gap-1.5">
              <span className="truncate">{(models.find((mm) => mm.id === model) || {}).name || model}</span>
              <span className="text-gray-500 text-[10px]">▾</span>
            </button>
            <ModelPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)}
              models={models} modelStatuses={modelStatuses} current={model}
              usageCounts={usageCounts}
              onPick={(id) => { setModel(id); setPickerOpen(false); }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-6 pb-36 overscroll-contain" onScroll={handleMessagesScroll}>
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
                <div className={`group relative max-w-[80%] rounded-2xl px-4 py-3 [overflow-wrap:anywhere] ${
                  msg.role === "user"
                    ? "bg-[#00CC00] text-black rounded-br-sm font-medium whitespace-pre-wrap"
                    : "bg-white/[0.06] border border-white/[0.06] rounded-bl-sm text-gray-200"
                }`}>
                  {msg.role === "user" ? msg.content : <MarkdownRenderer content={msg.content} />}
                  {msg.role === "user" && (
                    <div className="mt-2 pt-1 border-t border-black/10 flex justify-end">
                      <button onClick={() => copyMessage(msg.content)} title="Копировать" aria-label="Копировать промпт"
                        className="p-1 rounded-md text-black/50 hover:bg-black/10 hover:text-black transition-colors">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      </button>
                    </div>
                  )}
                  {msg.role === "assistant" && !msg.content.startsWith("⚠️") && (
                    <div className="mt-3 pt-2 border-t border-white/[0.08] flex items-center gap-1 text-gray-500">
                      <button onClick={() => copyMessage(msg.content)} title="Копировать" aria-label="Копировать сообщение"
                        className="p-1.5 rounded-md hover:bg-white/10 hover:text-white transition-colors">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      </button>
                      <button onClick={() => sendMessage(i)} disabled={isGenerating} title="Перегенерировать" aria-label="Перегенерировать ответ"
                        className="p-1.5 rounded-md hover:bg-white/10 hover:text-white disabled:opacity-40 transition-colors">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 11a8.1 8.1 0 0 0-14.7-4.7L3 8"/><path d="M3 3v5h5"/><path d="M4 13a8.1 8.1 0 0 0 14.7 4.7L21 16"/><path d="M21 21v-5h-5"/></svg>
                      </button>
                      {msg.variants?.length > 1 && (
                        <div className="ml-2 flex items-center gap-1 text-xs text-gray-400">
                          <button onClick={() => cycleVariant(i, -1)} title="Предыдущий вариант" aria-label="Предыдущий вариант" className="p-1 rounded hover:bg-white/10 hover:text-white">←</button>
                          <span>{(msg.variantIndex ?? 0) + 1} / {msg.variants.length}</span>
                          <button onClick={() => cycleVariant(i, 1)} title="Следующий вариант" aria-label="Следующий вариант" className="p-1 rounded hover:bg-white/10 hover:text-white">→</button>
                        </div>
                      )}
                    </div>
                  )}
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

        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/[0.08] bg-[#0d0d14]/95 backdrop-blur-md px-4 py-3">
          {attachedFile && (
            <div className="max-w-3xl mx-auto mb-2 flex items-center gap-2 text-xs text-gray-400 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
              <span>📎 {attachedFile.name} ({(attachedFile.content.length / 1024).toFixed(0)} КБ)</span>
              <button onClick={() => setAttachedFile(null)} className="ml-auto text-gray-500 hover:text-red-400" aria-label="Убрать файл">✕</button>
            </div>
          )}
          <div className="max-w-3xl mx-auto flex gap-3">
            <input type="file" ref={fileInputRef} className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (f.size > 1024 * 1024) { setError("Файл больше 1 МБ"); return; }
                try {
                  const text = await f.text();
                  setAttachedFile({ name: f.name, content: text });
                } catch (err) { setError("Не удалось прочитать файл"); }
                e.target.value = "";
              }} />
            <button onClick={() => fileInputRef.current?.click()} disabled={isGenerating}
              className="border border-white/10 hover:border-[#00CC00]/50 rounded-xl px-3 text-gray-400 hover:text-white transition-colors disabled:opacity-40 flex items-center justify-center min-h-[48px]"
              title="Прикрепить текстовый файл (до 1 МБ)" aria-label="Прикрепить файл">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
              </svg>
            </button>
            <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Напиши сообщение..."
              className="flex-1 bg-[#0d0d14] border border-white/10 rounded-xl px-4 py-3 resize-none outline-none focus:border-[#00CC00] transition-colors placeholder:text-gray-600 text-gray-100"
              rows={1} disabled={isGenerating}
              style={{ minHeight: "48px", maxHeight: composerExpanded ? "55vh" : "160px" }} />
            {(input.length > 1000 || composerExpanded) && (
              <button onClick={() => setComposerExpanded((v) => !v)} type="button"
                title={composerExpanded ? "Свернуть поле ввода" : "Развернуть поле ввода"}
                aria-label={composerExpanded ? "Свернуть поле ввода" : "Развернуть поле ввода"}
                className="absolute right-20 -top-8 p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  {composerExpanded ? <path d="M8 13l4 4 4-4M8 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M8 11l4-4 4 4M8 18l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />}
                </svg>
              </button>
            )}
            <div className={`absolute right-20 -top-5 text-[10px] ${input.length > MAX_MESSAGE_CHARS ? "text-red-400" : "text-gray-500"}`}>
              {input.length.toLocaleString("ru-RU")} / {MAX_MESSAGE_CHARS.toLocaleString("ru-RU")}
            </div>
            <button onClick={() => sendMessage()} disabled={!input.trim() || isGenerating}
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
