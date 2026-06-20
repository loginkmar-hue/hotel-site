import { getRooms } from "@/lib/roomsStore";
import { getBookings } from "@/lib/bookingsStore";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Админка — Гостиница" };

export default async function AdminPage() {
  const rooms = await getRooms();
  const bookings = await getBookings();
  return <AdminClient initialRooms={rooms} initialBookings={bookings} />;
}
