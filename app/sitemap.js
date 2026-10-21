export default function sitemap() {
  const base = 'https://aicombiner.net';
  const now = new Date();
  return [
    { url: base + '/',           lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: base + '/pricing',    lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: base + '/login',      lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: base + '/privacy',    lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: base + '/terms',      lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ];
}
