"use client";

import Link from "next/link";
import Logo from "../components/Logo";
import SiteHeader from "../components/SiteHeader";

// SVG иконки (зелёный акцент)
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
    text: "Отправляй голосовые сообщения, загружай изображения и файлы — AI всё поймёт.",
  },
  {
    icon: <IconBolt />,
    title: "Streaming-ответы",
    text: "Текст появляется по мере генерации. Не ждёшь весь ответ — видишь его сразу.",
  },
  {
    icon: <IconShield />,
    title: "Безопасно",
    text: "Изоляция данных каждого аккаунта, защита от взлома и злоупотреблений.",
  },
];

// Клик по кнопке Telegram — событие в Umami
function trackTgClick(place) {
  if (typeof window !== "undefined" && window.umami) {
    window.umami.track("telegram-click", { place });
  }
}

export default function Home() {
  return (
    <main className="min-h-screen bg-surface-dark relative">
      <div className="hero-glow absolute inset-x-0 top-0 h-[800px] pointer-events-none" />

      {/* Header */}
      <SiteHeader />

      {/* Hero */}
      <section className="relative pt-16 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-1.5 text-sm text-gray-300 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF00] animate-pulse"></span>
            Работает на GLM 5.3 — последняя модель
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6 text-white">
            Нейросети
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF00] to-[#00A000]"> везде</span>,
            <br />
            где тебе удобно
          </h1>
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Один аккаунт — доступ к 90+ моделям через Telegram, Discord и браузер.
            Оплата по факту: пополняете баланс и тратите только на запросы.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/chat"
              className="bg-[#00FF00] text-black px-8 py-3.5 rounded-xl font-bold text-base transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-[#00CC00]/20"
            >
              Начать бесплатно
            </Link>
            <a
              href="https://t.me/aicombinernet_bot?start=website"
              target="_blank"
              onClick={() => trackTgClick("hero")}
              className="border border-white/10 hover:border-[#00FF00]/50 px-8 py-3.5 rounded-xl font-bold text-base transition-all hover:bg-white/5 text-gray-200"
            >
              Открыть в Telegram
            </a>
          </div>
        </div>

        {/* Мокап чата */}
        <div className="max-w-4xl mx-auto mt-16 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="bg-gradient-to-b from-white/[0.08] to-transparent rounded-2xl p-1">
            <div className="bg-[#0d0d14] rounded-xl border border-white/[0.08] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06]">
                <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                <div className="ml-3 text-xs text-gray-600 bg-white/[0.04] rounded-md px-3 py-0.5">
                  aicombiner.net/chat
                </div>
              </div>
              <div className="flex h-[360px]">
                <div className="w-48 border-r border-white/[0.06] p-3 hidden sm:block">
                  <div className="bg-[#00CC00]/15 border border-[#00CC00]/30 rounded-lg py-2 text-center text-sm text-[#00FF00] font-semibold mb-3">
                    + Новый чат
                  </div>
                  {["Квантовая запутанность", "Код на Python", "Рецепт борща", "Резюме статьи"].map((t) => (
                    <div key={t} className="px-2 py-1.5 text-xs text-gray-500 rounded-md mb-1 truncate hover:bg-white/5 cursor-pointer">
                      {t}
                    </div>
                  ))}
                </div>
                <div className="flex-1 p-4 flex flex-col justify-end gap-3">
                  <div className="self-end bg-[#00CC00] rounded-2xl rounded-br-md px-4 py-2.5 max-w-[70%] text-sm text-black font-medium">
                    Привет! Объясни квантовую запутанность простыми словами
                  </div>
                  <div className="self-start bg-white/[0.06] rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[80%] text-sm text-gray-300">
                    Представь две монеты, которые связаны невидимой нитью...
                  </div>
                  <div className="self-end bg-[#00CC00] rounded-2xl rounded-br-md px-4 py-2.5 max-w-[70%] text-sm text-black font-medium">
                    А как это используется в компьютерах?
                  </div>
                  <div className="self-start bg-white/[0.06] rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[80%] text-sm">
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
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-white">
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
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-[#00CC00]/60 hover:bg-white/[0.05] transition-all group"
              >
                <div className="mb-5 p-2.5 bg-[#00CC00]/10 rounded-xl w-fit group-hover:bg-[#00CC00]/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-bold text-base mb-2 text-white">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-white">
              Оплата по факту, без подписок
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Пополняете баланс — платите только за те токены, которые израсходовали.
              Нет ежемесячных платежей и скрытых тарифов.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Без подписки</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight text-white">$0</span>
                <span className="text-gray-600 text-sm">в месяц</span>
              </div>
              <p className="mt-4 text-sm text-gray-400">
                Нет ежемесячной платы и обязательного минимума — пополняете баланс,
                когда он заканчивается, и тратите только на свои запросы.
              </p>
            </div>

            <div className="rounded-2xl border border-[#00CC00]/60 bg-[#00CC00]/[0.04] p-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Пополнение баланса</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight text-white">от $5</span>
                <span className="text-gray-600 text-sm">любая сумма</span>
              </div>
              <p className="mt-4 text-sm text-gray-400">
                СБП, банковская карта или крипта. Деньги не сгорают и не сбрасываются — тратятся
                только на запросы, по фактическому расходу токенов.
              </p>
              <a href="/billing" className="mt-5 inline-block rounded-xl bg-[#00FF00] px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#00CC00]">
                Пополнить баланс
              </a>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Цены моделей — на странице <a href="/pricing" className="text-[#00CC00] hover:underline">Цены</a>.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 relative">
        <div className="hero-glow absolute inset-0 pointer-events-none" />
        <div className="max-w-2xl mx-auto text-center relative">
          <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-white">
            Готов попробовать?
          </h2>
          <p className="text-gray-500 mb-8">
            Пополнение от 5 $ — без подписки и обязательных платежей.
          </p>
          <Link
            href="/chat"
            className="inline-block bg-[#00FF00] text-black px-10 py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#00CC00]/25"
          >
            Начать бесплатно
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-5 md:gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Logo size={20} />
            AI Combiner © 2026
          </div>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-gray-600">
            <a href="/support" className="hover:text-gray-400 transition-colors py-1">Поддержка</a>
            <a href="/pricing" className="hover:text-gray-400 transition-colors py-1">Цены</a>
            <a href="/status" className="hover:text-gray-400 transition-colors py-1">Статус</a>
            <a href="/privacy" className="hover:text-gray-400 transition-colors py-1">Конфиденциальность</a>
            <a href="/terms" className="hover:text-gray-400 transition-colors py-1">Пользовательское соглашение</a>
            <a
              href="https://t.me/aicombinernet_bot?start=website"
              target="_blank"
              onClick={() => trackTgClick("footer")}
              className="hover:text-gray-400 transition-colors py-1"
            >
              Telegram
            </a>
          </nav>
          <div className="text-gray-600 text-center md:text-right">
            Служба поддержки: Telegram-бот @aicombinernet_bot, ответ в течение дня
          </div>
        </div>
      </footer>
    </main>
  );
}
