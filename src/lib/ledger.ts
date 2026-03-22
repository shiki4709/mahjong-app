import { MahjongEvent, PointLedger } from "./types";

export function computeLedger(event: MahjongEvent): PointLedger[] {
  const ledgers = new Map<string, PointLedger>();

  function ensurePlayer(id: string, name: string) {
    if (!ledgers.has(id)) {
      ledgers.set(id, {
        playerId: id,
        playerName: name,
        totalPoints: 0,
        wins: 0,
        losses: 0,
        biggestFan: 0,
        handsPlayed: 0,
        gamesPlayed: 0,
        avgPointsPerGame: 0,
      });
    }
  }

  // Active players
  for (const player of event.players) {
    ensurePlayer(player.id, player.name);
  }

  // Departed players — scores stay on the leaderboard
  for (const dp of event.departedPlayers || []) {
    ensurePlayer(dp.id, `${dp.name} (left)`);
  }

  for (const round of event.rounds) {
    // Track games played: each player in handsPlayed participated in this round
    const isCompleted = round.status === "completed" || round.status === "draw";

    for (const pid of round.handsPlayed) {
      const l = ledgers.get(pid);
      if (l) {
        l.handsPlayed++;
        if (isCompleted) l.gamesPlayed++;
      }
    }

    for (const win of round.wins) {
      // Ensure departed players who have wins still get counted
      if (!ledgers.has(win.winnerId)) {
        ensurePlayer(win.winnerId, "Unknown");
      }
      const winner = ledgers.get(win.winnerId)!;
      winner.wins++;
      winner.totalPoints += win.pointsPerPayer * win.paidBy.length;
      if (win.totalFan > winner.biggestFan) winner.biggestFan = win.totalFan;

      for (const payerId of win.paidBy) {
        if (!ledgers.has(payerId)) {
          ensurePlayer(payerId, "Unknown");
        }
        const payer = ledgers.get(payerId)!;
        payer.losses++;
        payer.totalPoints -= win.pointsPerPayer;
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

  // Compute average points per game
  for (const l of ledgers.values()) {
    l.avgPointsPerGame = l.gamesPlayed > 0
      ? Math.round((l.totalPoints / l.gamesPlayed) * 10) / 10
      : 0;
  }

  // Sort by average points per game (the fairest ranking), then total points as tiebreaker
  return Array.from(ledgers.values()).sort(
    (a, b) => b.avgPointsPerGame - a.avgPointsPerGame || b.totalPoints - a.totalPoints
  );
}
