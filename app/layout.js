import "./globals.css";

export const metadata = {
  title: "AI Combiner — нейросети в Telegram, Discord и браузере",
  description:
    "Доступ к GLM, DeepSeek и другим моделям через Telegram, Discord и веб-чат. Бесплатный тариф.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className="dark">
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <script
          defer
          src="https://stats.aicombiner.net/script.js"
          data-website-id="ec84b85d-15d0-458a-ac86-f124532d2c30"
        ></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
