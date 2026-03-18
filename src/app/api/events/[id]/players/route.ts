import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getEvent, saveEvent } from "@/lib/store";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "Player name is required" }, { status: 400 });

  const player = { id: nanoid(6), name, tableId: "" };
  event.players.push(player);
  await saveEvent(event);

  return NextResponse.json({ player });
}
