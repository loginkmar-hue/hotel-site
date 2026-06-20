import { sql } from "@vercel/postgres";

export type BookingStatus = "new" | "confirmed" | "completed" | "cancelled";

export type Booking = {
  id: string;
  createdAt: string;
  roomId: string;
  roomName: string;
  name: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  comment: string;
  status: BookingStatus;
};

let schemaReady: Promise<void> | null = null;
function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        room_id TEXT NOT NULL,
        room_name TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        check_in TEXT NOT NULL DEFAULT '',
        check_out TEXT NOT NULL DEFAULT '',
        guests INTEGER NOT NULL DEFAULT 1,
        comment TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'new'
      );
    `.then(() => undefined);
  }
  return schemaReady;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToBooking(row: any): Booking {
  return {
    id: row.id,
    createdAt: new Date(row.created_at).toISOString(),
    roomId: row.room_id,
    roomName: row.room_name,
    name: row.name,
    phone: row.phone,
    checkIn: row.check_in,
    checkOut: row.check_out,
    guests: Number(row.guests),
    comment: row.comment,
    status: row.status as BookingStatus,
  };
}

// Автоматически закрываем подтверждённые брони, у которых дата выезда уже прошла.
async function autoComplete(): Promise<void> {
  await sql`
    UPDATE bookings SET status = 'completed'
    WHERE status = 'confirmed'
      AND check_out <> ''
      AND check_out < to_char(now(), 'YYYY-MM-DD')
  `;
}

export async function getBookings(): Promise<Booking[]> {
  await ensureSchema();
  await autoComplete();
  const { rows } = await sql`SELECT * FROM bookings ORDER BY created_at DESC`;
  return rows.map(rowToBooking);
}

function newId(): string {
  return `bk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export type BookingInput = Omit<Booking, "id" | "createdAt" | "status">;

export async function addBooking(input: BookingInput): Promise<Booking> {
  await ensureSchema();
  const id = newId();
  const { rows } = await sql`
    INSERT INTO bookings (id, room_id, room_name, name, phone, check_in, check_out, guests, comment, status)
    VALUES (
      ${id}, ${input.roomId}, ${input.roomName}, ${input.name}, ${input.phone},
      ${input.checkIn}, ${input.checkOut}, ${input.guests}, ${input.comment}, 'new'
    )
    RETURNING *
  `;
  return rowToBooking(rows[0]);
}

// Возвращает заявку, чьи даты пересекаются с переданными, либо null.
export async function findConflict(
  roomId: string,
  checkIn: string,
  checkOut: string,
  options: { excludeId?: string; statuses?: BookingStatus[] } = {},
): Promise<Booking | null> {
  if (!checkIn || !checkOut) return null;
  await ensureSchema();
  const statuses = options.statuses || ["confirmed"];
  const excludeId = options.excludeId ?? null;

  const { rows } = await sql`
    SELECT * FROM bookings
    WHERE room_id = ${roomId}
      AND status = ANY(${statuses})
      AND check_in <> '' AND check_out <> ''
      AND check_in < ${checkOut} AND check_out > ${checkIn}
      AND (${excludeId}::text IS NULL OR id <> ${excludeId})
    LIMIT 1
  `;
  return rows[0] ? rowToBooking(rows[0]) : null;
}

// Занятые периоды (для публичного отображения и календаря).
export async function getBusyRanges(
  roomId?: string,
): Promise<Array<Pick<Booking, "id" | "roomId" | "roomName" | "checkIn" | "checkOut" | "name" | "status">>> {
  await ensureSchema();
  await autoComplete();

  const { rows } = roomId
    ? await sql`
        SELECT * FROM bookings
        WHERE (status = 'confirmed' OR status = 'new')
          AND check_in <> '' AND check_out <> ''
          AND room_id = ${roomId}
      `
    : await sql`
        SELECT * FROM bookings
        WHERE (status = 'confirmed' OR status = 'new')
          AND check_in <> '' AND check_out <> ''
      `;

  return rows.map(rowToBooking).map((b) => ({
    id: b.id,
    roomId: b.roomId,
    roomName: b.roomName,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    name: b.name,
    status: b.status,
  }));
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
): Promise<Booking | null> {
  await ensureSchema();
  const { rows } = await sql`
    UPDATE bookings SET status = ${status} WHERE id = ${id} RETURNING *
  `;
  return rows[0] ? rowToBooking(rows[0]) : null;
}

export async function getBooking(id: string): Promise<Booking | null> {
  await ensureSchema();
  const { rows } = await sql`SELECT * FROM bookings WHERE id = ${id}`;
  return rows[0] ? rowToBooking(rows[0]) : null;
}

export async function deleteBooking(id: string): Promise<boolean> {
  await ensureSchema();
  const result = await sql`DELETE FROM bookings WHERE id = ${id}`;
  return (result.rowCount ?? 0) > 0;
}
