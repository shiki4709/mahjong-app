import { MahjongEvent, PointLedger } from "./types";

export function computeLedger(event: MahjongEvent): PointLedger[] {
  const ledgers = new Map<string, PointLedger>();

  for (const player of event.players) {
    ledgers.set(player.id, {
      playerId: player.id,
      playerName: player.name,
      totalPoints: 0,
      wins: 0,
      losses: 0,
      biggestFan: 0,
      handsPlayed: 0,
    });
  }

  for (const round of event.rounds) {
    for (const pid of round.handsPlayed) {
      const l = ledgers.get(pid);
      if (l) l.handsPlayed++;
    }

    for (const win of round.wins) {
      const winner = ledgers.get(win.winnerId);
      if (winner) {
        winner.wins++;
        winner.totalPoints += win.pointsPerPayer * win.paidBy.length;
        if (win.totalFan > winner.biggestFan) winner.biggestFan = win.totalFan;
      }
      for (const payerId of win.paidBy) {
        const payer = ledgers.get(payerId);
        if (payer) {
          payer.losses++;
          payer.totalPoints -= win.pointsPerPayer;
        }
      }
    }

    for (const kong of round.kongEvents) {
      const declarer = ledgers.get(kong.playerId);
      if (declarer) declarer.totalPoints += kong.pointsPerPayer * kong.paidBy.length;
      for (const payerId of kong.paidBy) {
        const payer = ledgers.get(payerId);
        if (payer) payer.totalPoints -= kong.pointsPerPayer;
      }
    }
  }

  return Array.from(ledgers.values()).sort((a, b) => b.totalPoints - a.totalPoints || b.wins - a.wins);
}
