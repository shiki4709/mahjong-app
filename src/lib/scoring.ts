import { Tile, FanBreakdown } from "./types";

export interface WinContext {
  winType: "zimo" | "dianpao";
  isLastTile: boolean;
  isKongWin: boolean;
  isRobbingKong: boolean;
  isDealerFirstDraw: boolean;
  isFirstDraw: boolean;
}

/** Count occurrences of each tile */
function countTiles(tiles: Tile[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const tile of tiles) {
    const key = `${tile.suit}-${tile.number}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

/** Check if hand is all one suit (清一色) */
function isFlush(tiles: Tile[]): boolean {
  const suits = new Set(tiles.map((t) => t.suit));
  return suits.size === 1;
}

/** Check if hand is seven pairs (七对) */
function isSevenPairs(tiles: Tile[]): boolean {
  if (tiles.length !== 14) return false;
  const counts = countTiles(tiles);
  const values = Array.from(counts.values());
  return values.every((c) => c === 2 || c === 4) && values.reduce((sum, c) => sum + Math.floor(c / 2), 0) === 7;
}

interface TileSet {
  type: "triplet" | "sequence" | "kong" | "pair";
  tiles: Tile[];
}

function findDecompositions(counts: Map<string, number>, sets: TileSet[]): TileSet[][] {
  let firstKey: string | null = null;
  for (const [key, count] of counts) {
    if (count > 0) { firstKey = key; break; }
  }
  if (!firstKey) return [sets];

  const [suit, numStr] = firstKey.split("-");
  const num = parseInt(numStr);
  const count = counts.get(firstKey)!;
  const results: TileSet[][] = [];

  // Try pair (only if we don't already have one)
  if (count >= 2 && !sets.some((s) => s.type === "pair")) {
    const next = new Map(counts);
    next.set(firstKey, count - 2);
    if (next.get(firstKey) === 0) next.delete(firstKey);
    const tile: Tile = { suit: suit as Tile["suit"], number: num };
    results.push(...findDecompositions(next, [...sets, { type: "pair", tiles: [tile, tile] }]));
  }

  // Try kong (4 of a kind)
  if (count >= 4) {
    const next = new Map(counts);
    next.set(firstKey, count - 4);
    if (next.get(firstKey) === 0) next.delete(firstKey);
    const tile: Tile = { suit: suit as Tile["suit"], number: num };
    results.push(...findDecompositions(next, [...sets, { type: "kong", tiles: [tile, tile, tile, tile] }]));
  }

  // Try triplet
  if (count >= 3) {
    const next = new Map(counts);
    next.set(firstKey, count - 3);
    if (next.get(firstKey) === 0) next.delete(firstKey);
    const tile: Tile = { suit: suit as Tile["suit"], number: num };
    results.push(...findDecompositions(next, [...sets, { type: "triplet", tiles: [tile, tile, tile] }]));
  }

  // Try sequence
  const key2 = `${suit}-${num + 1}`;
  const key3 = `${suit}-${num + 2}`;
  if (counts.has(key2) && counts.has(key3)) {
    const next = new Map(counts);
    next.set(firstKey, count - 1);
    next.set(key2, next.get(key2)! - 1);
    next.set(key3, next.get(key3)! - 1);
    if (next.get(firstKey) === 0) next.delete(firstKey);
    if (next.get(key2) === 0) next.delete(key2);
    if (next.get(key3) === 0) next.delete(key3);
    const tiles: Tile[] = [
      { suit: suit as Tile["suit"], number: num },
      { suit: suit as Tile["suit"], number: num + 1 },
      { suit: suit as Tile["suit"], number: num + 2 },
    ];
    results.push(...findDecompositions(next, [...sets, { type: "sequence", tiles }]));
  }

  return results;
}

function isAllTripletsDecomposition(sets: TileSet[]): boolean {
  return sets.every((s) => s.type === "triplet" || s.type === "kong" || s.type === "pair");
}

function hasTerminalsInEverySetDecomposition(sets: TileSet[]): boolean {
  return sets.every((s) => s.tiles.some((t) => t.number === 1 || t.number === 9));
}

function countGen(tiles: Tile[]): number {
  const counts = countTiles(tiles);
  let gen = 0;
  for (const count of counts.values()) {
    if (count === 4) gen++;
  }
  return gen;
}

export function calculateFan(tiles: Tile[], context: WinContext): FanBreakdown[] {
  const fan: FanBreakdown[] = [];
  const counts = countTiles(tiles);

  const decompositions = isSevenPairs(tiles) ? [] : findDecompositions(counts, []);

  if (context.winType === "zimo") {
    fan.push({ name: "自摸", nameEn: "Self-draw", value: 1 });
  }

  if (context.isKongWin) {
    fan.push({ name: "杠上开花", nameEn: "Win off Kong", value: 1 });
  }

  if (context.isRobbingKong) {
    fan.push({ name: "杠上炮", nameEn: "Robbing a Kong", value: 1 });
  }

  if (isFlush(tiles)) {
    fan.push({ name: "清一色", nameEn: "Flush", value: 2 });
  }

  if (isSevenPairs(tiles)) {
    fan.push({ name: "七对", nameEn: "Seven Pairs", value: 2 });
  }

  const allTripletsDecomp = decompositions.find(isAllTripletsDecomposition);
  if (!isSevenPairs(tiles) && allTripletsDecomp) {
    fan.push({ name: "对对胡", nameEn: "All Triplets", value: 1 });

    const pairCount = allTripletsDecomp.filter((s) => s.type === "pair").length;
    const setCount = allTripletsDecomp.filter((s) => s.type === "triplet" || s.type === "kong").length;
    if (pairCount === 1 && setCount === 4) {
      fan.push({ name: "金钩钓", nameEn: "Golden Hook", value: 2 });
    }
  }

  const terminalDecomp = decompositions.find(hasTerminalsInEverySetDecomposition);
  if (terminalDecomp) {
    fan.push({ name: "带幺九", nameEn: "All Terminals", value: 1 });
  }

  const genCount = countGen(tiles);
  for (let i = 0; i < genCount; i++) {
    fan.push({ name: "根", nameEn: "Gen (4 of a kind)", value: 1 });
  }

  if (context.isLastTile) {
    fan.push({ name: "海底捞月", nameEn: "Last Tile", value: 1 });
  }

  if (context.isDealerFirstDraw) {
    fan.push({ name: "天胡", nameEn: "Heavenly Hand", value: 4 });
  }

  if (context.isFirstDraw && !context.isDealerFirstDraw) {
    fan.push({ name: "地胡", nameEn: "Earthly Hand", value: 4 });
  }

  return fan;
}

export function calculateScore(totalFan: number, baseScore: number): number {
  return baseScore * Math.pow(2, totalFan);
}

export function calculatePayment(
  totalFan: number,
  baseScore: number,
  winType: "zimo" | "dianpao",
  remainingPlayerIds: string[],
  discarderId?: string
): { paidBy: string[]; pointsPerPayer: number } {
  const score = calculateScore(totalFan, baseScore);

  if (winType === "zimo") {
    return { paidBy: remainingPlayerIds, pointsPerPayer: score };
  } else {
    return { paidBy: discarderId ? [discarderId] : [], pointsPerPayer: score };
  }
}
