"use client";

/**
 * Вкладка «Рефералы»: ссылка + KPI + графики регистраций/пополнений по датам.
 */
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { LineChart, BarChart } from "./Charts";

const fmt2$ = (usd) => `$${Number(usd ?? 0).toFixed(2)}`;

export default function RefPanel({ profile, onNotify }) {
  const [data, setData] = useState(null);
  const [payMode, setPayMode] = useState("line");

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/dashboard/referrals");
        if (res.ok) setData(await res.json());
      } catch (e) {}
    })();
  }, []);

  if (!data) return <p className="text-gray-500 text-sm py-8 text-center">Загрузка…</p>;

  const origin = typeof window !== "undefined" ? window.location.origin : "https://aicombiner.net";
  const links = [
    { label: "Сайт", url: `${origin}/?ref=${data.referral_code}` },
    { label: "Telegram-бот", url: `https://t.me/AICombinerBot?start=${data.referral_code}` },
  ];
  const regData = data.registrations_by_day;
  const payData = data.payments_by_day;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Реферальная программа</h2>

      {/* Ссылки */}
      <div className="space-y-2 mb-6">
        {links.map((l) => (
          <div key={l.label} className="flex items-center gap-2 border border-white/10 rounded-lg px-3 py-2">
            <span className="text-xs text-gray-500 w-24 flex-shrink-0">{l.label}</span>
            <code className="text-xs text-gray-300 truncate flex-1">{l.url}</code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(l.url);
                onNotify?.("Ссылка скопирована");
              }}
              className="text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:border-[#00CC00]/50 transition-colors flex-shrink-0"
            >
              Копировать
            </button>
          </div>
        ))}
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="border border-white/10 rounded-xl p-3">
          <div className="text-xs text-gray-500">Приглашено</div>
          <div className="text-2xl font-bold text-[#00FF00]">{data.total_referred}</div>
        </div>
        <div className="border border-white/10 rounded-xl p-3">
          <div className="text-xs text-gray-500">Пополнений рефералов</div>
          <div className="text-2xl font-bold">{fmt2$(data.total_payments_usd)}</div>
        </div>
        <div className="border border-white/10 rounded-xl p-3">
          <div className="text-xs text-gray-500">Ваш доход (10%)</div>
          <div className="text-2xl font-bold text-[#00FF00]">{fmt2$(data.commission_usd)}</div>
        </div>
        <div className="border border-white/10 rounded-xl p-3">
          <div className="text-xs text-gray-500">Код</div>
          <div className="text-lg font-mono">{data.referral_code}</div>
        </div>
      </div>

      {/* Графики */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-white/10 rounded-xl p-4">
          <h3 className="text-sm font-medium mb-3">Регистрации по дням</h3>
          {regData.length ? (
            <LineChart data={regData} valueKey="count" label="регистраций/день" />
          ) : (
            <p className="text-gray-500 text-sm py-8 text-center">Пока нет приглашённых</p>
          )}
        </div>

        <div className="border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Пополнения рефералов</h3>
            <div className="flex gap-1 text-xs">
              <button
                onClick={() => setPayMode("bar")}
                className={`px-2 py-1 rounded ${payMode === "bar" ? "bg-white/10 text-white" : "text-gray-500"}`}
                title="Столбики"
              >
                ▮▮▮
              </button>
              <button
                onClick={() => setPayMode("line")}
                className={`px-2 py-1 rounded ${payMode === "line" ? "bg-white/10 text-white" : "text-gray-500"}`}
                title="Линия"
              >
                ⌁
              </button>
            </div>
          </div>
          {payData.length ? (
            payMode === "bar" ? (
              <BarChart data={payData} valueKey="amount_usd" label="$ пополнений/день" />
            ) : (
              <LineChart data={payData} valueKey="amount_usd" label="$ пополнений/день" />
            )
          ) : (
            <p className="text-gray-500 text-sm py-8 text-center">Пополнений пока нет</p>
          )}
        </div>
      </div>

      {/* Как это работает */}
      <div className="border border-white/10 rounded-xl p-4 mt-6 text-sm text-gray-400 space-y-2">
        <h3 className="text-sm font-medium text-gray-200">Как это работает</h3>
        <p>1. Делитесь ссылкой — друг регистрируется по вашему коду.</p>
        <p>2. Друг пополняет баланс и покупает подписку.</p>
        <p>3. Вы получаете <span className="text-[#00FF00]">10% пожизненно</span> с каждого его пополнения.</p>
      </div>
    </div>
  );
}
