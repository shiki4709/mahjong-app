import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getEvent, saveEvent } from "@/lib/store";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const { tableCode, playerName } = await req.json();

  if (!playerName?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (!tableCode?.trim()) {
    return NextResponse.json({ error: "Table code is required" }, { status: 400 });
  }

  // Find table by code
  const table = event.tables.find((t) => t.code === tableCode.trim().toUpperCase());
  if (!table) {
    return NextResponse.json({ error: "Invalid table code" }, { status: 404 });
  }

  // Check if already an active player with this name
  const existing = event.players.find((p) => p.name.toLowerCase() === playerName.trim().toLowerCase());
  if (existing) {
    return NextResponse.json({ error: "Name already taken", player: existing }, { status: 409 });
  }

  // Check table capacity (max 4)
  if (table.playerIds.length >= 4) {
    return NextResponse.json({ error: "Table is full (max 4 players)" }, { status: 400 });
  }

  // Check if this is a returning player (same name in departedPlayers)
  // Restore their original ID so scores carry over
  const departedIdx = (event.departedPlayers || []).findIndex(
    (dp) => dp.name.toLowerCase() === playerName.trim().toLowerCase()
  );

  let player;
  if (departedIdx >= 0) {
    const departed = event.departedPlayers![departedIdx];
    // Restore with original ID — scores follow the player
    player = { id: departed.id, name: playerName.trim(), tableId: table.id, joinedAt: Date.now() };
    // Remove from departed list
    event.departedPlayers!.splice(departedIdx, 1);
  } else {
    // Brand new player
    player = { id: nanoid(6), name: playerName.trim(), tableId: table.id, joinedAt: Date.now() };
  }

  event.players.push(player);
  table.playerIds.push(player.id);
  await saveEvent(event);

  return NextResponse.json({ player, table: { id: table.id, name: table.name }, returning: departedIdx >= 0 });
}
