import { NextRequest, NextResponse } from "next/server";
import { getEvent, saveEvent, mapTableCodeToEvent } from "@/lib/store";
import { Table } from "@/lib/types";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const url = new URL(req.url);
  const pin = url.searchParams.get("pin");
  if (pin !== event.hostPin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { tables } = (await req.json()) as { tables: Table[] };
  event.tables = tables;

  for (const table of tables) {
    for (const playerId of table.playerIds) {
      const player = event.players.find((p) => p.id === playerId);
      if (player) player.tableId = table.id;
    }
    // Map table code to event ID for lookup
    if (table.code) {
      await mapTableCodeToEvent(table.code, id);
    }
  }

  await saveEvent(event);
  return NextResponse.json({ tables: event.tables });
}
