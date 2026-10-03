import { NextResponse } from "next/server";

const API_URL = process.env.API_BASE_URL || "http://localhost:8000";

export async function POST(request) {
  try {
    const body = await request.json();

    // Проксирую запрос к API-ядру
    const response = await fetch(`${API_URL}/chats/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Токен юзера из cookies
        ...(request.cookies.get("access_token") && {
          Authorization: `Bearer ${request.cookies.get("access_token").value}`,
        }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Ошибка сервера" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Сервер недоступен" },
      { status: 502 }
    );
  }
}
