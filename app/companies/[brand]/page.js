/**
 * /companies/[brand] — все модели одного разработчика.
 * Страница нужна и людям, и поисковикам: «модели Anthropic», «OpenAI модели».
 */
import SiteHeader from "../../../components/SiteHeader";

const API = process.env.API_INTERNAL_URL || "http://127.0.0.1:8000";

async function loadBrand(brand) {
  try {
    const res = await fetch(`${API}/models/list`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    const items = data.items || data || [];
    return items.filter((m) => m.brand === brand && m.enabled !== false && !m.soon);
  } catch (e) {
    return [];
  }
}

const money = (v) => (v == null ? "—" : `$${Number(v).toFixed(4)}`);
const ctx = (v) => {
  if (!v) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `${Math.round(v / 1000)}K`;
  return String(v);
};

export async function generateMetadata({ params }) {
  const { brand } = await params;
  const name = decodeURIComponent(brand);
  const models = await loadBrand(name);
  const title = `Модели ${name} — цены, контекст и лимиты`;
  const description = models.length
    ? `${models.length} моделей ${name} через один API-ключ: ${models.slice(0, 4).map((m) => m.name || m.id).join(", ")}. Цены за 1M токенов, контекст, сравнение.`
    : `Модели ${name} в каталоге AI Combiner.`;
  return {
    title,
    description,
    alternates: { canonical: `/companies/${brand}` },
    openGraph: { title, description, url: `/companies/${brand}` },
  };
}

export default async function CompanyPage({ params }) {
  const { brand } = await params;
  const name = decodeURIComponent(brand);
  const models = await loadBrand(name);
  const text = models.filter((m) => m.modality === "text");
  const cheapest = text.length
    ? text.reduce((a, b) =>
        (a.price_in ?? a.input_per_1m ?? Infinity) <= (b.price_in ?? b.input_per_1m ?? Infinity) ? a : b
      )
    : null;
  const media = models.filter((m) => m.modality !== "text");

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-gray-200">
      <SiteHeader active="/models" />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <nav className="mb-4 text-xs text-gray-500">
          <a href="/models" className="hover:text-gray-300">Модели</a>
          <span className="mx-1.5">/</span>
          <span className="text-gray-400">{name}</span>
        </nav>

        <h1 className="text-2xl font-bold text-white">Модели {name}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {models.length} моделей в каталоге, доступны по одному API-ключу.
        </p>

        <div className="mt-6 overflow-hidden rounded-xl border border-white/[0.08]">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Модель</th>
                <th className="px-4 py-3 text-left font-medium">Тип</th>
                <th className="px-4 py-3 text-right font-medium">Контекст</th>
                <th className="px-4 py-3 text-right font-medium">Вход</th>
                <th className="px-4 py-3 text-right font-medium">Выход</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {models.map((m) => (
                <tr key={m.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <a href={`/models/${encodeURIComponent(m.id)}`} className="font-medium text-white hover:text-[#00FF00]">
                      {m.name || m.id}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{m.modality}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-400">{ctx(m.context_length)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-300">{money(m.price_in ?? m.input_per_1m)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-300">{money(m.price_out ?? m.output_per_1m)}</td>
                </tr>
              ))}
              {models.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">Моделей этого разработчика нет</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Текст для поиска и контекста */}
        {models.length > 0 && (
          <section className="mt-10 max-w-3xl text-sm leading-relaxed text-gray-400">
            <h2 className="text-lg font-semibold text-white">О разработчике и моделях</h2>
            <p className="mt-3">
              {name} представлен в каталоге {models.length} моделями
              {text.length ? `, из них ${text.length} — текстовые` : ""}
              {media.length ? `, ${media.length} — генерация медиа` : ""}.
              Самая дешёвая текстовая модель — {cheapest ? cheapest.name : "—"}.
            </p>
            <p className="mt-3">
              Все модели доступны через OpenAI-совместимый API: один ключ, поле
              <code className="mx-1 text-gray-300">model</code> переключает модель. Оплата по факту
              использования, цена складывается из входных и выходных токенов — вход дешевле,
              потому что это ваш текст, а выход дороже, потому что его генерирует модель.
            </p>
            <p className="mt-3">
              Контекст показывает, сколько текста модель держит за один разговор. Если задача
              больше — её разбивают на части или сокращают историю. Для длинных документов
              выбирайте модели с контекстом от 200K токенов.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}