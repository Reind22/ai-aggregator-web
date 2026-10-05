"use client";

/**
 * Обёртка над fetch с автоматическим обновлением access-токена.
 *
 * Логика: если запрос вернул 401 (токен истёк), молча меняем refresh-токен
 * на новую пару, сохраняем её и повторяем исходный запрос. Пользователь
 * ничего не замечает. Если и refresh недействителен — чистим хранилище
 * и отправляем на страницу входа.
 */

const API_BASE = "/api";

let refreshPromise = null; // защита от параллельных обновлений

function getToken() {
  return localStorage.getItem("ai_token");
}

function setTokens(access, refresh) {
  if (access) localStorage.setItem("ai_token", access);
  if (refresh) localStorage.setItem("ai_refresh_token", refresh);
}

function clearTokens() {
  localStorage.removeItem("ai_token");
  localStorage.removeItem("ai_refresh_token");
  localStorage.removeItem("tg_oidc_state");
}

async function doRefresh() {
  const refreshToken = localStorage.getItem("ai_refresh_token");
  if (!refreshToken) return null;

  // Если обновление уже идёт — ждём его, не дублируем запросы
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) {
        clearTokens();
        return null;
      }
      const data = await res.json();
      setTokens(data.access_token, data.refresh_token);
      return data.access_token;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Запрос к API с автообновлением токена.
 * @param {string} path — путь после /api, например "/chats/send"
 * @param {object} options — { method, body, headers, auth }
 */
export async function apiFetch(path, options = {}) {
  const { method = "GET", body, headers = {}, auth = true } = options;

  const buildHeaders = (token) => {
    const h = { "Content-Type": "application/json", ...headers };
    if (auth && token) h["Authorization"] = `Bearer ${token}`;
    return h;
  };

  const doRequest = (token) =>
    fetch(`${API_BASE}${path}`, {
      method,
      headers: buildHeaders(token),
      body: body ? JSON.stringify(body) : undefined,
    });

  let token = auth ? getToken() : null;
  let res = await doRequest(token);

  // Токен истёк — пробуем обновить и повторить один раз
  if (res.status === 401 && auth) {
    const newToken = await doRefresh();
    if (newToken) {
      res = await doRequest(newToken);
    } else {
      // Сессия окончательно истекла
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
      return res;
    }
  }

  return res;
}

/** Выход с текущего устройства: отзываем refresh на сервере и чистим хранилище. */
export async function logout() {
  const refreshToken = localStorage.getItem("ai_refresh_token");
  try {
    if (refreshToken) {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    }
  } finally {
    clearTokens();
  }
}

/** Выход со всех устройств. */
export async function logoutAll() {
  try {
    await apiFetch("/auth/logout-all", { method: "POST" });
  } finally {
    clearTokens();
  }
}

export { getToken, setTokens, clearTokens };
