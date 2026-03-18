import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getEvent, saveEvent } from "@/lib/store";
import { Round } from "@/lib/types";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const { tableId, playerIds } = await req.json();

  const round: Round = {
    id: nanoid(8),
    tableId,
    status: "in_progress",
    wins: [],
    kongEvents: [],
    handsPlayed: playerIds || [],
    timestamp: Date.now(),
  };

  event.rounds.push(round);
  await saveEvent(event);

  return NextResponse.json({ round });
}
