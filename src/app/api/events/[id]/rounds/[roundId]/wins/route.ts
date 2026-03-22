import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getEvent, saveEvent } from "@/lib/store";
import { calculateFan, calculateScore, calculatePayment, WinContext } from "@/lib/scoring";
import { validateHand } from "@/lib/hand-validator";
import { WinResult } from "@/lib/types";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; roundId: string }> }) {
  const { id, roundId } = await params;
  const event = await getEvent(id);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const round = event.rounds.find((r) => r.id === roundId);
  if (!round) return NextResponse.json({ error: "Round not found" }, { status: 404 });

  const body = await req.json();
  const { winnerId, tiles, photoUrl, winType, discarderId, kongCount = 0, isLastTile = false, isKongWin = false, isRobbingKong = false, isDealerFirstDraw = false, isFirstDraw = false } = body;

  // Check if player already won this round
  const alreadyWonCheck = round.wins.find((w) => w.winnerId === winnerId);
  if (alreadyWonCheck) {
    return NextResponse.json({ error: "You already won this round!", valid: false }, { status: 400 });
  }

  const validation = validateHand(tiles, kongCount);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.reason, valid: false }, { status: 400 });
  }

  const context: WinContext = { winType, isLastTile, isKongWin, isRobbingKong, isDealerFirstDraw, isFirstDraw };
  const fan = calculateFan(tiles, context);
  const totalFan = fan.reduce((sum, f) => sum + f.value, 0);

  // 平胡 (basic win with 0 fan) is allowed in standard Sichuan mahjong

  const alreadyWon = round.wins.map((w) => w.winnerId);
  const remainingPlayers = round.handsPlayed.filter((pid) => pid !== winnerId && !alreadyWon.includes(pid));
  const payment = calculatePayment(totalFan, event.baseScore, winType, remainingPlayers, discarderId);

  const winResult: WinResult = {
    id: nanoid(6),
    winnerId,
    tiles,
    photoUrl: photoUrl || "",
    fan,
    totalFan,
    score: calculateScore(totalFan, event.baseScore),
    winType,
    paidBy: payment.paidBy,
    pointsPerPayer: payment.pointsPerPayer,
  };

  round.wins.push(winResult);

  if (round.wins.length >= 3) {
    round.status = "completed";
  }

  await saveEvent(event);

  return NextResponse.json({ win: winResult, valid: true });
}
