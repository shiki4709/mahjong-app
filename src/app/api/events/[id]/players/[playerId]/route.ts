import { NextRequest, NextResponse } from "next/server";
import { getEvent, saveEvent } from "@/lib/store";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; playerId: string }> }) {
  const { id, playerId } = await params;
  const event = await getEvent(id);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const url = new URL(req.url);
  const pin = url.searchParams.get("pin");
  if (pin !== event.hostPin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  event.players = event.players.filter((p) => p.id !== playerId);
  for (const table of event.tables) {
    table.playerIds = table.playerIds.filter((pid) => pid !== playerId);
  }
  await saveEvent(event);

  return NextResponse.json({ success: true });
}
