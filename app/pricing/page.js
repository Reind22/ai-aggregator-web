"use client";

/**
 * Страница /pricing — публичный прайс-лист всех моделей.
 * Наша цена = рынок −10% (кроме помеченных). Вход/выход за 1M токенов.
 */
import { useEffect, useState } from "react";
import Logo from "../../components/Logo";
import AuthButtons from "../../components/AuthButtons";

export default function PricingPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <a href="/" className="flex items-center gap-2"><Logo size={28} /><span className="font-extrabold text-white">AI Combiner</span></a>
          <AuthButtons />
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-2">Цены на модели</h1>
        <p className="text-gray-400 mb-2">
          Стоимость за 1 миллион токенов. Оплата по факту — с дневного баланса, только за использованные токены.
        </p>
        <p className="text-gray-500 text-sm mb-6">
          Наши цены в среднем на 10% ниже официального рынка. Поддержка кэширования (cache read) у части моделей — кэшированные входные токены считаются по сниженной ставке.
        </p>

        {loading ? (
          <p className="text-gray-500 py-10 text-center">Загрузка…</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-gray-400 border-b border-white/10">
                <th className="py-3 px-2">Модель</th>
                <th className="py-3 px-2">Бренд</th>
                <th className="py-3 px-2 text-right">Рынок, вход</th>
                <th className="py-3 px-2 text-right">Наша, вход</th>
                <th className="py-3 px-2 text-right">Рынок, выход</th>
                <th className="py-3 px-2 text-right">Наша, выход</th>
                <th className="py-3 px-2 text-right">Скидка</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.model} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2.5 px-2 font-medium text-white">{it.model}{it.note && <span className="ml-2 text-[10px] text-amber-400 border border-amber-400/30 rounded px-1">{it.note === "peak" ? "peak-цена" : it.note}</span>}</td>
                  <td className="py-2.5 px-2 text-gray-400">{it.brand}</td>
                  <td className="py-2.5 px-2 text-right text-gray-500 line-through">{fmt(it.official_input)}</td>
                  <td className="py-2.5 px-2 text-right text-[#00FF00] font-semibold">{fmt(it.our_input)}</td>
                  <td className="py-2.5 px-2 text-right text-gray-500 line-through">{fmt(it.official_output)}</td>
                  <td className="py-2.5 px-2 text-right text-[#00FF00] font-semibold">{fmt(it.our_output)}</td>
                  <td className="py-2.5 px-2 text-right text-gray-300">{it.discount_pct > 0 ? `−${it.discount_pct}%` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="mt-8 text-xs text-gray-500 space-y-1">
          <p>* «Рынок» — официальный прайс провайдера модели. Для DeepSeek Flash указана пиковая ставка провайдера; наша цена действует круглосуточно.</p>
          <p>* Кэшированные входные токены (при повторных запросах с тем же контекстом) тарифицируются по ставке cache read — дешевле входа в 10–50 раз.</p>
          <p>* Бесплатный тариф: 0,50 $ в день на любые модели.</p>
        </div>

        <div className="mt-10 text-center">
          <a href="/login" className="inline-block bg-[#00FF00] hover:bg-[#00CC00] text-black font-bold rounded-xl px-8 py-3 transition-colors">Начать бесплатно</a>
        </div>
      </div>
    </div>
  );
}
