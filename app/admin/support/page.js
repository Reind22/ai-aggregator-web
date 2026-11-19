"use client";

/**
 * /admin/support — ответы на обращения. Доступ только у роли ADMIN:
 * сервер всё равно проверит роль, страница лишь скрывает интерфейс.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import SiteHeader from "../../../components/SiteHeader";
import { apiFetch } from "../../../lib/api";

const dt = (iso) => (iso ? new Date(iso).toLocaleString("ru-RU", {
  day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
}) : "");

export default function AdminSupportPage() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("open");
  const [active, setActive] = useState(null);
  const [thread, setThread] = useState([]);
  const [reply, setReply] = useState("");
  const [error, setError] = useState(null);
  const endRef = useRef(null);

  const loadList = useCallback(async () => {
    const r = await apiFetch(`/support/admin/tickets?status=${status}`);
    if (r.status === 403) { setError("Доступ только для администратора"); return; }
    if (r.ok) {
      const d = await r.json();
      setItems(d.items || []);
    }
  }, [status]);

  const loadThread = useCallback(async (id) => {
    const r = await apiFetch(`/support/tickets/${id}`);
    if (r.ok) {
      const d = await r.json();
      setThread(d.messages || []);
    }
  }, []);

  useEffect(() => { loadList(); }, [loadList]);

  useEffect(() => {
    if (active == null) return;
    loadThread(active);
    const t = setInterval(() => {
      loadThread(active);
      loadList();
    }, 5000);
    return () => clearInterval(t);
  }, [active, loadThread, loadList]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length]);

  const sendReply = async () => {
    if (!reply.trim() || active == null) return;
    const body = reply.trim();
    setReply("");
    const r = await apiFetch(`/support/admin/tickets/${active}/reply`, {
      method: "POST", body: { body },
    });
    if (!r.ok) {
      setError("Не отправлено");
      setReply(body);
    } else {
      await loadThread(active);
      await loadList();
    }
  };

  const closeTicket = async () => {
    if (active == null) return;
    await apiFetch(`/support/admin/tickets/${active}/close`, { method: "POST" });
    await loadList();
    await loadThread(active);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-gray-200">
      <SiteHeader active="/admin/support" />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-white">Обращения</h1>
          <div className="flex gap-2">
            {["open", "closed"].map((s) => (
              <button
                key={s}
                onClick={() => { setStatus(s); setActive(null); }}
                className={`rounded-lg border px-3 py-1.5 text-xs ${
                  status === s ? "border-[#00CC00] text-white" : "border-white/10 text-gray-400"
                }`}
              >
                {s === "open" ? "Открытые" : "Закрытые"}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="mt-3 text-xs text-red-300">{error}</div>}

        <div className="mt-5 grid gap-4 md:grid-cols-[300px_1fr]">
          <div className="rounded-xl border border-white/[0.08]">
            {items.length === 0 && <div className="px-3 py-4 text-xs text-gray-500">Обращений нет</div>}
            {items.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`block w-full border-b border-white/5 px-3 py-2 text-left last:border-0 ${
                  active === t.id ? "bg-[#00CC00]/10" : "hover:bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-gray-200">#{t.id} {t.subject}</span>
                  {t.unread_admin > 0 && (
                    <span className="rounded-full bg-[#00FF00] px-1.5 text-[10px] font-bold text-black">
                      {t.unread_admin}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 truncate text-[11px] text-gray-500">{t.user_email}</div>
                <div className="mt-0.5 truncate text-[11px] text-gray-600">{t.preview}</div>
                <div className="mt-0.5 text-[10px] text-gray-600">{dt(t.last_message_at)}</div>
              </button>
            ))}
          </div>

          <div className="min-h-[300px] rounded-xl border border-white/[0.08] p-4">
            {active == null && <div className="text-xs text-gray-500">Выберите обращение.</div>}
            {active != null && (
              <>
                <div className="space-y-3">
                  {thread.map((m) => (
                    <div key={m.id} className={`flex ${m.is_admin ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                        m.is_admin
                          ? "bg-[#00CC00]/15 text-gray-100"
                          : "border border-white/10 bg-white/[0.04] text-gray-200"
                      }`}>
                        <div className="mb-1 text-[10px] uppercase tracking-wide text-gray-500">
                          {m.is_admin ? "поддержка" : "пользователь"} · {dt(m.created_at)}
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
                    placeholder="Ответ пользователю…"
                    className="flex-1 resize-y rounded-lg border border-white/10 bg-[#0d0d14] px-3 py-2 text-sm outline-none focus:border-[#00CC00]"
                  />
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={sendReply}
                      disabled={!reply.trim()}
                      className="rounded-lg bg-[#00FF00] px-4 py-2 text-sm font-bold text-black hover:bg-[#00CC00] disabled:opacity-40"
                    >
                      Ответить
                    </button>
                    <button
                      onClick={closeTicket}
                      className="rounded-lg border border-white/10 px-4 py-1.5 text-xs text-gray-400 hover:text-white"
                    >
                      Закрыть
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}