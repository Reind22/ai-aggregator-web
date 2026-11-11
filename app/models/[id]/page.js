/**
 * /models/[id] — карточка модели: описание, характеристики, цены, лимиты,
 * наша статистика, ссылки. Страница генерируется на сервере, поэтому каждая
 * модель индексируется поисковиками со своим заголовком и описанием.
 */
import Logo from "../../../components/Logo";
import SiteHeader from "../../../components/SiteHeader";
import BenchChart from "../../../components/BenchChart";

const API = process.env.API_INTERNAL_URL || "http://127.0.0.1:8000";

async function loadModel(id) {
  try {
    const res = await fetch(`${API}/models/${encodeURIComponent(id)}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

const MODALITY_LABEL = { text: "текст", image: "изображения", video: "видео", audio: "аудио" };

const BENCH_INFO = {
  "Access to Justice": "юридические задачи без юриста",
  "BioMysteryBench": "биология и медицина",
  "ClaimBench": "проверка фактов",
  "Code Migration": "перенос кода между версиями",
  "CUA-bench": "управление интерфейсами",
  "CyberBench": "кибербезопасность",
  "Excel Modeling": "финансовые модели в Excel",
  "Finance Agent": "агентские финансовые задачи",
  "Vals Finance Index": "сводный финансовый индекс",
  "HLAB-Vals-1.1": "юридические консультации",
  "Immigration Bench": "иммиграционное право",
  "IOI": "олимпиада по информатике",
};

const normName = (s) =>
  String(s || "").toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const VENDOR_SITES = {
  OpenAI: "https://openai.com/index/",
  Anthropic: "https://www.anthropic.com/news",
  Google: "https://deepmind.google/models/",
  DeepSeek: "https://api-docs.deepseek.com/",
  Zhipu: "https://z.ai/",
  xAI: "https://x.ai/news",
  Meta: "https://ai.meta.com/blog/",
  Alibaba: "https://qwen.ai/",
  Moonshot: "https://www.moonshot.ai/",
  MiniMax: "https://www.minimax.io/",
  ByteDance: "https://www.volcengine.com/",
  Tencent: "https://hunyuan.tencent.com/",
  Xiaomi: "https://xiaomi-mi.com/",
};
const money = (v) => (v == null ? "—" : `$${Number(v).toFixed(4)}`);
const ctx = (v) => {
  if (!v) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M токенов`;
  if (v >= 1000) return `${Math.round(v / 1000)}K токенов`;
  return `${v} токенов`;
};

export async function generateMetadata({ params }) {
  const { id } = await params;
  const m = await loadModel(id);
  const name = m?.meta?.name || m?.name || id;
  const brand = m?.brand || "";
  const price = m?.price_in != null ? `$${Number(m.price_in).toFixed(4)} за 1M токенов на входе` : "";
  const context = m?.context_length ? `контекст ${ctx(m.context_length)}` : "";

  const title = `${name} — характеристики, цены и лимиты`;
  const description = m?.meta?.description
    ? `${m.meta.description.slice(0, 150)}… ${brand} ${context}, ${price}.`
    : `${name}${brand ? ` от ${brand}` : ""}: ${context}, ${price}. Доступ по одному API-ключу AI Combiner.`;

  return {
    title,
    description,
    alternates: { canonical: `/models/${id}` },
    openGraph: { title, description, type: "article", url: `/models/${id}` },
  };
}

export default async function ModelPage({ params }) {
  const { id } = await params;
  const m = await loadModel(id);

  if (!m) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#0A0A0F] text-gray-300">
        <Logo size={48} />
        <p className="text-sm">Модель не найдена</p>
        <a href="/models" className="text-sm text-[#00FF00] hover:underline">← В каталог моделей</a>
      </div>
    );
  }

  const meta = m.meta || {};
  const mid = m.id || m.model || id;
  const title = m.name || m.display_name || meta.name || m.model || id;
  const priceIn = m.price_in ?? m.input_per_1m ?? null;
  const priceOut = m.price_out ?? m.output_per_1m ?? null;
  const priceCache = m.price_cache ?? m.cached_input_per_1m ?? null;
  const stats = m.stats || {};
  const name = title;
  const links = meta.links || {};
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    applicationCategory: "AI model",
    operatingSystem: "API",
    description: meta.description || undefined,
    datePublished: meta.created_at || undefined,
    offers: (m.price_in ?? m.input_per_1m) != null
      ? { "@type": "Offer", price: Number(m.price_in ?? m.input_per_1m), priceCurrency: "USD" }
      : undefined,
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-gray-200">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <SiteHeader active="/models" />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <nav className="mb-4 text-xs text-gray-500">
          <a href="/models" className="hover:text-gray-300">Модели</a>
          <span className="mx-1.5">/</span>
          {m.brand && (
            <>
              <a href={`/companies/${encodeURIComponent(m.brand)}`} className="hover:text-gray-300">{m.brand}</a>
              <span className="mx-1.5">/</span>
            </>
          )}
          <span className="text-gray-400">{name}</span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{name}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span className="rounded-md border border-white/10 px-2 py-0.5">{m.brand}</span>
              <span className="rounded-md border border-white/10 px-2 py-0.5">
                {MODALITY_LABEL[m.modality] || m.modality}
              </span>
              {meta.created_at && (
                <span className="rounded-md border border-white/10 px-2 py-0.5">
                  релиз {new Date(meta.created_at).toLocaleDateString("ru-RU")}
                </span>
              )}
              {meta.reasoning && (
                <span className="rounded-md border border-[#00CC00]/40 px-2 py-0.5 text-[#00FF00]">reasoning</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <a href={`/chat?model=${encodeURIComponent(mid)}`}
               className="rounded-lg bg-[#00FF00] px-4 py-2 text-sm font-medium text-[#0A2A0A] hover:bg-[#00CC00]">
              Попробовать
            </a>
            <a href="#api" className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:border-[#00CC00]/50">
              Подключить API
            </a>
          </div>
        </div>

        {(m.providers || []).length > 1 && (
          <p className="mt-3 text-[11px] text-gray-500">
            Доступна через несколько каналов: <span className="text-gray-400">{m.providers.join(", ")}</span>
            {" "}— это одна и та же модель, а не разные.
          </p>
        )}

        {meta.description && (
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-400">{meta.description}</p>
        )}

        {/* Характеристики */}
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Характеристики</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Контекст", ctx(m.context_length)],
              ["Максимум на выход", meta.max_output_tokens ? ctx(meta.max_output_tokens) : "—"],
              ["Входные данные", (meta.input_modalities || [m.modality]).join(", ")],
              ["Выходные данные", (meta.output_modalities || ["text"]).join(", ")],
              ["Knowledge cutoff", meta.knowledge_cutoff || "—"],
              ["Токенизатор", meta.tokenizer || "—"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5">
                <div className="text-[11px] uppercase tracking-wide text-gray-500">{k}</div>
                <div className="mt-0.5 text-sm text-gray-200">{v}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Возможности */}
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Возможности</h2>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {[
              ["Вызов функций", meta.tool_call],
              ["Structured output", meta.structured_output],
              ["Открытые веса", meta.open_weights],
              ["Приём файлов", meta.attachment],
              ["Reasoning", meta.reasoning],
            ].map(([label, flag]) => (
              <span key={label}
                className={`rounded-md border px-2.5 py-1 ${flag
                  ? "border-[#00CC00]/40 bg-[#00CC00]/10 text-[#00FF00]"
                  : "border-white/10 text-gray-500"}`}>
                {flag ? "✓ " : "— "}{label}
              </span>
            ))}
            {Array.isArray(meta.reasoning_options) && meta.reasoning_options.length > 0 && (
              <span className="rounded-md border border-white/10 px-2.5 py-1 text-gray-400">
                effort: {meta.reasoning_options.map((o) => (o.values || []).join("/")).join(", ")}
              </span>
            )}
          </div>
        </section>

        {/* Цены */}
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Цены</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {[
              ["Вход", money(priceIn), "за 1M токенов"],
              ["Выход", money(priceOut), "за 1M токенов"],
              ["Из кэша", money(priceCache), "за 1M токенов"],
            ].map(([k, v, hint]) => (
              <div key={k} className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5">
                <div className="text-[11px] uppercase tracking-wide text-gray-500">{k}</div>
                <div className="mt-0.5 text-lg font-semibold tabular-nums text-white">{v}</div>
                <div className="text-[11px] text-gray-600">{hint}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Наша статистика */}
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Статистика у нас <span className="normal-case text-gray-600">· за {stats.period_days || 30} дней</span>
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            {[
              ["Запросов", stats.requests ?? 0],
              ["Успешных", stats.success_rate != null ? `${stats.success_rate}%` : "—"],
              ["Медиана ответа", stats.latency_ms_median != null ? `${stats.latency_ms_median} мс` : "—"],
              ["Средняя", stats.latency_ms_avg != null ? `${Math.round(stats.latency_ms_avg)} мс` : "—"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5">
                <div className="text-[11px] uppercase tracking-wide text-gray-500">{k}</div>
                <div className="mt-0.5 text-lg font-semibold tabular-nums text-white">{v}</div>
              </div>
            ))}
          </div>
          {!stats.requests && (
            <p className="mt-2 text-[11px] text-gray-600">
              По этой модели у нас пока не было запросов через API — статистика появится после первых вызовов.
            </p>
          )}
        </section>

        {/* Бенчмарки */}
        <section className="mt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Бенчмарки</h2>
            <span className="text-[11px] text-gray-600">
              независимые замеры: Vals AI и Design Arena
            </span>
          </div>

          {/* Vals: точность на отраслевых задачах */}
          {Array.isArray(m.benchmarks) && m.benchmarks.length > 0 && (
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {m.benchmarks.map((b, i) => (
                <BenchChart
                  key={`v-${b.benchmark}-${i}`}
                  title={b.label}
                  subtitle={`${BENCH_INFO[b.label] || "отраслевые задачи"} · #${b.rank} из ${b.total_models}`}
                  rows={[
                    ...(b.top || []).map((t) => ({ label: t.model, value: t.accuracy })),
                    ...(b.top || []).some((t) => normName(t.model) === normName(b.display))
                      ? []
                      : [{ label: b.display || "наша модель", value: b.accuracy, ours: true }],
                  ].map((r) => ({
                    ...r,
                    ours: r.ours || normName(r.label) === normName(b.display),
                  }))}
                />
              ))}
            </div>
          )}

          {/* Design Arena: Elo по слепым сравнениям */}
          {Array.isArray(m.design_arena) && m.design_arena.length > 0 && (
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {m.design_arena.map((b, i) => (
                <BenchChart
                  key={`d-${b.category}-${i}`}
                  title={`Design Arena · ${b.category}`}
                  subtitle={`слепые сравнения · #${b.rank} из ${b.total_models} · побед ${b.win_rate ?? "—"}%`}
                  unit=""
                  rows={[
                    ...(b.top || []).map((t) => ({ label: t.model, value: t.elo })),
                    ...(b.top || []).some((t) => normName(t.model) === normName(m.model || m.id))
                      ? []
                      : [{ label: m.model || m.id, value: b.elo, ours: true }],
                  ]}
                />
              ))}
            </div>
          )}

          {/* Arena: место и рейтинг */}
          {m.arena && (
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg border border-[#00CC00]/30 bg-[#00CC00]/[0.06] px-3 py-2.5">
                <div className="text-[11px] uppercase tracking-wide text-gray-500">Arena, место</div>
                <div className="mt-0.5 text-lg font-semibold text-white">#{m.arena.rank}</div>
              </div>
              <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5">
                <div className="text-[11px] uppercase tracking-wide text-gray-500">Рейтинг</div>
                <div className="mt-0.5 text-lg font-semibold tabular-nums text-white">
                  {Number(m.arena.rating).toFixed(3)}
                </div>
              </div>
              <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5">
                <div className="text-[11px] uppercase tracking-wide text-gray-500">Голосов</div>
                <div className="mt-0.5 text-lg font-semibold tabular-nums text-white">
                  {Number(m.arena.votes).toLocaleString("ru-RU")}
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-gray-600">
            {m.arena?.url && (
              <a href={m.arena.url} target="_blank" rel="noopener noreferrer" className="text-[#00CC00] hover:underline">
                Официальный анонс модели ↗
              </a>
            )}
            <span>Источники: Vals AI, Design Arena, Arena (LMArena).</span>
          </div>
        </section>

        {/* API */}
        <section id="api" className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Подключение</h2>
          <div className="mt-3 overflow-hidden rounded-lg border border-white/[0.08] bg-[#0d0d14]">
            <pre className="overflow-x-auto px-4 py-3 text-[11px] leading-relaxed text-gray-300">
{`curl https://aicombiner.net/v1/chat/completions \\
  -H "Authorization: Bearer $AICO_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model": "${mid}", "messages": [{"role": "user", "content": "Привет"}]}'`}
            </pre>
          </div>
          <p className="mt-2 text-[11px] text-gray-600">
            Один ключ открывает все модели каталога. <a href="/docs" className="text-[#00CC00] hover:underline">Документация</a>
          </p>
        </section>

        {/* Ссылки */}
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Официальные источники</h2>
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            {VENDOR_SITES[m.brand] && (
              <a href={VENDOR_SITES[m.brand]} target="_blank" rel="noopener noreferrer" className="text-[#00CC00] hover:underline">
                {m.brand} — сайт вендора ↗
              </a>
            )}
            <a href={`https://openrouter.ai/models?q=${encodeURIComponent(name)}`} target="_blank" rel="noopener noreferrer" className="text-[#00CC00] hover:underline">
              Карточка в OpenRouter ↗
            </a>
            {(links.hugging_face || meta.hugging_face_id) && (
              <a href={links.hugging_face || `https://huggingface.co/${meta.hugging_face_id}`}
                 target="_blank" rel="noopener noreferrer" className="text-[#00CC00] hover:underline">
                Веса на Hugging Face ↗
              </a>
            )}
          </div>
        </section>

        {(links.website || links.hugging_face || meta.hugging_face_id) && (
          <section className="mt-8 flex flex-wrap gap-3 text-xs">
            {links.website && <a href={links.website} target="_blank" rel="noopener noreferrer" className="text-[#00CC00] hover:underline">Сайт модели</a>}
            {(links.hugging_face || meta.hugging_face_id) && (
              <a href={links.hugging_face || `https://huggingface.co/${meta.hugging_face_id}`}
                 target="_blank" rel="noopener noreferrer" className="text-[#00CC00] hover:underline">
                Hugging Face
              </a>
            )}
          </section>
        )}
        {/* Подробное описание — для читателя и поисковиков */}
        <section className="mt-12 border-t border-white/[0.06] pt-8">
          <h2 className="text-lg font-semibold text-white">Подробно о модели {name}</h2>

          <div className="mt-4 space-y-4 text-sm leading-relaxed text-gray-400">
            <p>
              <b className="text-gray-200">{name}</b> — модель{m.brand ? ` от ${m.brand}` : ""}
              {meta.created_at ? `, выпущенная ${new Date(meta.created_at).toLocaleDateString("ru-RU")}` : ""}.
              {meta.description ? ` ${meta.description}` : ""}
            </p>

            {m.context_length && (
              <>
                <h3 className="pt-2 text-sm font-semibold text-gray-200">Что такое контекст и зачем он нужен</h3>
                <p>
                  Контекст — сколько текста модель держит «в голове» за один разговор: вопрос,
                  документы, предыдущие ответы. У {name} это {ctx(m.context_length)}.
                  Если разговор длиннее, старое придётся сокращать или разбивать задачу на части.
                  Для сравнения: один абзац — примерно 100 токенов, страница текста — около 500.
                </p>
              </>
            )}

            <h3 className="pt-2 text-sm font-semibold text-gray-200">Сколько это стоит</h3>
            <p>
              Оплата по факту: вход — {money(priceIn)} за миллион токенов, выход — {money(priceOut)},
              чтение из кэша — {money(priceCache)}. Вход — это то, что вы отправляете (промпт, файлы,
              история), выход — то, что модель пишет в ответ. Кэш срабатывает, когда один и тот же
              контекст отправляют повторно: тогда вход стоит дешевле.
            </p>

            {(m.benchmarks?.length || m.design_arena?.length) ? (
              <>
                <h3 className="pt-2 text-sm font-semibold text-gray-200">Что показывают бенчмарки</h3>
                <p>
                  Бенчмарк — это набор задач с проверяемым ответом, на котором модели сравнивают
                  между собой. Важно смотреть не на абсолютное число, а на место и разрыв с лидером:
                  разница в 1–2% обычно внутри статистической погрешности, разрыв в 20% — уже
                  реальная разница в качестве.
                </p>
                <ul className="list-disc space-y-1.5 pl-5">
                  {Array.from(new Set((m.benchmarks || []).map((b) => b.label))).map((label) => (
                    <li key={label}>
                      <span className="text-gray-300">{label}</span>
                      {" — "}{BENCH_INFO[label] || "отраслевые задачи с проверяемым ответом"}.
                    </li>
                  ))}
                  {(m.design_arena || []).length > 0 && (
                    <li>
                      <span className="text-gray-300">Design Arena</span>
                      {" — "}слепые сравнения: два результата показывают людям, они выбирают лучший,
                      из исходов считается Elo. Показывает, насколько аккуратно модель делает
                      интерфейсы, а не насколько «умна» в целом.
                    </li>
                  )}
                  {m.arena && (
                    <li>
                      <span className="text-gray-300">Arena (LMArena)</span>
                      {" — "}общий рейтинг по слепым сравнениям ответов на любые вопросы;
                      место #{m.arena.rank} и {Number(m.arena.votes).toLocaleString("ru-RU")} голосов.
                    </li>
                  )}
                </ul>
              </>
            ) : null}

            <h3 className="pt-2 text-sm font-semibold text-gray-200">Как получить доступ</h3>
            <p>
              Модель доступна через OpenAI-совместимый API: один ключ открывает весь каталог,
              переключается только поле <code className="text-gray-300">model</code>. Оплата — с баланса,
              списывается по факту использования. Лимиты (деньги, запросы в минуту, список моделей,
              срок жизни) задаются на ключе в кабинете.
            </p>
            {m.providers?.length > 1 && (
              <p>
                Модель подключена через несколько каналов ({m.providers.join(", ")}): это одна и та же
                модель, разные маршруты доставки. Если один канал недоступен, запрос уходит в другой.
              </p>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}