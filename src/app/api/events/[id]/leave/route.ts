import { NextRequest, NextResponse } from "next/server";
import { getEvent, saveEvent } from "@/lib/store";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const { playerId } = await req.json();

  const player = event.players.find((p) => p.id === playerId);
  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  // Remove from table but keep in event.players
  for (const table of event.tables) {
    table.playerIds = table.playerIds.filter((pid) => pid !== playerId);
  }
  player.tableId = "";

  await saveEvent(event);

  return NextResponse.json({ success: true });
}
