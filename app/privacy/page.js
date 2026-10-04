import Link from "next/link";
import Logo from "../../components/Logo";

export const metadata = {
  title: "Политика конфиденциальности — AI Combiner",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface-dark">
      <header className="border-b border-white/[0.06] sticky top-0 bg-surface-dark/90 backdrop-blur-xl z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="font-extrabold text-[15px] text-white">AI Combiner</span>
          </Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← На главную
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold text-white mb-2">Политика конфиденциальности</h1>
        <p className="text-gray-600 text-sm mb-10">Последнее обновление: 4 октября 2026</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Какие данные мы собираем</h2>
            <p className="mb-3">При использовании AI Combiner мы обрабатываем:</p>
            <ul className="list-disc ml-6 space-y-1.5 text-gray-400">
              <li><b className="text-gray-200">Аккаунт:</b> email и пароль (пароль хранится только в виде хэша) либо идентификатор Telegram при входе через Telegram.</li>
              <li><b className="text-gray-200">Историю чатов:</b> твои сообщения и ответы нейросетей — для отображения истории и работы контекста диалога.</li>
              <li><b className="text-gray-200">Технические данные:</b> IP-адрес, тип браузера и устройства, время доступа — для безопасности и аналитики.</li>
              <li><b className="text-gray-200">Данные биллинга:</b> тариф, остаток дневного баланса, история платежей. Реквизиты карт мы не получаем — платежи обрабатывает сторонний платёжный сервис.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Как мы используем данные</h2>
            <ul className="list-disc ml-6 space-y-1.5 text-gray-400">
              <li>Предоставление доступа к нейросетям и сохранение истории чатов.</li>
              <li>Учёт дневного баланса и обработка подписок.</li>
              <li>Защита от злоупотреблений: rate limiting, обнаружение автоматизированных запросов.</li>
              <li>Обезличённая аналитика сервиса — без cookies и сбора персональных данных.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Передача третьим лицам</h2>
            <p className="text-gray-400">
              Твои сообщения передаются сервисам-партнёрам, обеспечивающим работу нейросетей, исключительно для генерации ответа.
              Мы не продаём и не передаём персональные данные рекламодателям и брокерам данных.
              Платёжные данные обрабатывает платёжный провайдер по его политике безопасности.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Аналитика</h2>
            <p className="text-gray-400">
              Сайт использует собственную систему аналитики. Она не использует cookies
              и не собирает персональные данные: фиксируются только просмотры страниц,
              страна (по IP в обезличенном виде), браузер и ОС.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Хранение и удаление</h2>
            <p className="text-gray-400 mb-3">
              История чатов хранится, пока аккаунт активен. Ты можешь:
            </p>
            <ul className="list-disc ml-6 space-y-1.5 text-gray-400">
              <li>Удалить любой чат вручную в интерфейсе.</li>
              <li>Использовать временный чат — он автоматически удаляется через 24 часа.</li>
              <li>Запросить полное удаление аккаунта и всех данных — напиши в поддержку в Telegram.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Безопасность</h2>
            <p className="text-gray-400">
              Пароли хранятся в виде bcrypt-хэшей. Трафик защищён HTTPS.
              Доступ к базе данных ограничен сервером. Мы не храним платёжные реквизиты.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Изменения политики</h2>
            <p className="text-gray-400">
              Мы можем обновлять эту политику. Существенные изменения публикуются на этой странице
              с обновлением даты.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Контакты</h2>
            <p className="text-gray-400">
              Вопросы по конфиденциальности: <a href="https://t.me/aicombinernet_bot" className="text-[#00FF00] hover:underline">@aicombinernet_bot</a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
