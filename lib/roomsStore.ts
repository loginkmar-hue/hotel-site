import { sql } from "@vercel/postgres";

export type Room = {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  size: number;
  image: string;
  features: string[];
};

// Создаём таблицу при первом обращении (один раз за «холодный старт» функции).
let schemaReady: Promise<void> | null = null;
function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = sql`
      CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price INTEGER NOT NULL,
        capacity INTEGER NOT NULL,
        size INTEGER NOT NULL,
        image TEXT NOT NULL,
        features JSONB NOT NULL DEFAULT '[]'
      );
    `.then(() => undefined);
  }
  return schemaReady;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToRoom(row: any): Room {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    capacity: Number(row.capacity),
    size: Number(row.size),
    image: row.image,
    features: Array.isArray(row.features)
      ? row.features
      : JSON.parse(row.features || "[]"),
  };
}

export async function getRooms(): Promise<Room[]> {
  await ensureSchema();
  const { rows } = await sql`SELECT * FROM rooms ORDER BY name`;
  return rows.map(rowToRoom);
}

export async function getRoom(id: string): Promise<Room | undefined> {
  await ensureSchema();
  const { rows } = await sql`SELECT * FROM rooms WHERE id = ${id}`;
  return rows[0] ? rowToRoom(rows[0]) : undefined;
}

function slugify(s: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
    и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
    с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
    ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  return s
    .toLowerCase()
    .split("")
    .map((c) => (map[c] !== undefined ? map[c] : c))
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "room";
}

function uniqueId(base: string, existing: Room[]): string {
  let id = base;
  let i = 2;
  while (existing.some((r) => r.id === id)) {
    id = `${base}-${i++}`;
  }
  return id;
}

export type RoomInput = Omit<Room, "id"> & { id?: string };

export async function addRoom(input: RoomInput): Promise<Room> {
  await ensureSchema();
  const existing = await getRooms();

  let id: string;
  if (input.id?.trim()) {
    id = input.id.trim();
    if (existing.some((r) => r.id === id)) {
      throw new Error("Номер с таким ID уже существует");
    }
  } else {
    id = uniqueId(slugify(input.name), existing);
  }

  const room: Room = {
    id,
    name: input.name,
    description: input.description,
    price: Number(input.price),
    capacity: Number(input.capacity),
    size: Number(input.size),
    image: input.image,
    features: input.features,
  };

  await sql`
    INSERT INTO rooms (id, name, description, price, capacity, size, image, features)
    VALUES (
      ${room.id}, ${room.name}, ${room.description}, ${room.price},
      ${room.capacity}, ${room.size}, ${room.image}, ${JSON.stringify(room.features)}
    )
  `;
  return room;
}

export async function updateRoom(
  id: string,
  patch: Partial<RoomInput>,
): Promise<Room | null> {
  await ensureSchema();
  const current = await getRoom(id);
  if (!current) return null;

  const updated: Room = {
    ...current,
    ...(patch as Partial<Room>),
    id: current.id,
    price: patch.price !== undefined ? Number(patch.price) : current.price,
    capacity: patch.capacity !== undefined ? Number(patch.capacity) : current.capacity,
    size: patch.size !== undefined ? Number(patch.size) : current.size,
  };

  await sql`
    UPDATE rooms SET
      name = ${updated.name},
      description = ${updated.description},
      price = ${updated.price},
      capacity = ${updated.capacity},
      size = ${updated.size},
      image = ${updated.image},
      features = ${JSON.stringify(updated.features)}
    WHERE id = ${id}
  `;
  return updated;
}

export async function deleteRoom(id: string): Promise<boolean> {
  await ensureSchema();
  const result = await sql`DELETE FROM rooms WHERE id = ${id}`;
  return (result.rowCount ?? 0) > 0;
}
