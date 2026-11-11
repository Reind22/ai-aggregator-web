"use client";

/**
 * Подробный текст о модели — для читателя и поисковых систем.
 *
 * Собирается из реальных данных карточки: характеристики, цены, результаты
 * бенчмарков с числами. Никаких общих фраз вида «мощная модель подходит для
 * любых задач»: только то, что можно проверить в таблицах выше.
 */
const BENCH_ABOUT = {
  "Access to Justice": "юридические задачи, с которыми люди приходят без юриста: разбор договора, права при увольнении, обращения в госорганы",
  "BioMysteryBench": "медицинские и биологические загадки: по набору симптомов и анализов нужно предложить диагноз",
  "ClaimBench": "проверка фактических утверждений: модель решает, подтверждается ли тезис источником",
  "Code Migration": "перенос кода со старых версий и языков на новые, с сохранением поведения",
  "CUA-bench": "управление компьютером: модель работает с интерфейсами через скриншоты и клики",
  "CyberBench": "кибербезопасность: поиск уязвимостей, разбор атак, защитные действия",
  "Excel Modeling": "построение финансовых моделей в Excel по словесному описанию задачи",
  "Finance Agent": "агентские задачи в финансах: собрать данные, посчитать, оформить вывод",
  "Vals Finance Index": "сводный индекс по финансовым задачам разных типов",
  "HLAB-Vals-1.1": "юридические консультации в формате реальной практики",
  "Immigration Bench": "иммиграционное право: визы, статусы, документы, сроки",
  "IOI": "олимпиадные задачи по информатике уровня международной олимпиады",
};

const DA_ABOUT = {
  Website: "сгенерированные сайты: две версии показывают людям, они выбирают лучшую",
  SVG: "векторные иконки по текстовому описанию",
  DataViz: "графики и дашборды по набору данных",
  "UI Component": "отдельные элементы интерфейса: кнопки, формы, таблицы",
  "3D": "трёхмерные сцены и объекты",
  GameDev: "игровые прототипы и механики",
  ASCII: "текстовая графика из символов",
  Image: "генерация изображений",
  Video: "генерация видео",
};

const fmt = (v, digits = 1) => (v == null ? "—" : Number(v).toFixed(digits));

export default function ModelArticle({ model, meta, stats }) {
  const name = meta?.name || model.display_name || model.model || model.id;
  const priceIn = model.price_in ?? model.input_per_1m ?? null;
  const priceOut = model.price_out ?? model.output_per_1m ?? null;
  const priceCache = model.price_cache ?? model.cached_input_per_1m ?? null;
  const benches = Array.isArray(model.benchmarks) ? model.benchmarks : [];
  const design = Array.isArray(model.design_arena) ? model.design_arena : [];
  const caps = [
    meta?.tool_call && "вызов функций (function calling)",
    meta?.structured_output && "структурированный вывод по схеме",
    Array.isArray(meta?.input_modalities) && meta.input_modalities.includes("image") && "приём изображений",
    Array.isArray(meta?.input_modalities) && meta.input_modalities.includes("pdf") && "приём PDF",
    meta?.reasoning && "режим рассуждений",
    meta?.open_weights && "открытые веса",
  ].filter(Boolean);

  // пример стоимости: 1000 запросов по 500 токенов входа и 500 выхода
  const exampleCost =
    priceIn != null && priceOut != null
      ? ((500 * 1000) / 1_000_000) * priceIn + ((500 * 1000) / 1_000_000) * priceOut
      : null;

  const bestBench = benches.slice().sort((a, b) => (a.rank || 999) - (b.rank || 999))[0];
  const worstBench = benches.slice().sort((a, b) => (b.rank || 0) - (a.rank || 0))[0];

  return (
    <section className="mt-12 border-t border-white/[0.06] pt-8">
      <h2 className="text-lg font-semibold text-white">Подробно о модели {name}</h2>

      <div className="mt-4 max-w-3xl space-y-5 text-sm leading-relaxed text-gray-400">
        <p>
          {name} — модель{model.brand ? ` компании ${model.brand}` : ""}
          {meta?.created_at
            ? `, выпущенная ${new Date(meta.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }).replace(/\.$/, "")}`
            : ""}
          {model.modality && model.modality !== "text" ? `, для работы с ${model.modality === "image" ? "изображениями" : model.modality === "video" ? "видео" : "аудио"}` : ""}
          {model.context_length
            ? `. Держит в контексте ${Math.round(model.context_length / 1000).toLocaleString("ru-RU")} тысяч токенов — это примерно ${Math.round(model.context_length / 500).toLocaleString("ru-RU")} страниц текста.`
            : ""}
          {caps.length ? ` Поддерживает ${caps.join(", ")}.` : ""}
        </p>

        {(priceIn != null || priceOut != null) && (
          <>
            <h3 className="pt-1 text-sm font-semibold text-gray-200">Сколько стоит работа</h3>
            <p>
              Входные токены — {fmt(priceIn, 4)} $ за миллион, выходные — {fmt(priceOut, 4)} $.
              {priceCache != null ? ` Повторная отправка того же контекста тарифицируется по кэшу — ${fmt(priceCache, 4)} $.` : ""}
              {exampleCost != null
                ? ` Тысяча запросов, в каждом 500 токенов вопроса и 500 токенов ответа, обойдётся примерно в ${exampleCost.toFixed(2)} $.`
                : ""}
            </p>
          </>
        )}

        {benches.length > 0 && (
          <>
            <h3 className="pt-1 text-sm font-semibold text-gray-200">Что показывают бенчмарки</h3>
            <p>
              Бенчмарк — это набор задач с проверяемым ответом. Место в нём говорит не о «силе»
              модели вообще, а о том, насколько хорошо она решает именно такие задачи. Разница
              в один-два процента обычно лежит внутри статистической погрешности, разрыв в десять
              и больше — уже реальная разница.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              {benches.map((b, i) => {
                const leader = (b.top || [])[0];
                const gap =
                  leader && leader.accuracy != null && b.accuracy != null
                    ? (leader.accuracy - b.accuracy).toFixed(1)
                    : null;
                return (
                  <li key={`${b.benchmark}-${i}`}>
                    <span className="text-gray-300">{b.label}</span>
                    {" — "}
                    {BENCH_ABOUT[b.label] || "отраслевые задачи с проверяемым ответом"}.
                    {" "}Результат: <span className="text-gray-200">{fmt(b.accuracy)}%</span>,
                    место <span className="text-gray-200">#{b.rank}</span> из {b.total_models}.
                    {leader && gap != null && (
                      <> Лидер — {leader.model} с {fmt(leader.accuracy)}%, разрыв {gap} п.п.</>
                    )}
                  </li>
                );
              })}
            </ul>
            {bestBench && worstBench && bestBench.benchmark !== worstBench.benchmark && (
              <p>
                Лучше всего модель показывает себя в «{bestBench.label}» (#{bestBench.rank}),
                слабее — в «{worstBench.label}» (#{worstBench.rank}). Это нормально: модели
                обучают на разных данных, и профиль получается неровным.
              </p>
            )}
          </>
        )}

        {design.length > 0 && (
          <>
            <h3 className="pt-1 text-sm font-semibold text-gray-200">Дизайн и интерфейсы</h3>
            <p>
              Design Arena сравнивает результаты слепым голосованием: два ответа показывают
              человеку, он выбирает лучший, из исходов считается Elo — как в шахматах.
              Здесь модель участвует в {design.length} {design.length === 1 ? "категории" : "категориях"}:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              {design.map((d, i) => (
                <li key={`${d.category}-${i}`}>
                  <span className="text-gray-300">{d.category}</span>
                  {" — "}{DA_ABOUT[d.category] || "задачи по дизайну"}.
                  {" "}Elo <span className="text-gray-200">{d.elo}</span>, место #{d.rank} из {d.total_models}
                  {d.win_rate != null ? `, побед ${d.win_rate}%` : ""}.
                </li>
              ))}
            </ul>
          </>
        )}

        {model.arena && (
          <>
            <h3 className="pt-1 text-sm font-semibold text-gray-200">Общий рейтинг</h3>
            <p>
              В общем зачёте Arena (слепые сравнения ответов на любые вопросы) модель занимает
              #{model.arena.rank} место. Рейтинг {Number(model.arena.rating).toFixed(3)} построен
              на {Number(model.arena.votes).toLocaleString("ru-RU")} голосах — чем больше голосов,
              тем уже доверительный интервал. Свежие релизы часто стоят ниже, чем окажутся через
              месяц: у них просто меньше оценок.
            </p>
          </>
        )}

        {stats?.requests > 0 && (
          <>
            <h3 className="pt-1 text-sm font-semibold text-gray-200">Как ведёт себя у нас</h3>
            <p>
              За последние {stats.period_days} дней через сервис прошло {stats.requests} запросов
              к этой модели{stats.success_rate != null ? `, успешных ${stats.success_rate}%` : ""}.
              {stats.latency_ms_median != null
                ? ` Медианный ответ — ${stats.latency_ms_median} мс, средний ${Math.round(stats.latency_ms_avg)} мс.`
                : ""}
              {stats.latency_ms_median != null && stats.latency_ms_median < 2000
                ? " Это быстрый вариант: подходит для чата и автодополнения."
                : stats.latency_ms_median != null && stats.latency_ms_median > 4000
                  ? " Модель отвечает медленно: для интерактивных сценариев лучше брать что-то быстрее."
                  : ""}
            </p>
          </>
        )}

        <h3 className="pt-1 text-sm font-semibold text-gray-200">Как подключить</h3>
        <p>
          Модель вызывается через OpenAI-совместимый API: адрес{" "}
          <code className="text-gray-300">https://aicombiner.net/v1</code>, ключ в заголовке{" "}
          <code className="text-gray-300">Authorization: Bearer</code>, имя модели —{" "}
          <code className="text-gray-300">{model.model || model.id}</code>. Один ключ открывает
          весь каталог, поэтому переключение между моделями — это смена одного поля в запросе.
          Деньги списываются по факту: за фактические токены, а не за попытку.
        </p>
      </div>
    </section>
  );
}