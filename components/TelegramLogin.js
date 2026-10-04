"use client";

import { useEffect, useRef } from "react";

/**
 * Telegram Login Widget — программная загрузка.
 * React не исполняет <script> внутри JSX, поэтому вставляем тег вручную.
 */
export default function TelegramLogin({ botName, onAuth }) {
  const containerRef = useRef(null);
  const callbackName = "onTelegramAuth_" + Math.random().toString(36).slice(2);

  useEffect(() => {
    // Глобальный колбэк с уникальным именем
    window[callbackName] = (user) => onAuth(user);

    // Убираю старый скрипт, если перерисовка
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "10");
    script.setAttribute("data-onauth", `${callbackName}(user)`);
    script.setAttribute("data-request-access", "write");
    containerRef.current.appendChild(script);

    return () => {
      delete window[callbackName];
    };
  }, [botName, onAuth, callbackName]);

  return <div ref={containerRef} className="flex justify-center min-h-[40px]" />;
}
