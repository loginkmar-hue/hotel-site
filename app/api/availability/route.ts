import { NextResponse } from "next/server";
import { getBusyRanges, findConflict } from "@/lib/bookingsStore";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const roomId = url.searchParams.get("roomId") || undefined;
  const checkIn = url.searchParams.get("checkIn");
  const checkOut = url.searchParams.get("checkOut");

  // Точечная проверка пересечения, если переданы даты
  if (roomId && checkIn && checkOut) {
    const conflict = await findConflict(roomId, checkIn, checkOut, { statuses: ["confirmed"] });
    return NextResponse.json({
      ok: true,
      available: !conflict,
      conflict: conflict
        ? { checkIn: conflict.checkIn, checkOut: conflict.checkOut }
        : null,
    });
  }

  // Список занятых интервалов (только confirmed — для публики)
  const ranges = (await getBusyRanges(roomId))
    .filter((r) => r.status === "confirmed")
    .map((r) => ({ checkIn: r.checkIn, checkOut: r.checkOut }));
  return NextResponse.json({ ok: true, ranges });
}
