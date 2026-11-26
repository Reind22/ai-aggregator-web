"use client";

/**
 * Страница /pricing — публичный прайс-лист всех моделей.
 * Наша цена = рынок −10% (кроме помеченных). Вход/выход за 1M токенов.
 * Мобильные: карточки; десктоп: таблица.
 */
import { useEffect, useState } from "react";
import Logo from "../../components/Logo";
import SiteHeader from "../../components/SiteHeader";

export default function PricingPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [modelIdx, setModelIdx] = useState(0);
  const [inTok, setInTok] = useState(1000);
  const [outTok, setOutTok] = useState(500);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("ai_token"));
    (async () => {
      try {
        const res = await fetch("/api/dashboard/pricing");
        if (res.ok) {
          const data = await res.json();
          setItems(data.items || []);
        }
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  const fmt = (v) => `$${v < 0.001 ? v.toFixed(5) : v.toFixed(3).replace(/0+$/, "").replace(/\.$/, "")}`;

  return (
    <div className="min-h-screen bg-surface-dark text-gray-200">
      <SiteHeader active="/pricing" />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-white mb-2">Цены на модели</h1>
        <p className="text-gray-400 mb-2">
          Стоимость за 1 миллион токенов. Оплата по факту — с пополненного баланса, только за использованные токены.
        </p>
        <p className="text-gray-500 text-sm mb-6">
          Кэшированные входные токены (повторные запросы с тем же контекстом) считаются по сниженной ставке.
        </p>



        {/* Правила расчёта */}
        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 p-4">
            <div className="text-xs text-gray-500 mb-1">Оплата по факту</div>
            <div className="text-sm text-gray-300">Списываются только использованные токены. Ничего не сгорает и не списывается заранее.</div>
          </div>
          <div className="rounded-xl border border-white/10 p-4">
            <div className="text-xs text-gray-500 mb-1">Кэш дешевле</div>
            <div className="text-sm text-gray-300">Повторная отправка того же контекста считается по сниженной ставке.</div>
          </div>
          <div className="rounded-xl border border-white/10 p-4">
            <div className="text-xs text-gray-500 mb-1">Пополнение от 5 $</div>
            <div className="text-sm text-gray-300">Баланс пополняется в любой момент, деньги расходуются только на запросы.</div>
          </div>
        </div>

        {/* Калькулятор запроса */}
        {!loading && items.length > 0 && (
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="text-sm font-semibold text-white mb-3">Сколько стоит один запрос</div>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-[11px] text-gray-500">Модель</span>
                <select
                  value={modelIdx}
                  onChange={(e) => setModelIdx(Number(e.target.value))}
                  className="w-full rounded-lg border border-white/10 bg-[#0d0d14] px-2 py-2 text-xs text-gray-200 outline-none focus:border-[#00CC00]"
                >
                  {items.map((it, i) => (
                    <option key={it.model} value={i}>{it.display_name || it.model}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] text-gray-500">Токенов на входе</span>
                <input
                  type="number" min="0" step="100" value={inTok}
                  onChange={(e) => setInTok(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full rounded-lg border border-white/10 bg-[#0d0d14] px-2 py-2 text-xs text-gray-200 outline-none focus:border-[#00CC00]"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] text-gray-500">Токенов на выходе</span>
                <input
                  type="number" min="0" step="100" value={outTok}
                  onChange={(e) => setOutTok(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full rounded-lg border border-white/10 bg-[#0d0d14] px-2 py-2 text-xs text-gray-200 outline-none focus:border-[#00CC00]"
                />
              </label>
            </div>
            {(() => {
              const it = items[modelIdx] || {};
              const cost = it.request_price
                ? it.request_price
                : (inTok / 1e6) * (it.our_input || 0) + (outTok / 1e6) * (it.our_output || 0);
              const per1000 = cost * 1000;
              return (
                <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-1 text-sm">
                  <span className="text-gray-500">Стоимость:</span>
                  <span className="text-lg font-bold text-[#00FF00]">${cost < 0.0001 ? cost.toFixed(6) : cost.toFixed(4).replace(/0+$/, "").replace(/\.$/, "")}</span>
                  <span className="text-gray-500">· 1000 таких запросов:</span>
                  <span className="text-gray-300">${per1000 < 1 ? per1000.toFixed(3) : per1000.toFixed(2)}</span>
                  {it.request_price && <span className="text-[11px] text-gray-500">цена фиксированная за вызов</span>}
                </div>
              );
            })()}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 py-10 text-center">Загружаем цены…</p>
        ) : (
          <div>
            {/* Мобильные карточки */}
            <div className="md:hidden space-y-3">
              {items.map((it) => (
                <div key={it.model} className="border border-white/10 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white text-sm">{it.display_name || it.model}</span>
                    {it.soon && (
                      <span className="text-[10px] text-sky-400 border border-sky-400/30 rounded px-1 whitespace-nowrap">скоро</span>
                    )}
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 text-xs block">{it.request_price ? 'Цена/вызов' : 'Вход / 1M'}</span>
                      <span className="text-[#00FF00] font-semibold">{it.request_price ? ('$' + it.request_price.toFixed(3)) : fmt(it.our_input)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs block">Выход / 1M</span>
                      <span className="text-[#00FF00] font-semibold">{it.request_price ? '—' : fmt(it.our_output)}</span>
                    </div>
                    <div className="ml-auto text-right">
                      <span className="text-gray-500 text-xs block">Бренд</span>
                      <span className="text-gray-400">{it.brand}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Десктопная таблица */}
            <div className="hidden md:block">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-white/10">
                    <th className="py-3 px-2">Модель</th>
                    <th className="py-3 px-2">Бренд</th>
                    <th className="py-3 px-2 text-right">Вход, $/1M</th>
                    <th className="py-3 px-2 text-right">Выход, $/1M</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.model} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-2.5 px-2 font-medium text-white">
                        {it.display_name || it.model}
                        {it.soon && (
                          <span className="ml-2 text-[10px] text-sky-400 border border-sky-400/30 rounded px-1 whitespace-nowrap">скоро</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-gray-400">{it.brand}</td>
                      <td className="py-2.5 px-2 text-right text-[#00FF00] font-semibold">
                        {it.request_price ? ('$' + it.request_price.toFixed(3) + ' / вызов') : fmt(it.our_input)}
                      </td>
                      <td className="py-2.5 px-2 text-right text-[#00FF00] font-semibold">
                        {it.request_price ? '—' : fmt(it.our_output)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 text-xs text-gray-500 space-y-1">
          <p>* Кэшированные входные токены (при повторных запросах с тем же контекстом) считаются по сниженной ставке cache read — значительно дешевле обычного входа.</p>
          <p>* Минимальное пополнение — 5 $, деньги не сгорают и расходуются только на запросы.</p>
        </div>

        <div className="mt-10 text-center">
          <a href={loggedIn ? "/chat" : "/login"} className="inline-block bg-[#00FF00] hover:bg-[#00CC00] text-black font-bold rounded-xl px-8 py-3 transition-colors">
            {loggedIn ? "Открыть чат" : "Начать бесплатно"}
          </a>
        </div>
      </div>
    </div>
  );
}
