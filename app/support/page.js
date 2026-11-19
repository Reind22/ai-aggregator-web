"use client";

/**
 * /support — обращения в поддержку.
 *
 * Слева список обращений, справа ветка. Новые ответы подтягиваются каждые
 * 5 секунд, пока открыт диалог. Создать обращение можно формой сверху.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import SiteHeader from "../../components/SiteHeader";
import { apiFetch } from "../../lib/api";

const dt = (iso) => (iso ? new Date(iso).toLocaleString("ru-RU", {
  day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
}) : "");

export default function SupportPage() {
  const [tickets, setTickets] = useState([]);
  const [active, setActive] = useState(null);
  const [thread, setThread] = useState([]);
  const [reply, setReply] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const endRef = useRef(null);

  const loadTickets = useCallback(async () => {
    try {
      const r = await apiFetch("/support/tickets");
      if (r.ok) {
        const d = await r.json();
        setTickets(d.items || []);
      } else if (r.status === 401) {
        setError("Войдите, чтобы написать в поддержку");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadThread = useCallback(async (id) => {
    const r = await apiFetch(`/support/tickets/${id}`);
    if (r.ok) {
      const d = await r.json();
      setThread(d.messages || []);
    }
  }, []);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  useEffect(() => {
    if (active == null) return;
    loadThread(active);
    const t = setInterval(() => loadThread(active), 5000);
    return () => clearInterval(t);
  }, [active, loadThread]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length]);

  const createTicket = async () => {
    if (subject.trim().length < 3 || message.trim().length < 3) return;
    setCreating(true);
    setError(null);
    try {
      const r = await apiFetch("/support/tickets", {
        method: "POST",
        body: { subject: subject.trim(), message: message.trim() },
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(d.detail || "Не удалось создать обращение");
      } else {
        setSubject("");
        setMessage("");
        await loadTickets();
        setActive(d.id);
      }
    } finally {
      setCreating(false);
    }
  };

  const sendReply = async () => {
    if (!reply.trim() || active == null) return;
    const body = reply.trim();
    setReply("");
    const r = await apiFetch(`/support/tickets/${active}/messages`, {
      method: "POST", body: { body },
    });
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      setError(d.detail || "Сообщение не отправлено");
      setReply(body);
    } else {
      await loadThread(active);
      await loadTickets();
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-gray-200">
      <SiteHeader active="/support" />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold text-white">Поддержка</h1>
        <p className="mt-1 text-sm text-gray-500">
          Опишите проблему — ответ придёт сюда же. Уведомление о новом обращении
          приходит нам в Telegram, так что долго ждать не придётся.
        </p>

        {/* Новая заявка */}
        <div className="mt-5 rounded-xl border border-white/[0.08] p-5">
          <div className="text-sm font-medium text-white">Новое обращение</div>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Тема: например, «не проходит оплата»"
            className="mt-3 w-full rounded-lg border border-white/10 bg-[#0d0d14] px-3 py-2 text-sm outline-none focus:border-[#00CC00]"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Что случилось? Опишите шаги, которые привели к проблеме."
            className="mt-2 w-full resize-y rounded-lg border border-white/10 bg-[#0d0d14] px-3 py-2 text-sm outline-none focus:border-[#00CC00]"
          />
          <button
            onClick={createTicket}
            disabled={creating || subject.trim().length < 3 || message.trim().length < 3}
            className="mt-3 rounded-lg bg-[#00FF00] px-4 py-2 text-sm font-bold text-black hover:bg-[#00CC00] disabled:opacity-40"
          >
            {creating ? "Отправляю…" : "Отправить"}
          </button>
          {error && <div className="mt-2 text-xs text-red-300">{error}</div>}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[260px_1fr]">
          {/* Список */}
          <div className="rounded-xl border border-white/[0.08]">
            <div className="border-b border-white/5 px-3 py-2 text-[11px] uppercase tracking-wide text-gray-500">
              Мои обращения
            </div>
            {loading && <div className="px-3 py-4 text-xs text-gray-500">Загружаю…</div>}
            {!loading && tickets.length === 0 && (
              <div className="px-3 py-4 text-xs text-gray-500">Пока пусто</div>
            )}
            {tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`block w-full border-b border-white/5 px-3 py-2 text-left transition-colors last:border-0 ${
                  active === t.id ? "bg-[#00CC00]/10" : "hover:bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-gray-200">#{t.id} {t.subject}</span>
                  {t.unread_user > 0 && (
                    <span className="rounded-full bg-[#00FF00] px-1.5 text-[10px] font-bold text-black">
                      {t.unread_user}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 truncate text-[11px] text-gray-500">{t.preview}</div>
                <div className="mt-0.5 text-[10px] text-gray-600">
                  {dt(t.last_message_at)} · {t.status === "closed" ? "закрыто" : "открыто"}
                </div>
              </button>
            ))}
          </div>

          {/* Ветка */}
          <div className="min-h-[280px] rounded-xl border border-white/[0.08] p-4">
            {active == null && (
              <div className="text-xs text-gray-500">Выберите обращение слева.</div>
            )}
            {active != null && (
              <>
                <div className="space-y-3">
                  {thread.map((m) => (
                    <div key={m.id} className={`flex ${m.is_admin ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                        m.is_admin
                          ? "border border-white/10 bg-white/[0.04] text-gray-200"
                          : "bg-[#00CC00]/15 text-gray-100"
                      }`}>
                        <div className="mb-1 text-[10px] uppercase tracking-wide text-gray-500">
                          {m.is_admin ? "поддержка" : "вы"} · {dt(m.created_at)}
                        </div>
                        <div className="whitespace-pre-wrap">{m.body}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>

                <div className="mt-4 flex gap-2">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={2}
                    placeholder="Ваш ответ…"
                    className="flex-1 resize-y rounded-lg border border-white/10 bg-[#0d0d14] px-3 py-2 text-sm outline-none focus:border-[#00CC00]"
                  />
                  <button
                    onClick={sendReply}
                    disabled={!reply.trim()}
                    className="self-end rounded-lg bg-[#00FF00] px-4 py-2 text-sm font-bold text-black hover:bg-[#00CC00] disabled:opacity-40"
                  >
                    Отправить
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}