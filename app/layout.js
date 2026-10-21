import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

import Script from "next/script";

export const metadata = {
  metadataBase: new URL('https://aicombiner.net'),
  title: {
    default: 'AI Combiner — нейросети в Telegram, Discord и браузере',
    template: '%s | AI Combiner',
  },
  description: 'Доступ к GLM, DeepSeek, Claude, GPT и 90+ моделям через Telegram, Discord и веб-чат. Бесплатный тариф, оплата по факту.',
  keywords: ['AI Combiner', 'нейросети', 'ИИ чат', 'GLM', 'DeepSeek', 'Claude', 'GPT', 'бесплатный ИИ', 'нейросеть онлайн', 'ИИ телеграм бот'],
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://aicombiner.net',
    siteName: 'AI Combiner',
    title: 'AI Combiner — нейросети в Telegram, Discord и браузере',
    description: '90+ ИИ-моделей в одном чате. Telegram-бот, Discord-бот и веб. Бесплатный дневной баланс.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Combiner — нейросети в одном чате',
    description: '90+ ИИ-моделей: Telegram, Discord, веб. Бесплатный тариф.',
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className="dark">
      <head>
        <link rel="icon" href="/favicon16.svg" sizes="any" type="image/svg+xml" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <script
          defer
          src="https://stats.aicombiner.net/script.js"
          data-website-id="ec84b85d-15d0-458a-ac86-f124532d2c30"
        ></script>
      </head>
      <body>{children}      <Script
        src="https://stats.aicombiner.net/recorder.js"
        data-website-id="ec84b85d-15d0-458a-ac86-f124532d2c30"
        strategy="afterInteractive"
      />
    </body>
    </html>
  );
}
