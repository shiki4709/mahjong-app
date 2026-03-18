import { NextRequest, NextResponse } from "next/server";
import { getEvent, saveEvent } from "@/lib/store";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; roundId: string }> }) {
  const { id, roundId } = await params;
  const event = await getEvent(id);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const round = event.rounds.find((r) => r.id === roundId);
  if (!round) return NextResponse.json({ error: "Round not found" }, { status: 404 });

  const { status } = await req.json();
  if (status === "completed" || status === "draw") {
    round.status = status;
    await saveEvent(event);
  }

  return NextResponse.json({ round });
}
