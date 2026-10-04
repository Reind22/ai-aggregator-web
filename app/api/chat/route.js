import { NextResponse } from "next/server";

const API_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000";

export async function POST(request) {
  try {
    const body = await request.json();
    const res = await fetch(`${API_URL}/chats/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("authorization")
          ? { Authorization: request.headers.get("authorization") }
          : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ detail: "API недоступен" }, { status: 502 });
  }
}
