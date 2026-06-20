import { NextResponse } from "next/server";
import { getBookings } from "@/lib/bookingsStore";

export async function GET() {
  return NextResponse.json({ ok: true, bookings: await getBookings() });
}
