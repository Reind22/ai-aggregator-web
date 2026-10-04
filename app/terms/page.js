import Link from "next/link";
import Logo from "../../components/Logo";

export const metadata = {
  title: "Пользовательское соглашение — AI Combiner",
};

export default function TermsPage() {
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
        <h1 className="text-3xl font-extrabold text-white mb-2">Пользовательское соглашение</h1>
        <p className="text-gray-600 text-sm mb-10">Последнее обновление: 4 октября 2026</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Предмет соглашения</h2>
            <p className="text-gray-400">
              AI Combiner — сервис доступа к нейросетевым моделям (GLM, DeepSeek и другие) через
              веб-интерфейс, Telegram-бота, Discord-бота и API. Регистрируясь, ты соглашаешься
              с этим соглашением.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Аккаунт</h2>
            <ul className="list-disc ml-6 space-y-1.5 text-gray-400">
              <li>Один человек — один аккаунт. Мультиаккаунтинг для обхода лимитов запрещён.</li>
              <li>Ты отвечаешь за сохранность пароля и API-ключей.</li>
              <li>Передача аккаунта третьим лицам не допускается.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Тарифы и оплата</h2>
            <ul className="list-disc ml-6 space-y-1.5 text-gray-400">
              <li>Каждый тариф включает <b className="text-gray-200">дневной баланс в долларах США</b>, списываемый по стоимости обработки запросов.</li>
              <li>Неизрасходованный остаток дня <b className="text-gray-200">не переносится</b> на следующий день.</li>
              <li>Подписка действует оплаченный период. Возвраты — по запросу в поддержку в течение 14 дней, если сервис не оказан.</li>
              <li>Цены могут меняться; для действующих подписок цена сохраняется до конца оплаченного периода.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Правила использования</h2>
            <p className="mb-3 text-gray-400">Запрещено:</p>
            <ul className="list-disc ml-6 space-y-1.5 text-gray-400">
              <li>Генерация незаконного контента: призывы к насилию, терроризму, изготовлению оружия и наркотиков, детская эксплуатация (CSAM).</li>
              <li>Массовые автоматизированные запросы вне API (скрейпинг, боты, накрутка).</li>
              <li>Попытки взлома инфраструктуры, обход лимитов, доступ к чужим данным.</li>
              <li>Использование сервиса для спама, фишинга и мошенничества.</li>
            </ul>
            <p className="mt-3 text-gray-400">
              Нарушение ведёт к ограничению или удалению аккаунта без возврата средств
              (по решению администрации, соразмерно нарушению).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Ответственность за контент</h2>
            <p className="text-gray-400">
              Ответы нейросетей генерируются автоматически и могут содержать ошибки.
              Ты сам responsible за проверку важной информации (медицина, право, финансы).
              Мы не несём ответственности за решения, принятые на основе ответов AI.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. API</h2>
            <ul className="list-disc ml-6 space-y-1.5 text-gray-400">
              <li>API-ключи выдаются бесплатно, до 50 штук на аккаунт.</li>
              <li>Не публикуй ключи в открытом виде. Утёкший ключ мы можем отключить.</li>
              <li>Лимиты запросов зависят от тарифа и указаны на странице тарифов.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Доступность сервиса</h2>
            <p className="text-gray-400">
              Мы стремимся к стабильной работе, но не гарантируем непрерывность:
              возможны перерывы из-за технических работ или сбоев провайдера моделей.
              О плановых остановках сообщаем в Telegram-боте.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Расторжение</h2>
            <p className="text-gray-400">
              Ты можешь удалить аккаунт в любой момент. Мы можем ограничить доступ
              при нарушении правил — с уведомлением на email или в Telegram.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Изменение условий</h2>
            <p className="text-gray-400">
              Актуальная версия соглашения всегда на этой странице. Продолжая пользоваться
              сервисом после изменений, ты принимаешь новую редакцию.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Контакты</h2>
            <p className="text-gray-400">
              Вопросы: <a href="https://t.me/aicombinernet_bot" className="text-[#00FF00] hover:underline">@aicombinernet_bot</a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
