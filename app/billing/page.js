"use client";

/**
 * /billing — пополнение баланса.
 *
 * Что здесь: баланс, суммы пополнения, выбор провайдера (СБП / крипта),
 * счёт с реквизитами, история платежей и промокод.
 *
 * Промокод: пауза между попытками считается и на клиенте (кнопка
 * блокируется с обратным отсчётом), и на сервере (429 + Retry-After).
 * Клиентская пауза нужна только для удобства — обойти её можно, сервер
 * всё равно откажет.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import SiteHeader from "../../components/SiteHeader";
import { apiFetch } from "../../lib/api";

const AMOUNTS = [5, 10, 25, 50, 100];
const PROVIDERS = [
  { id: "sbp", label: "СБП", hint: "Перевод по ссылке" },
  { id: "crypto", label: "Крипта", hint: "USDT, адрес кошелька" },
];

const money = (v) => `$${Number(v ?? 0).toFixed(2)}`;
const dt = (iso) => (iso ? new Date(iso).toLocaleString("ru-RU", {
  day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
}) : "—");

const STATUS = {
  pending: ["ожидает оплаты", "text-amber-300"],
  paid: ["зачислено", "text-[#00FF00]"],
  failed: ["ошибка", "text-red-400"],
  expired: ["истёк", "text-gray-500"],
  refunded: ["возврат", "text-gray-400"],
};

export default function BillingPage() {
  const [balance, setBalance] = useState(null);
  const [amount, setAmount] = useState(10);
  const [provider, setProvider] = useState("sbp");
  const [payment, setPayment] = useState(null);
  const [payments, setPayments] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const [promo, setPromo] = useState("");
  const [promoBusy, setPromoBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const [b, p] = await Promise.all([
        apiFetch("/billing/balance"),
        apiFetch("/billing/payments"),
      ]);
      if (b.ok) setBalance(await b.json());
      if (p.ok) {
        const d = await p.json();
        setPayments(Array.isArray(d) ? d : (d.payments || d.items || []));
      }
    } catch (e) {}
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (cooldown <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [cooldown]);

  const startCooldown = (sec) => setCooldown(Math.max(1, Math.min(sec || 60, 3600)));

  const createInvoice = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const r = await apiFetch("/billing/invoice", {
        method: "POST",
        body: { amount_usd: Number(amount), provider, promo_code: promo.trim() || null },
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        setError(d.detail || "Не удалось создать счёт");
      } else {
        const d = await r.json();
        setPayment(d);
        await load();
      }
    } catch (e) {
      setError("Сеть недоступна");
    } finally {
      setBusy(false);
    }
  };

  const applyPromo = async () => {
    const code = promo.trim();
    if (!code) return;
    setPromoBusy(true);
    setError(null);
    setNotice(null);
    try {
      const r = await apiFetch("/billing/promo", { method: "POST", body: { code } });
      const d = await r.json().catch(() => ({}));
      if (r.status === 429) {
        const wait = Number(r.headers?.get("retry-after") || d.retry_after || 60);
        startCooldown(wait);
        setError(d.detail || `Подождите ${wait} с.`);
      } else if (!r.ok) {
        setError(d.detail || "Промокод не подошёл");
      } else {
        setNotice(`Промокод принят: +${money(d.credited_usd)} на баланс`);
        setPromo("");
        startCooldown(60);
        await load();
      }
    } catch (e) {
      setError("Сеть недоступна");
    } finally {
      setPromoBusy(false);
    }
  };

  const payload = payment?.payload || {};

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-gray-200">
      <SiteHeader active="/billing" />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-white">Пополнение баланса</h1>
        <p className="mt-1 text-sm text-gray-500">
          Деньги списываются только за фактически использованные токены.
        </p>

        {/* Баланс */}
        <div className="mt-5 rounded-xl border border-[#00CC00]/30 bg-[#00CC00]/[0.06] p-5">
          <div className="text-[11px] uppercase tracking-wide text-gray-500">Баланс</div>
          <div className="mt-1 text-3xl font-semibold text-[#00FF00]">
            {money(balance?.paid_balance_usd)}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Списывается только за использованные токены.
          </div>
        </div>

        {/* Сумма и способ */}
        <div className="mt-6 rounded-xl border border-white/[0.08] p-5">
          <div className="text-sm font-medium text-white">Сумма пополнения</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(a)}
                className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                  amount === a
                    ? "border-[#00CC00] bg-[#00CC00]/10 text-white"
                    : "border-white/10 text-gray-400 hover:text-white"
                }`}
              >
                ${a}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-500">Своя сумма</span>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-28 rounded-lg border border-white/10 bg-[#0d0d14] px-3 py-2 text-sm outline-none focus:border-[#00CC00]"
            />
            <span className="text-xs text-gray-600">USD</span>
          </div>

          <div className="mt-5 text-sm font-medium text-white">Способ оплаты</div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => setProvider(p.id)}
                className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                  provider === p.id
                    ? "border-[#00CC00] bg-[#00CC00]/10"
                    : "border-white/10 hover:border-white/25"
                }`}
              >
                <div className="text-sm text-white">{p.label}</div>
                <div className="text-[11px] text-gray-500">{p.hint}</div>
              </button>
            ))}
          </div>

          {/* Промокод */}
          <div className="mt-5 text-sm font-medium text-white">Промокод</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              value={promo}
              onChange={(e) => setPromo(e.target.value.toUpperCase())}
              placeholder="Например, START10"
              className="min-w-[200px] flex-1 rounded-lg border border-white/10 bg-[#0d0d14] px-3 py-2 font-mono text-sm uppercase outline-none placeholder:text-gray-600 focus:border-[#00CC00]"
            />
            <button
              onClick={applyPromo}
              disabled={promoBusy || cooldown > 0 || promo.trim().length < 3}
              className="rounded-lg border border-[#00CC00]/40 px-4 py-2 text-sm text-[#00FF00] transition-colors hover:bg-[#00CC00]/10 disabled:opacity-40"
            >
              {cooldown > 0 ? `Ждите ${cooldown} с` : promoBusy ? "Проверяю…" : "Применить"}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-gray-600">
            Одна попытка в 30 секунд, не больше 100 в час — проверяется на сервере.
          </p>

          <button
            onClick={createInvoice}
            disabled={busy}
            className="mt-5 w-full rounded-xl bg-[#00FF00] px-4 py-3 text-sm font-bold text-black transition-colors hover:bg-[#00CC00] disabled:opacity-50"
          >
            {busy ? "Создаю счёт…" : `Пополнить на ${money(amount)}`}
          </button>

          {error && <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</div>}
          {notice && <div className="mt-3 rounded-lg border border-[#00CC00]/30 bg-[#00CC00]/10 px-3 py-2 text-xs text-[#BBF7D0]">{notice}</div>}

          {payment && (
            <div className="mt-4 rounded-lg border border-white/10 bg-[#0b0b12] p-4">
              <div className="text-xs text-gray-400">
                Счёт #{payment.id} · {money(payment.amount)} · {payment.provider} ·{" "}
                <span className={STATUS[payment.status]?.[1]}>{STATUS[payment.status]?.[0] || payment.status}</span>
              </div>
              {payload.link && (
                <a href={payload.link} target="_blank" rel="noopener noreferrer"
                   className="mt-2 block break-all text-xs text-[#00CC00] hover:underline">
                  {payload.link}
                </a>
              )}
              {payload.address && (
                <div className="mt-2 break-all font-mono text-xs text-gray-300">{payload.address}</div>
              )}
              {payload.memo && (
                <div className="mt-1 text-[11px] text-gray-500">Комментарий к платежу: {payload.memo}</div>
              )}
              <p className="mt-2 text-[11px] text-gray-600">
                После оплаты баланс обновится автоматически — страница проверяет статус каждые 5 секунд.
              </p>
            </div>
          )}
        </div>

        {/* История */}
        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-gray-500">История пополнений</h2>
        <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.08]">
          <table className="w-full text-xs">
            <thead className="bg-white/[0.03] text-[11px] uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Дата</th>
                <th className="px-3 py-2 text-left font-medium">Способ</th>
                <th className="px-3 py-2 text-right font-medium">Сумма</th>
                <th className="px-3 py-2 text-left font-medium">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.length === 0 && (
                <tr><td colSpan={4} className="px-3 py-6 text-center text-gray-500">Пополнений пока не было</td></tr>
              )}
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-3 py-2 text-gray-400">{dt(p.created_at)}</td>
                  <td className="px-3 py-2 text-gray-400">{p.provider}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-300">{money(p.amount)}</td>
                  <td className="px-3 py-2">
                    <span className={STATUS[p.status]?.[1] || "text-gray-400"}>
                      {STATUS[p.status]?.[0] || p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}