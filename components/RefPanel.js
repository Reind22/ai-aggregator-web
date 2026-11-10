"use client";

/**
 * Вкладка «Рефералы»: ссылка, KPI, графики регистраций и пополнений, список приглашённых.
 * Дизайн: тёмные карточки, зелёный акцент, без внешних библиотек.
 */
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { LineChart, BarChart } from "./Charts";

const money = (v) => `$${Number(v ?? 0).toFixed(2)}`;

function Kpi({ label, value, hint, accent }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
      <div className="text-[11px] uppercase tracking-wide text-gray-400">{label}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${accent ? "text-[#00FF00]" : "text-white"}`}>
        {value}
      </div>
      {hint && <div className="mt-0.5 text-[11px] text-gray-500">{hint}</div>}
    </div>
  );
}

/** Пустое состояние графика: сетка-заглушка, чтобы панель не выглядела сломанной. */
function ChartPlaceholder({ title, hint, onAction }) {
  return (
    <div>
      <div className="relative h-[150px] w-full overflow-hidden rounded-md border border-dashed border-white/[0.06]">
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-full w-full">
          {[8, 20, 32].map((y) => (
            <line key={y} x1="0" x2="100" y1={y} y2={y}
                  stroke="currentColor" className="text-white/[0.05]" strokeWidth="0.4" />
          ))}
          <path d="M 0 34 L 100 30" stroke="currentColor" className="text-white/[0.08]"
                strokeWidth="0.6" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
          <span className="text-[11px] text-gray-500">{title}</span>
          <span className="max-w-[240px] text-[10px] leading-relaxed text-gray-400">{hint}</span>
          {onAction && (
            <button
              onClick={onAction}
              className="mt-1 rounded-md border border-white/10 px-2.5 py-1 text-[10px] text-gray-300 hover:border-[#00CC00]/50 hover:text-white"
            >
              Скопировать ссылку
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RefPanel({ profile, onNotify }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/dashboard/referrals");
        if (res.ok) setData(await res.json());
        else setError("Не удалось загрузить статистику");
      } catch (e) {
        setError("Не удалось загрузить статистику");
      }
    })();
  }, []);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://aicombiner.net";
  const code = data?.referral_code || "";
  const siteLink = `${origin}/?ref=${code}`;
  const tgLink = `https://t.me/AICombinerBot?start=${code}`;

  const conversion = useMemo(() => {
    if (!data || !data.total_referred) return 0;
    const paying = (data.payments_by_day || []).length ? null : null;
    return paying ?? 0;
  }, [data]);

  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      onNotify?.("Ссылка скопирована");
      setTimeout(() => setCopied(null), 1500);
    } catch (_) {
      onNotify?.("Не удалось скопировать");
    }
  };

  if (error) return <p className="py-8 text-center text-sm text-gray-500">{error}</p>;
  if (!data) return <p className="py-8 text-center text-sm text-gray-500">Загрузка…</p>;

  const regs = data.registrations_by_day || [];
  const pays = data.payments_by_day || [];
  const recent = data.recent_referrals || [];
  const payingRefs = new Set(pays.map((p) => p.date)).size;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Реферальная программа</h2>
        <p className="mt-1 text-xs text-gray-500">
          Делитесь ссылкой и получайте процент с каждого пополнения приглашённых.
        </p>
      </div>

      {/* Ссылка */}
      <div className="rounded-xl border border-[#00CC00]/25 bg-[#00CC00]/[0.05] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wide text-gray-400">Ваша ссылка</div>
            <code className="mt-1 block truncate font-mono text-xs text-gray-200">{siteLink}</code>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => copy(siteLink, "site")}
              className="rounded-lg bg-[#00FF00] px-4 py-2 text-xs font-medium text-[#0A2A0A] transition-colors hover:bg-[#00CC00]"
            >
              {copied === "site" ? "Скопировано" : "Копировать"}
            </button>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(siteLink)}&text=${encodeURIComponent("AI Combiner — доступ к 90+ нейросетям по одному ключу")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-gray-200 transition-colors hover:border-[#00CC00]/50"
            >
              Поделиться
            </a>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/5 pt-3">
          <span className="text-[11px] text-gray-500">Код:</span>
          <button
            onClick={() => copy(code, "code")}
            className="rounded-md border border-white/10 px-2 py-0.5 font-mono text-xs text-gray-200 hover:border-white/30"
          >
            {code}
          </button>
          <span className="text-[11px] text-gray-500">·</span>
          <span className="text-[11px] text-gray-500">Telegram-бот:</span>
          <button
            onClick={() => copy(tgLink, "tg")}
            className="max-w-full truncate rounded-md border border-white/10 px-2 py-0.5 font-mono text-[11px] text-gray-400 hover:border-white/30"
          >
            {copied === "tg" ? "Текст ссылки скопирован" : `t.me/AICombinerBot?start=${code}`}
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Приглашено" value={data.total_referred} hint="регистраций по ссылке" />
        <Kpi label="Пополнения" value={money(data.total_payments_usd)} hint="всего от приглашённых" />
        <Kpi label="Ваш доход" value={money(data.commission_usd)} hint="10% с пополнений" accent />
        <Kpi label="Дней с оплатой" value={payingRefs} hint="дней, когда были пополнения" />
      </div>

      {/* Графики */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="text-sm font-medium">Регистрации</h3>
            <span className="text-[11px] text-gray-500">{data.total_referred} всего</span>
          </div>
          {regs.length ? (
            <BarChart data={regs} valueKey="count" label="чел./день" format={(v) => `${v} чел.`} />
          ) : (
            <ChartPlaceholder
              title="Пока нет приглашённых"
              hint="Отправьте ссылку другу — регистрации появятся здесь в тот же день"
              onAction={() => copy(siteLink, "site")}
            />
          )}
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="text-sm font-medium">Пополнения</h3>
            <span className="text-[11px] text-gray-500">{money(data.total_payments_usd)}</span>
          </div>
          {pays.length ? (
            <LineChart data={pays} valueKey="amount_usd" label="$ / день" />
          ) : (
            <ChartPlaceholder
              title="Пополнений пока нет"
              hint="Как только реферал пополнит баланс, здесь появится ваш доход"
            />
          )}
        </div>
      </div>

      {/* Приглашённые */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02]">
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
          <h3 className="text-sm font-medium">Последние приглашённые</h3>
          <span className="text-[11px] text-gray-500">{recent.length} из {data.total_referred}</span>
        </div>
        {recent.length ? (
          <ul className="divide-y divide-white/5">
            {recent.slice().reverse().map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-4 py-2.5 text-xs">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-[10px] text-gray-400">
                  #{r.id}
                </span>
                <span className="flex-1 text-gray-300">Пользователь #{r.id}</span>
                <span className="tabular-nums text-gray-500">
                  {r.created_at ? new Date(r.created_at).toLocaleDateString("ru-RU") : "—"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-1 px-4 py-6 text-center">
            <p className="text-xs text-gray-500">Список пуст</p>
            <p className="text-[11px] text-gray-600">Приглашённые появятся здесь после регистрации</p>
          </div>
        )}
      </div>

      {/* Как это работает */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <h3 className="text-sm font-medium">Как это работает</h3>
        <ol className="mt-3 grid gap-3 text-xs text-gray-400 md:grid-cols-3">
          {[
            ["1", "Отправьте ссылку", "Друг открывает её и регистрируется — код применится автоматически."],
            ["2", "Друг пополняет баланс", "Любое пополнение через СБП или крипту."],
            ["3", "Вы получаете 10%", "Комиссия сразу падает на ваш баланс, без задержек."],
          ].map(([n, title, text]) => (
            <li key={n} className="rounded-lg border border-white/5 bg-black/20 p-3">
              <div className="mb-1 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00CC00]/15 text-[10px] font-semibold text-[#00FF00]">
                  {n}
                </span>
                <span className="font-medium text-gray-200">{title}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-gray-500">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}