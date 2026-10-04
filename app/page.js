import Link from "next/link";

// SVG иконки вместо эмодзи
const IconBot = () => (
  <svg className="w-7 h-7 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l1.57.393A1.875 1.875 0 0122.75 17.5v1.5a1.5 1.5 0 01-1.5 1.5H2.75a1.5 1.5 0 01-1.5-1.5v-1.5a1.875 1.875 0 011.416-1.816L4.2 15.3" />
  </svg>
);
const IconPlatforms = () => (
  <svg className="w-7 h-7 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);
const IconKey = () => (
  <svg className="w-7 h-7 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
  </svg>
);
const IconMedia = () => (
  <svg className="w-7 h-7 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);
const IconBolt = () => (
  <svg className="w-7 h-7 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);
const IconShield = () => (
  <svg className="w-7 h-7 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
    highlighted: false,
  },
  {
    name: "Basic",
    price: "99₽",
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
    highlighted: false,
  },
  {
    name: "Pro",
    price: "249₽",
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
    highlighted: true,
  },
  {
    name: "Ultra",
    price: "449₽",
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
    highlighted: false,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#08080c] relative">
      {/* Hero glow background */}
      <div className="hero-glow absolute inset-x-0 top-0 h-[800px] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#08080c]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold">⚡</span>
            </div>
            <span className="font-semibold text-[15px] tracking-tight">AI Combiner</span>
          </div>
          <nav className="flex items-center gap-5 text-sm">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors hidden md:block">Возможности</a>
            <a href="#pricing" className="text-gray-400 hover:text-white transition-colors hidden md:block">Тарифы</a>
            <Link href="/login" className="border border-white/15 hover:border-white/35 text-gray-200 px-4 py-2 rounded-lg font-medium transition-colors">
              Войти
            </Link>
            <Link href="/chat" className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Открыть чат
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-1.5 text-sm text-gray-300 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Работает на GLM 5.3 — последняя модель
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
            Нейросети
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"> везде</span>,
            <br />
            где тебе удобно
          </h1>
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Один аккаунт — доступ к 5+ моделям через Telegram, Discord и браузер.
            Дневной баланс в долларах. Бесплатный тариф без карты.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/chat"
              className="bg-white text-black px-8 py-3.5 rounded-xl font-semibold text-base transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-white/10"
            >
              Начать бесплатно
            </Link>
            <a
              href="https://t.me/aicombinernet_bot?utm_source=website"
              target="_blank"
              className="border border-white/10 hover:border-white/25 px-8 py-3.5 rounded-xl font-semibold text-base transition-all hover:bg-white/5"
            >
              Открыть в Telegram
            </a>
          </div>
        </div>

        {/* Product screenshot placeholder */}
        <div className="max-w-4xl mx-auto mt-16 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="bg-gradient-to-b from-white/[0.08] to-transparent rounded-2xl p-1">
            <div className="bg-[#0d0d14] rounded-xl border border-white/[0.08] overflow-hidden">
              {/* Fake browser bar */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06]">
                <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                <div className="ml-3 text-xs text-gray-600 bg-white/[0.04] rounded-md px-3 py-0.5">
                  aicombiner.net/chat
                </div>
              </div>
              {/* Fake chat UI */}
              <div className="flex h-[360px]">
                <div className="w-48 border-r border-white/[0.06] p-3 hidden sm:block">
                  <div className="bg-primary-600/20 border border-primary-600/30 rounded-lg py-2 text-center text-sm text-primary-400 font-medium mb-3">
                    + Новый чат
                  </div>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-8 bg-white/[0.04] rounded-md mb-2"></div>
                  ))}
                </div>
                <div className="flex-1 p-4 flex flex-col justify-end gap-3">
                  <div className="self-end bg-blue-600 rounded-2xl rounded-br-md px-4 py-2.5 max-w-[70%] text-sm">
                    Привет! Объясни квантовую запутанность простыми словами
                  </div>
                  <div className="self-start bg-white/[0.06] rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[80%] text-sm text-gray-300">
                    Представь две монеты, которые связаны невидимой нитью...
                  </div>
                  <div className="self-end bg-blue-600 rounded-2xl rounded-br-md px-4 py-2.5 max-w-[70%] text-sm">
                    А как это используется в компьютерах?
                  </div>
                  <div className="self-start bg-white/[0.06] rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[80%] text-sm text-gray-300">
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{animationDelay:'0.15s'}}></span>
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{animationDelay:'0.3s'}}></span>
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
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Всё, что нужно в одном месте
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Мы объединили лучшие модели и добавили то, чего не хватало у конкурентов.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all group"
              >
                <div className="mb-5 p-2.5 bg-primary-500/10 rounded-xl w-fit group-hover:bg-primary-500/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Прозрачные тарифы
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Дневной баланс в долларах — трать на любую модель. Остаток не переносится.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 border transition-all ${
                  plan.highlighted
                    ? "border-primary-500/50 bg-primary-500/[0.04] relative"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-[11px] font-semibold px-3 py-0.5 rounded-full">
                    Популярный выбор
                  </div>
                )}
                <h3 className="font-medium text-gray-400 text-sm mb-3">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                  <span className="text-gray-600 text-sm">/мес</span>
                </div>
                <div className="text-emerald-400/80 text-sm font-medium mb-8">
                  {plan.balance} на запросы
                </div>
                <div className="space-y-2.5 mb-8 min-h-[140px]">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <svg className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </div>
                  ))}
                </div>
                <button
                  className={`w-full py-2.5 rounded-xl font-medium text-sm transition-colors ${
                    plan.highlighted
                      ? "bg-primary-600 hover:bg-primary-700 text-white"
                      : "border border-white/10 hover:border-white/25 text-gray-200 hover:bg-white/5"
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
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Готов попробовать?
          </h2>
          <p className="text-gray-500 mb-8">
            Бесплатный тариф — без карты, без ограничений по времени.
          </p>
          <Link
            href="/chat"
            className="inline-block bg-white text-black px-10 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-white/10"
          >
            Начать бесплатно
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-5 h-5 bg-gradient-to-br from-primary-500 to-purple-600 rounded flex items-center justify-center text-[10px]">⚡</div>
            AI Combiner © 2026
          </div>
          <div className="flex gap-6 text-gray-600">
            <a href="#" className="hover:text-gray-400 transition-colors">Условия использования</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Конфиденциальность</a>
            <a href="https://t.me/aicombinernet_bot?utm_source=website" className="hover:text-gray-400 transition-colors">Telegram</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
