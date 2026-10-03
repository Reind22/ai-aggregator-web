import Link from "next/link";

const features = [
  {
    icon: "🤖",
    title: "5 нейросетей в одном месте",
    text: "GLM 5.3 Flash, GLM 5.3, GLM 5.2, GLM 5.1 и DeepSeek — переключайся между моделями одним кликом.",
  },
  {
    icon: "💬",
    title: "Telegram, Discord, браузер",
    text: "Начни чат в Telegram, продолжи на сайте. История синхронизирована на всех платформах.",
  },
  {
    icon: "🔑",
    title: "API для разработчиков",
    text: "Получи API-ключ и используй в своих проектах. До 50 ключей на аккаунт.",
  },
  {
    icon: "🖼️",
    title: "Голос, фото, документы",
    text: "Отправляй голосовые, загружай изображения и файлы — AI всё поймёт.",
  },
  {
    icon: "⚡",
    title: "Быстрые ответы",
    text: "Streaming-генерация: текст появляется по мере ответа. Никаких ожиданий.",
  },
  {
    icon: "🔒",
    title: "Безопасно",
    text: "JWT-авторизация, изоляция данных, защита от инъекций. Твои чаты — только твои.",
  },
];

const pricing = [
  {
    name: "Free",
    price: "0₽",
    period: "навсегда",
    balance: "$0.50 / день",
    features: [
      "GLM 5.3 Flash + DeepSeek",
      "~70 запросов в день",
      "5 чатов в истории",
      "Голос и изображения",
      "API-ключи",
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
      "Всё из Free +",
      "GLM 5.3 FlashX",
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
      "Всё из Basic +",
      "GLM 5.2 — сильнее",
      "~2800 запросов в день",
      "Неограниченная история",
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
      "Всё из Pro +",
      "GLM 5.3 и GLM 5.1",
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
    <main className="min-h-screen bg-surface-dark">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface-dark/80 backdrop-blur-md border-b border-surface-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="font-bold text-lg">AI Aggregator</span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Возможности</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Тарифы</a>
            <Link href="/chat" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Открыть чат
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-surface-card border border-surface-border rounded-full px-4 py-1.5 text-sm text-gray-400 mb-6">
            <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></span>
            Работает на GLM 5.3 — последняя модель
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Нейросети
            <span className="text-primary-500"> в Telegram</span>,
            <br />
            Discord и браузере
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Один аккаунт — доступ к 5+ моделям на всех платформах.
            Бесплатный тариф без карты.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/chat"
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
            >
              Начать бесплатно →
            </Link>
            <a
              href="https://t.me/your_bot"
              target="_blank"
              className="border border-surface-border hover:border-gray-500 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:bg-surface-card"
            >
              Открыть в Telegram
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Почему AI Aggregator?
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Мы объединили лучшие модели в один сервис и добавили всё, чего не хватало у конкурентов.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-surface-card border border-surface-border rounded-xl p-6 hover:border-primary-500/50 transition-colors group"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-500 transition-colors">
                  {f.title}
                </h3>
                <p className="text-gray-400 text-sm">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-surface-card/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Тарифы
          </h2>
          <p className="text-gray-400 text-center mb-12">
            Дневной баланс в долларах. Трать на любую модель.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 border transition-all ${
                  plan.highlighted
                    ? "border-primary-500 bg-surface-card relative shadow-lg shadow-primary-500/10"
                    : "border-surface-border bg-surface-card hover:border-gray-600"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Популярный
                  </div>
                )}
                <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-gray-500 text-sm">/ {plan.period}</span>
                </div>
                <div className="text-accent-green text-sm font-medium mb-6">
                  {plan.balance} на запросы
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-accent-green mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                    plan.highlighted
                      ? "bg-primary-600 hover:bg-primary-700 text-white"
                      : "border border-surface-border hover:border-gray-500 text-gray-200"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Готов попробовать?
          </h2>
          <p className="text-gray-400 mb-8">
            Бесплатный тариф — без карты, без ограничений по времени.
          </p>
          <Link
            href="/chat"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
          >
            Начать чат сейчас
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-gray-500">
            <span>⚡</span> AI Aggregator © 2026
          </div>
          <div className="flex gap-6 text-gray-500 text-sm">
            <a href="#" className="hover:text-gray-300">Условия</a>
            <a href="#" className="hover:text-gray-300">Конфиденциальность</a>
            <a href="https://t.me/your_bot" className="hover:text-gray-300">Telegram</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
