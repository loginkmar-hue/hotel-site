import { NextResponse } from "next/server";
import {
  deleteBooking,
  updateBookingStatus,
  getBooking,
  findConflict,
  type BookingStatus,
} from "@/lib/bookingsStore";

const ALLOWED: BookingStatus[] = ["new", "confirmed", "completed", "cancelled"];

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }
  const status = body.status as BookingStatus;
  if (!status || !ALLOWED.includes(status)) {
    return NextResponse.json({ ok: false, error: "Неверный статус" }, { status: 400 });
  }

  // При подтверждении — проверяем, что номер не занят на эти даты другой подтверждённой бронью
  if (status === "confirmed") {
    const current = await getBooking(params.id);
    if (current && current.checkIn && current.checkOut) {
      const conflict = await findConflict(current.roomId, current.checkIn, current.checkOut, {
        excludeId: current.id,
        statuses: ["confirmed"],
      });
      if (conflict) {
        return NextResponse.json(
          {
            ok: false,
            error: `Конфликт: на эти даты уже подтверждена бронь «${conflict.name}» (${conflict.checkIn}–${conflict.checkOut}).`,
          },
          { status: 409 },
        );
      }
    }
  }

  const updated = await updateBookingStatus(params.id, status);
  if (!updated) return NextResponse.json({ ok: false, error: "Не найдено" }, { status: 404 });
  return NextResponse.json({ ok: true, booking: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const ok = await deleteBooking(params.id);
  if (!ok) return NextResponse.json({ ok: false, error: "Не найдено" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
