"use client";

/**
 * Кабинет (Вариант 3): сайдбар-карточка + вкладки.
 * Табы: overview (Обзор) | security (Безопасность) | keys (API-ключи) | ref (Рефералы)
 * Данные профиля приходят из родителя. AuthMethods и Sessions — вложенные компоненты.
 */
import { useState } from "react";
import AuthMethods from "./AuthMethods";
import Sessions from "./Sessions";

const TIER_LABELS = { free: "Free", basic: "Basic", pro: "Pro", ultra: "Ultra" };

const TABS = [
  { id: "overview", label: "Обзор" },
  { id: "security", label: "Безопасность" },
  { id: "keys", label: "API-ключи" },
  { id: "ref", label: "Рефералы" },
];

export default function ProfileTabs({ profile, notify, logout, logoutAllDevices, children }) {
  const [tab, setTab] = useState("overview");

  const avatarChar = (profile.email || "?")[0].toUpperCase();
  const isTgAccount = (profile.email || "").includes("@users.aicombiner.net");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
      {/* ── Сайдбар: карточка аккаунта ── */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 lg:sticky lg:top-24">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-[#00FF00]/10 border-2 border-[#00FF00]/40 flex items-center justify-center text-[#00FF00] text-xl font-extrabold shrink-0">
            {avatarChar}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-white truncate">#{profile.id}</div>
            <span className="inline-block mt-1 text-[10px] uppercase tracking-wider bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30 rounded-full px-2 py-0.5">
              {TIER_LABELS[profile.tier] || profile.tier}
            </span>
          </div>
        </div>

        <div className="space-y-2 text-sm border-t border-white/[0.06] pt-4">
          <div className="flex justify-between gap-2 min-w-0">
            <span className="text-gray-500">Баланс</span>
            <span className="text-[#33FF33] font-semibold">${profile.daily_balance_usd.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-2 min-w-0">
            <span className="text-gray-500">С нами с</span>
            <span className="text-gray-300">{new Date(profile.created_at).toLocaleDateString("ru-RU")}</span>
          </div>
        </div>

        {/* Таб-навигация */}
        <nav className="mt-5 border-t border-white/[0.06] pt-4 space-y-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                tab === t.id
                  ? "bg-[#00FF00]/10 text-[#00FF00] font-medium"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="mt-5 border-t border-white/[0.06] pt-4 space-y-2">
          <button onClick={logout} className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-400 transition-colors">
            Выйти из аккаунта
          </button>
          <button
            onClick={logoutAllDevices}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-400 transition-colors"
          >
            Выйти со всех устройств
          </button>
        </div>
      </div>

      {/* ── Контент вкладок ── */}
      <div className="min-w-0">
        {tab === "overview" && <OverviewTab profile={profile} />}
        {tab === "security" && <SecurityTab notify={notify} />}
        {tab === "keys" && <KeysTab stats={profile.stats} />}
        {tab === "ref" && <RefTab profile={profile} />}
      </div>
    </div>
  );
}

/* ── Вкладка: Обзор ── */
function OverviewTab({ profile }) {
  return (
    <div className="space-y-6">
      <Section title="Баланс и подписка">
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <div className="text-4xl font-extrabold text-white">
              ${profile.daily_balance_usd.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              доступно сегодня · обновление в 00:00 МСК
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-wider bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30 rounded-full px-2.5 py-1">
            {TIER_LABELS[profile.tier] || profile.tier}
          </span>
        </div>
        {profile.subscription_expires && (
          <p className="text-xs text-gray-500 mb-3">
            Подписка действует до {new Date(profile.subscription_expires).toLocaleDateString("ru-RU")}
          </p>
        )}
        <a
          href="/#pricing"
          className="block w-full text-center bg-[#00FF00] hover:bg-[#00CC00] text-black rounded-xl py-2.5 font-bold text-sm transition-colors"
        >
          {profile.tier === "free" ? "Улучшить тариф" : "Сменить тариф"}
        </a>
      </Section>

      <Section title="Статистика">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-black/20 rounded-xl py-4">
            <div className="text-2xl font-extrabold text-white">{profile.stats.chats}</div>
            <div className="text-xs text-gray-500 mt-1">чатов</div>
          </div>
          <div className="bg-black/20 rounded-xl py-4">
            <div className="text-2xl font-extrabold text-white">{profile.stats.messages}</div>
            <div className="text-xs text-gray-500 mt-1">сообщений</div>
          </div>
          <div className="bg-black/20 rounded-xl py-4">
            <div className="text-2xl font-extrabold text-white">{profile.stats.api_keys}</div>
            <div className="text-xs text-gray-500 mt-1">API-ключей</div>
          </div>
        </div>
      </Section>

      <Section title="Аккаунт">
        <Row label="ID" value={`#${profile.id}`} mono />
        {profile.email && !profile.email.includes("@users.aicombiner.net") && (
          <Row label="Email" value={profile.email} />
        )}
        <Row label="Регистрация" value={new Date(profile.created_at).toLocaleDateString("ru-RU")} />
      </Section>
    </div>
  );
}

/* ── Вкладка: Безопасность ── */
function SecurityTab({ notify }) {
  return (
    <div className="space-y-6">
      <Section title="Способы входа">
        <p className="text-xs text-gray-500 mb-4">
          Привяжи несколько — входи любым удобным. Отвязать можно любой, кроме последнего.
        </p>
        <AuthMethods onNotify={notify} />
      </Section>

      <Section title="Активные сессии">
        <p className="text-xs text-gray-500 mb-4">
          Устройства, в которых выполнен вход. Завершение сессии выходит из аккаунта на этом устройстве.
        </p>
        <Sessions notify={notify} />
      </Section>
    </div>
  );
}

/* ── Вкладка: API-ключи ── */
function KeysTab({ stats }) {
  return (
    <div className="space-y-6">
      <Section title="API-ключи">
        <div className="flex items-center gap-5 mb-5">
          <div className="text-5xl font-extrabold text-white">{stats.api_keys}</div>
          <div className="text-sm text-gray-500">
            активных ключей.
            <br />
            Управление созданием, лимитами и моделями — на отдельной странице.
          </div>
        </div>
        <a
          href="/apikeys"
          className="block w-full text-center bg-[#00FF00] hover:bg-[#00CC00] text-black rounded-xl py-2.5 font-bold text-sm transition-colors"
        >
          Управлять API-ключами
        </a>
      </Section>

      <Section title="Как использовать">
        <ol className="space-y-2 text-sm text-gray-400 list-decimal list-inside">
          <li>Создай ключ на странице управления</li>
          <li>Отправляй запросы на <code className="text-[#33FF33]">aicombiner.net/api/v1/chat/completions</code> с заголовком <code className="text-[#33FF33]">Authorization: Bearer sk-...</code></li>
          <li>Списания идут с дневного баланса аккаунта</li>
        </ol>
      </Section>
    </div>
  );
}

/* ── Вкладка: Рефералы ── */
function RefTab({ profile }) {
  const [copied, setCopied] = useState(null);
  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <Section title="Твоя ссылка">
        <div className="space-y-3">
          <CopyRow
            label="Telegram-бот"
            value={profile.referral.link}
            copied={copied === "tg"}
            onCopy={() => copy(profile.referral.link, "tg")}
            btn="TG"
          />
          <CopyRow
            label="Сайт"
            value={`https://aicombiner.net/ref/${profile.referral.code}`}
            copied={copied === "web"}
            onCopy={() => copy(`https://aicombiner.net/ref/${profile.referral.code}`, "web")}
            btn="Web"
          />
        </div>
      </Section>

      <Section title="Статистика">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-black/20 rounded-xl py-4">
            <div className="text-2xl font-extrabold text-white">{profile.referral.referred_count}</div>
            <div className="text-xs text-gray-500 mt-1">приглашено</div>
          </div>
          <div className="bg-black/20 rounded-xl py-4">
            <div className="text-2xl font-extrabold text-[#00FF00]">{profile.referral.percent}%</div>
            <div className="text-xs text-gray-500 mt-1">с оплат — пожизненно</div>
          </div>
        </div>
        {profile.referral.referred_by && (
          <p className="text-xs text-gray-500 mt-3">Тебя пригласил: {profile.referral.referred_by}</p>
        )}
      </Section>

      <Section title="Как это работает">
        <ol className="space-y-2 text-sm text-gray-400 list-decimal list-inside">
          <li>Делишься ссылкой</li>
          <li>Друг регистрируется и пользуется</li>
          <li>Ты получаешь {profile.referral.percent}% с его оплат — постоянно</li>
        </ol>
      </Section>
    </div>
  );
}

/* ── Общие мелочи ── */
function Section({ title, children }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
      <h2 className="font-bold text-white mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-3 min-w-0">
      <span className="text-gray-500">{label}</span>
      <span className={`text-gray-200 ${mono ? "font-mono" : ""} truncate`}>{value}</span>
    </div>
  );
}

function CopyRow({ label, value, copied, onCopy, btn }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1.5">{label}</div>
      <div className="flex items-center gap-2 min-w-0">
        <code className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-[#33FF33] font-mono truncate">
          {value}
        </code>
        <button
          onClick={onCopy}
          className="bg-[#00FF00] hover:bg-[#00CC00] text-black rounded-lg px-3 py-2 text-xs font-bold transition-colors shrink-0"
        >
          {copied ? "✓" : btn}
        </button>
      </div>
    </div>
  );
}
