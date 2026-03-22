import { NextRequest, NextResponse } from "next/server";
import { getEvent, saveEvent } from "@/lib/store";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; playerId: string }> }) {
  const { id, playerId } = await params;
  const event = await getEvent(id);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const url = new URL(req.url);
  const pin = url.searchParams.get("pin");

  // Allow host (with pin) or the player themselves (player-leave)
  const isHost = pin === event.hostPin;
  const isSelfLeave = pin === "player-leave";

  if (!isHost && !isSelfLeave) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const player = event.players.find((p) => p.id === playerId);
  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  // Move to departedPlayers so their scores stay on the leaderboard
  if (!event.departedPlayers) event.departedPlayers = [];
  event.departedPlayers.push({
    id: player.id,
    name: player.name,
    departedAt: Date.now(),
  });

  // Remove from active players and table
  event.players = event.players.filter((p) => p.id !== playerId);
  for (const table of event.tables) {
    table.playerIds = table.playerIds.filter((pid) => pid !== playerId);
  }
  await saveEvent(event);

  return NextResponse.json({ success: true });
}
