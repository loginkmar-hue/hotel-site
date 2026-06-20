import { NextResponse } from "next/server";
import { addBooking, findConflict } from "@/lib/bookingsStore";
import { getRoom } from "@/lib/roomsStore";
import { notifyNewBooking } from "@/lib/telegram";

type BookingPayload = {
  roomId?: string;
  roomName?: string;
  name?: string;
  phone?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  comment?: string;
};

export async function POST(req: Request) {
  let data: BookingPayload;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!data.name || !data.phone || !data.roomId) {
    return NextResponse.json(
      { ok: false, error: "Имя, телефон и номер обязательны" },
      { status: 400 },
    );
  }

  const room = await getRoom(data.roomId);
  if (!room) {
    return NextResponse.json({ ok: false, error: "Номер не найден" }, { status: 404 });
  }
  const roomName = data.roomName || room.name;

  // Защита от двойного бронирования: блокируем, только если пересекается с подтверждённой бронью.
  if (data.checkIn && data.checkOut) {
    const conflict = await findConflict(data.roomId, data.checkIn, data.checkOut, {
      statuses: ["confirmed"],
    });
    if (conflict) {
      return NextResponse.json(
        {
          ok: false,
          error: `Эти даты уже заняты (с ${conflict.checkIn} по ${conflict.checkOut}). Выберите другие.`,
        },
        { status: 409 },
      );
    }
  }

  const booking = await addBooking({
    roomId: data.roomId,
    roomName,
    name: String(data.name).trim(),
    phone: String(data.phone).trim(),
    checkIn: data.checkIn || "",
    checkOut: data.checkOut || "",
    guests: Number(data.guests) || 1,
    comment: data.comment ? String(data.comment).trim() : "",
  });

  // Telegram-уведомление (не блокирует ответ, ошибки игнорируются)
  notifyNewBooking(booking).catch(() => {});

  console.log("[BOOKING]", booking.id, booking.createdAt, booking.name, booking.phone);

  return NextResponse.json({ ok: true });
}
