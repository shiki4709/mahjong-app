import { MahjongEvent, PointLedger } from "./types";

export function computeLedger(event: MahjongEvent, tableId?: string): PointLedger[] {
  const ledgers = new Map<string, PointLedger>();

  // Build a name lookup for all known players (active + departed)
  const nameMap = new Map<string, string>();
  for (const p of event.players) {
    nameMap.set(p.id, p.name);
  }
  for (const dp of event.departedPlayers || []) {
    if (!nameMap.has(dp.id)) {
      nameMap.set(dp.id, dp.name);
    }
  }

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

  // Resolve a player's display name — check active, departed, fallback to "Unknown"
  function resolveName(id: string, departed: boolean): string {
    const name = nameMap.get(id) || "Unknown";
    return departed ? `${name} (left)` : name;
  }

  // Filter rounds by table if specified
  const rounds = tableId
    ? event.rounds.filter((r) => r.tableId === tableId)
    : event.rounds;

  // Collect all player IDs who participated in these rounds
  const roundPlayerIds = new Set<string>();
  for (const round of rounds) {
    for (const pid of round.handsPlayed) roundPlayerIds.add(pid);
    for (const win of round.wins) {
      roundPlayerIds.add(win.winnerId);
      for (const payerId of win.paidBy) roundPlayerIds.add(payerId);
    }
    for (const kong of round.kongEvents) {
      roundPlayerIds.add(kong.playerId);
      for (const payerId of kong.paidBy) roundPlayerIds.add(payerId);
    }
  }

  // Add active players (filtered by table if specified)
  const activePlayers = tableId
    ? event.players.filter((p) => p.tableId === tableId)
    : event.players;

  for (const player of activePlayers) {
    ensurePlayer(player.id, player.name);
  }

  // Add any player who participated in these rounds but isn't currently
  // at this table (departed or switched tables) — use their real name
  const activeIds = new Set(activePlayers.map((p) => p.id));
  for (const pid of roundPlayerIds) {
    if (!activeIds.has(pid)) {
      const isDeparted = !event.players.some((p) => p.id === pid);
      ensurePlayer(pid, resolveName(pid, isDeparted));
    }
  }

  // If no table filter, also add departed players who may not have rounds
  if (!tableId) {
    for (const dp of event.departedPlayers || []) {
      ensurePlayer(dp.id, `${dp.name} (left)`);
    }
  }

  // Compute scores from rounds
  for (const round of rounds) {
    const isCompleted = round.status === "completed" || round.status === "draw";

    for (const pid of round.handsPlayed) {
      const l = ledgers.get(pid);
      if (l) {
        l.handsPlayed++;
        if (isCompleted) l.gamesPlayed++;
      }
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

  // Compute average points per game
  for (const l of ledgers.values()) {
    l.avgPointsPerGame = l.gamesPlayed > 0
      ? Math.round((l.totalPoints / l.gamesPlayed) * 10) / 10
      : 0;
  }

  // Sort by average points per game, then total points as tiebreaker
  return Array.from(ledgers.values()).sort(
    (a, b) => b.avgPointsPerGame - a.avgPointsPerGame || b.totalPoints - a.totalPoints
  );
}
