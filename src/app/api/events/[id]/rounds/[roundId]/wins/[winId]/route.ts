import { NextRequest, NextResponse } from "next/server";
import { getEvent, saveEvent } from "@/lib/store";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; roundId: string; winId: string }> }) {
  const { id, roundId, winId } = await params;
  const event = await getEvent(id);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const url = new URL(req.url);
  const pin = url.searchParams.get("pin");
  if (pin !== event.hostPin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const round = event.rounds.find((r) => r.id === roundId);
  if (!round) return NextResponse.json({ error: "Round not found" }, { status: 404 });

  round.wins = round.wins.filter((w) => w.id !== winId);
  await saveEvent(event);

  return NextResponse.json({ success: true });
}
