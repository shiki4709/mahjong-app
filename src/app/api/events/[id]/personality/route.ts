import { NextRequest, NextResponse } from "next/server";
import { getEvent } from "@/lib/store";
import { generatePersonality } from "@/lib/ai";
import { computeLedger } from "@/lib/ledger";
import { PersonalityProfile } from "@/lib/types";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const ledgers = computeLedger(event);
  const profiles: PersonalityProfile[] = [];

  for (const ledger of ledgers) {
    const playerWins = event.rounds.flatMap((r) => r.wins.filter((w) => w.winnerId === ledger.playerId));
    const profile = await generatePersonality(ledger.playerName, ledger, playerWins);
    profiles.push(profile);
  }

  return NextResponse.json({ profiles, ledgers });
}
