import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getEvent, saveEvent } from "@/lib/store";
import { KongEvent } from "@/lib/types";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; roundId: string }> }) {
  const { id, roundId } = await params;
  const event = await getEvent(id);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const round = event.rounds.find((r) => r.id === roundId);
  if (!round) return NextResponse.json({ error: "Round not found" }, { status: 404 });

  const { playerId, kongType, paidByIds } = await req.json();

  let pointsPerPayer: number;
  let paidBy: string[];

  if (kongType === "an") {
    const alreadyWon = round.wins.map((w) => w.winnerId);
    paidBy = round.handsPlayed.filter((pid) => pid !== playerId && !alreadyWon.includes(pid));
    pointsPerPayer = 2 * event.baseScore;
  } else {
    paidBy = paidByIds || [];
    pointsPerPayer = 1 * event.baseScore;
  }

  const kongEvent: KongEvent = {
    id: nanoid(6),
    playerId,
    kongType,
    paidBy,
    pointsPerPayer,
    timestamp: Date.now(),
  };

  round.kongEvents.push(kongEvent);
  await saveEvent(event);

  return NextResponse.json({ kong: kongEvent });
}
