import { NextResponse } from "next/server";
import { addRoom, getRooms } from "@/lib/roomsStore";

export async function GET() {
  return NextResponse.json({ ok: true, rooms: await getRooms() });
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }
  const errors = validateInput(body);
  if (errors) return NextResponse.json({ ok: false, error: errors }, { status: 400 });
  try {
    const room = await addRoom({
      id: body.id,
      name: body.name,
      description: body.description,
      price: Number(body.price),
      capacity: Number(body.capacity),
      size: Number(body.size),
      image: body.image,
      features: Array.isArray(body.features) ? body.features : [],
    });
    return NextResponse.json({ ok: true, room });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Ошибка";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}

function validateInput(b: any): string | null {
  if (!b || typeof b !== "object") return "Неверный формат";
  if (!b.name || String(b.name).trim().length < 2) return "Укажите название (мин. 2 символа)";
  if (!b.description) return "Укажите описание";
  if (!b.image) return "Укажите ссылку на фото";
  if (Number(b.price) <= 0) return "Цена должна быть положительной";
  if (Number(b.capacity) < 1) return "Минимум 1 гость";
  if (Number(b.size) <= 0) return "Площадь должна быть положительной";
  return null;
}
