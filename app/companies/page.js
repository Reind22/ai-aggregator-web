/**
 * /companies — все разработчики, чьи модели есть в каталоге.
 * Нужна как точка входа: с неё видно, у кого сколько моделей и какие.
 */
import SiteHeader from "../../components/SiteHeader";

const API = process.env.API_INTERNAL_URL || "http://127.0.0.1:8000";

async function loadCompanies() {
  try {
    const res = await fetch(`${API}/models/list`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    const items = data.items || data || [];
    const map = new Map();
    for (const m of items) {
      if (!m.brand || m.enabled === false || m.soon) continue;
      const cur = map.get(m.brand) || { brand: m.brand, count: 0, text: 0, models: [] };
      cur.count += 1;
      if (m.modality === "text") cur.text += 1;
      if (cur.models.length < 4) cur.models.push(m.name || m.id);
      map.set(m.brand, cur);
    }
    return [...map.values()].sort((a, b) => b.count - a.count || a.brand.localeCompare(b.brand));
  } catch (e) {
    return [];
  }
}

export const metadata = {
  title: "Разработчики моделей — Anthropic, OpenAI, Google и другие",
  description:
    "Список компаний, чьи ИИ-модели доступны через AI Combiner: Anthropic, OpenAI, Google, DeepSeek, Zhipu, xAI, Alibaba, Meta и другие. Цены и контекст по каждой модели.",
  alternates: { canonical: "/companies" },
};

export default async function CompaniesPage() {
  const companies = await loadCompanies();
  const total = companies.reduce((s, c) => s + c.count, 0);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-gray-200">
      <SiteHeader active="/models" />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <nav className="mb-4 text-xs text-gray-500">
          <a href="/models" className="hover:text-gray-300">Модели</a>
          <span className="mx-1.5">/</span>
          <span className="text-gray-400">Компании</span>
        </nav>

        <h1 className="text-2xl font-bold text-white">Разработчики моделей</h1>
        <p className="mt-1 text-sm text-gray-500">
          {companies.length} компаний, {total} моделей. Один API-ключ открывает всё.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {companies.map((c) => (
            <a
              key={c.brand}
              href={`/companies/${encodeURIComponent(c.brand)}`}
              className="group rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 transition-colors hover:border-[#00CC00]/40"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-white group-hover:text-[#00FF00]">{c.brand}</span>
                <span className="text-[11px] text-gray-500">
                  {c.count} {c.count === 1 ? "модель" : c.count < 5 ? "модели" : "моделей"}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-gray-500">
                {c.models.join(", ")}{c.count > c.models.length ? " и другие" : ""}
              </p>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}