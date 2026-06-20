import { NextResponse } from "next/server";
import { deleteRoom, updateRoom, getRoom } from "@/lib/roomsStore";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }
  if (!(await getRoom(params.id))) {
    return NextResponse.json({ ok: false, error: "Номер не найден" }, { status: 404 });
  }
  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) patch.name = String(body.name);
  if (body.description !== undefined) patch.description = String(body.description);
  if (body.image !== undefined) patch.image = String(body.image);
  if (body.price !== undefined) patch.price = Number(body.price);
  if (body.capacity !== undefined) patch.capacity = Number(body.capacity);
  if (body.size !== undefined) patch.size = Number(body.size);
  if (Array.isArray(body.features)) patch.features = body.features;

  if (patch.price !== undefined && (patch.price as number) <= 0)
    return NextResponse.json({ ok: false, error: "Цена должна быть положительной" }, { status: 400 });
  if (patch.capacity !== undefined && (patch.capacity as number) < 1)
    return NextResponse.json({ ok: false, error: "Минимум 1 гость" }, { status: 400 });
  if (patch.size !== undefined && (patch.size as number) <= 0)
    return NextResponse.json({ ok: false, error: "Площадь должна быть положительной" }, { status: 400 });

  const room = await updateRoom(params.id, patch as any);
  return NextResponse.json({ ok: true, room });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const ok = await deleteRoom(params.id);
  if (!ok) return NextResponse.json({ ok: false, error: "Номер не найден" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
