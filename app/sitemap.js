/**
 * sitemap: статические страницы + все модели каталога.
 * Модели берём из нашего API, чтобы поисковики видели каждую карточку.
 */
export default async function sitemap() {
  const base = "https://aicombiner.net";
  const now = new Date();

  const staticPages = [
    { url: base + "/", lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: base + "/models", lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: base + "/pricing", lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: base + "/chat", lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: base + "/login", lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: base + "/privacy", lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: base + "/terms", lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  let models = [];
  try {
    const api = process.env.API_INTERNAL_URL || "http://127.0.0.1:8000";
    const res = await fetch(`${api}/models/list`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const items = data.items || data || [];
      models = items
        .filter((m) => m.enabled !== false && !m.soon)
        .map((m) => ({
          url: `${base}/models/${encodeURIComponent(m.id || m.model)}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.8,
        }));
    }
  } catch (e) {
    // без каталога отдаём хотя бы статические страницы
  }

  return [...staticPages, ...models];
}