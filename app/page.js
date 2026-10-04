import Link from "next/link";

// SVG иконки (монохром, зелёный акцент)
const iconCls = "w-7 h-7 text-[#00CC00]";
const IconBot = () => (
  <svg className={iconCls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l1.57.393A1.875 1.875 0 0122.75 17.5v1.5a1.5 1.5 0 01-1.5 1.5H2.75a1.5 1.5 0 01-1.5-1.5v-1.5a1.875 1.875 0 011.416-1.816L4.2 15.3" />
  </svg>
);
const IconPlatforms = () => (
  <svg className={iconCls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);
const IconKey = () => (
  <svg className={iconCls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
  </svg>
);
const IconMedia = () => (
  <svg className={iconCls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);
const IconBolt = () => (
  <svg className={iconCls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);
const IconShield = () => (
  <svg className={iconCls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const features = [
  {
    icon: <IconBot />,
    title: "5 нейросетей в одном месте",
    text: "GLM 5.3 Flash, GLM 5.3, GLM 5.2, GLM 5.1 и DeepSeek — переключайся между моделями одним кликом.",
  },
  {
    icon: <IconPlatforms />,
    title: "Telegram, Discord, браузер",
    text: "Начни чат в Telegram, продолжи на сайте. История синхронизирована на всех платформах.",
  },
  {
    icon: <IconKey />,
    title: "API для разработчиков",
    text: "Получи API-ключ и используй в своих проектах. До 50 ключей на аккаунт, скидка до 25%.",
  },
  {
    icon: <IconMedia />,
    title: "Голос, фото, документы",
    text: "Отправляй голосовые (Whisper на сервере), загружай изображения и файлы — AI всё поймёт.",
  },
  {
    icon: <IconBolt />,
    title: "Streaming-ответы",
    text: "Текст появляется по мере генерации. Не ждёшь весь ответ — видишь его сразу.",
  },
  {
    icon: <IconShield />,
    title: "Безопасно",
    text: "JWT-авторизация, изоляция данных, Docker-контейнер, защита от prompt injection.",
  },
];

// Тарифы — финальные цены (Free 0 / Basic 249 / Pro 799 / Ultra 999)
const pricing = [
  {
    name: "Free",
    price: "0₽",
    period: "навсегда",
    balance: "$0.50 / день",
    features: [
      "GLM 5.3 Flash + DeepSeek Chat",
      "~70 запросов в день",
      "5 чатов в истории",
      "Голос и изображения",
      "API-ключи (до 50)",
    ],
    cta: "Начать бесплатно",
    badge: null,
  },
  {
    name: "Basic",
    price: "249₽",
    period: "в месяц",
    balance: "$1.00 / день",
    features: [
      "Всё из Free",
      "+ GLM 5.3 FlashX",
      "~700 запросов в день",
      "25 чатов в истории",
      "Приоритетная поддержка",
    ],
    cta: "Выбрать Basic",
    badge: null,
  },
  {
    name: "Pro",
    price: "799₽",
    period: "в месяц",
    balance: "$3.00 / день",
    features: [
      "Всё из Basic",
      "+ GLM 5.2 — сильная модель",
      "~2800 запросов в день",
      "∞ история чатов",
      "−15% на API-токены",
    ],
    cta: "Выбрать Pro",
    badge: null,
  },
  {
    name: "Ultra",
    price: "999₽",
    period: "в месяц",
    balance: "$5.00 / день",
    features: [
      "Всё из Pro",
      "+ GLM 5.3 и GLM 5.1",
      "~14000 запросов в день",
      "Priority-обработка",
      "−25% на API-токены",
    ],
    cta: "Выбрать Ultra",
    badge: "Максимальная выгода", // бейдж на последней подписке
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-surface-dark relative">
      {/* Hero glow */}
      <div className="hero-glow absolute inset-x-0 top-0 h-[800px] pointer-events-none" />

      {/* Header — sticky, белая, тень снизу */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-surface-border shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00FF00] to-[#00CC00] rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-[#0A2A0A]">⚡</span>
            </div>
            <span className="font-semibold text-[15px] tracking-tight text-ink">AI Combiner</span>
          </div>
          <nav className="flex items-center gap-5 text-sm">
            <a href="#features" className="text-ink-soft hover:text-ink transition-colors hidden md:block">Возможности</a>
            <a href="#pricing" className="text-ink-soft hover:text-ink transition-colors hidden md:block">Тарифы</a>
            <Link href="/login" className="border border-[#D5D5D5] hover:border-[#00CC00] text-ink px-4 py-2 rounded-lg font-medium transition-colors">
              Войти
            </Link>
            <Link href="/chat" className="bg-[#00FF00] hover:bg-[#00CC00] text-[#0A2A0A] px-4 py-2 rounded-lg font-semibold transition-colors">
              Открыть чат
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white border border-surface-border rounded-full px-4 py-1.5 text-sm text-ink-soft mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00CC00] animate-pulse"></span>
            Работает на GLM 5.3 — последняя модель
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-6 text-ink">
            Нейросети
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00CC00] to-[#008800]"> везде</span>,
            <br />
            где тебе удобно
          </h1>
          <p className="text-lg text-ink-soft mb-10 max-w-2xl mx-auto leading-relaxed">
            Один аккаунт — доступ к 5+ моделям через Telegram, Discord и браузер.
            Дневной баланс в долларах. Бесплатный тариф без карты.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/chat"
              className="bg-[#00FF00] text-[#0A2A0A] px-8 py-3.5 rounded-xl font-semibold text-base transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-[#00CC00]/20"
            >
              Начать бесплатно
            </Link>
            <a
              href="https://t.me/aicombinernet_bot?utm_source=website"
              target="_blank"
              className="border border-[#D5D5D5] hover:border-[#00CC00] px-8 py-3.5 rounded-xl font-semibold text-base transition-all hover:bg-white text-ink"
            >
              Открыть в Telegram
            </a>
          </div>
        </div>

        {/* Мокап продукта */}
        <div className="max-w-4xl mx-auto mt-16 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="bg-white rounded-2xl p-1 shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-surface-border">
            <div className="bg-[#FAFAFA] rounded-xl overflow-hidden">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-surface-border bg-white">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
                <div className="w-3 h-3 rounded-full bg-[#FEBC2E]"></div>
                <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
                <div className="ml-3 text-xs text-ink-mute bg-surface-dark rounded-md px-3 py-0.5">
                  aicombiner.net/chat
                </div>
              </div>
              {/* Fake chat UI */}
              <div className="flex h-[360px]">
                <div className="w-48 border-r border-surface-border p-3 hidden sm:block bg-white">
                  <div className="bg-[#E8F5E9] border border-[#00CC00]/30 rounded-lg py-2 text-center text-sm text-[#00A000] font-medium mb-3">
                    + Новый чат
                  </div>
                  {["Квантовая запутанность", "Код на Python", "Рецепт борща", "Резюме статьи"].map((t) => (
                    <div key={t} className="px-2 py-1.5 text-xs text-ink-soft rounded-md mb-1 truncate hover:bg-surface-hover cursor-pointer">
                      {t}
                    </div>
                  ))}
                </div>
                <div className="flex-1 p-4 flex flex-col justify-end gap-3">
                  <div className="self-end bg-[#00CC00] rounded-2xl rounded-br-md px-4 py-2.5 max-w-[70%] text-sm text-white">
                    Привет! Объясни квантовую запутанность простыми словами
                  </div>
                  <div className="self-start bg-white border border-surface-border rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[80%] text-sm text-ink-soft">
                    Представь две монеты, которые связаны невидимой нитью...
                  </div>
                  <div className="self-end bg-[#00CC00] rounded-2xl rounded-br-md px-4 py-2.5 max-w-[70%] text-sm text-white">
                    А как это используется в компьютерах?
                  </div>
                  <div className="self-start bg-white border border-surface-border rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[80%] text-sm">
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 bg-[#999] rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-[#999] rounded-full animate-bounce" style={{animationDelay:'0.15s'}}></span>
                      <span className="w-1.5 h-1.5 bg-[#999] rounded-full animate-bounce" style={{animationDelay:'0.3s'}}></span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-ink">
              Всё, что нужно в одном месте
            </h2>
            <p className="text-ink-soft max-w-xl mx-auto">
              Мы объединили лучшие модели и добавили то, чего не хватало у конкурентов.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white border border-surface-border rounded-2xl p-6 hover:border-[#00CC00] hover:shadow-[0_8px_24px_rgba(0,204,0,0.12)] hover:-translate-y-1 transition-all group"
              >
                <div className="mb-5 p-2.5 bg-[#E8F5E9] rounded-xl w-fit group-hover:bg-[#D5F0D8] transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-base mb-2 text-ink">{f.title}</h3>
                <p className="text-ink-soft text-sm leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-ink">
              Прозрачные тарифы
            </h2>
            <p className="text-ink-soft max-w-md mx-auto">
              Дневной баланс в долларах — трать на любую модель. Остаток не переносится.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 border bg-white transition-all hover:-translate-y-1 ${
                  plan.badge
                    ? "border-[#00CC00] shadow-[0_8px_24px_rgba(0,204,0,0.12)] relative"
                    : "border-surface-border hover:border-[#00CC00] hover:shadow-[0_8px_24px_rgba(0,204,0,0.08)]"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00FF00] text-[#0A2A0A] text-[11px] font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}
                <h3 className="font-medium text-ink-soft text-sm mb-3">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold tracking-tight text-ink">{plan.price}</span>
                  <span className="text-ink-mute text-sm">/мес</span>
                </div>
                <div className="text-[#008F00] text-sm font-semibold mb-8">
                  {plan.balance} на запросы
                </div>
                <div className="space-y-2.5 mb-8 min-h-[140px]">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 text-sm text-ink-soft">
                      <svg className="w-4 h-4 text-[#00CC00] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </div>
                  ))}
                </div>
                <button
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                    plan.badge
                      ? "bg-[#00FF00] hover:bg-[#00CC00] text-[#0A2A0A]"
                      : "border border-[#D5D5D5] hover:border-[#00CC00] text-ink hover:bg-[#E8F5E9]"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 relative">
        <div className="hero-glow absolute inset-0 pointer-events-none" />
        <div className="max-w-2xl mx-auto text-center relative">
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-ink">
            Готов попробовать?
          </h2>
          <p className="text-ink-soft mb-8">
            Бесплатный тариф — без карты, без ограничений по времени.
          </p>
          <Link
            href="/chat"
            className="inline-block bg-[#00FF00] text-[#0A2A0A] px-10 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#00CC00]/25"
          >
            Начать бесплатно
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border py-8 px-4 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-ink-mute">
            <div className="w-5 h-5 bg-gradient-to-br from-[#00FF00] to-[#00CC00] rounded flex items-center justify-center text-[10px]">⚡</div>
            AI Combiner © 2026
          </div>
          <div className="flex gap-6 text-ink-mute">
            <a href="#" className="hover:text-ink transition-colors">Условия использования</a>
            <a href="#" className="hover:text-ink transition-colors">Конфиденциальность</a>
            <a href="https://t.me/aicombinernet_bot?utm_source=website" className="hover:text-ink transition-colors">Telegram</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
