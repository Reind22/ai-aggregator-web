import "./globals.css";

export const metadata = {
  title: "AI Aggregator — нейросети в Telegram, Discord и браузере",
  description:
    "Доступ к GLM, DeepSeek и другим моделям через Telegram, Discord и веб-чат. Бесплатный тариф.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className="dark">
      <body>{children}</body>
    </html>
  );
}
