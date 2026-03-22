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

  // Check if requesting a single player profile
  let body: { playerId?: string } = {};
  try {
    body = await req.json();
  } catch {
    // No body — generate all profiles (legacy behavior)
  }

  if (body.playerId) {
    // Single player profile
    const ledger = ledgers.find((l) => l.playerId === body.playerId);
    if (!ledger) return NextResponse.json({ error: "Player not found" }, { status: 404 });

    const playerWins = event.rounds.flatMap((r) => r.wins.filter((w) => w.winnerId === body.playerId));
    const profile = await generatePersonality(ledger.playerName.replace(" (left)", ""), ledger, playerWins);
    return NextResponse.json({ profile, ledger });
  }

  // All profiles (for end-of-event summary)
  const profiles: PersonalityProfile[] = [];
  for (const ledger of ledgers) {
    const playerWins = event.rounds.flatMap((r) => r.wins.filter((w) => w.winnerId === ledger.playerId));
    const profile = await generatePersonality(ledger.playerName.replace(" (left)", ""), ledger, playerWins);
    profiles.push(profile);
  }

  return NextResponse.json({ profiles, ledgers });
}
