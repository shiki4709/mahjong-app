import { Tile } from "./types";

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

function canDecompose(counts: Map<string, number>, suits: string[]): boolean {
  for (const [key, count] of counts) {
    if (count < 2) continue;
    const remaining = new Map(counts);
    remaining.set(key, count - 2);
    if (remaining.get(key) === 0) remaining.delete(key);
    if (canFormSets(remaining, suits)) return true;
  }
  return false;
}

function canFormSets(counts: Map<string, number>, suits: string[]): boolean {
  let firstKey: string | null = null;
  for (const [key, count] of counts) {
    if (count > 0) { firstKey = key; break; }
  }
  if (!firstKey) return true;

  const [suit, numStr] = firstKey.split("-");
  const num = parseInt(numStr);
  const count = counts.get(firstKey)!;

  // Try kong (4 of a kind as a single set)
  if (count >= 4) {
    const next = new Map(counts);
    next.set(firstKey, count - 4);
    if (next.get(firstKey) === 0) next.delete(firstKey);
    if (canFormSets(next, suits)) return true;
  }

  if (count >= 3) {
    const next = new Map(counts);
    next.set(firstKey, count - 3);
    if (next.get(firstKey) === 0) next.delete(firstKey);
    if (canFormSets(next, suits)) return true;
  }

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
    if (canFormSets(next, suits)) return true;
  }

  return false;
}

function isSevenPairs(counts: Map<string, number>): boolean {
  const values = Array.from(counts.values());
  return (
    values.every((c) => c === 2 || c === 4) &&
    values.reduce((sum, c) => sum + Math.floor(c / 2), 0) === 7
  );
}

export function validateHand(tiles: Tile[], kongCount: number = 0): ValidationResult {
  const expectedCount = 14 + kongCount;

  if (tiles.length !== expectedCount) {
    return {
      valid: false,
      reason: `Expected ${expectedCount} tiles (14 + ${kongCount} kongs), but found ${tiles.length} tiles.`,
    };
  }

  const suits = [...new Set(tiles.map((t) => t.suit))];
  if (suits.length > 2) {
    return {
      valid: false,
      reason: `Tiles from all three suits detected (${suits.join(", ")}). 定缺 requires dropping one suit.`,
    };
  }

  const counts = new Map<string, number>();
  for (const tile of tiles) {
    const key = `${tile.suit}-${tile.number}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  // Check no tile appears more than 4 times (only 4 copies exist in mahjong)
  for (const [key, count] of counts) {
    if (count > 4) {
      const [suit, num] = key.split("-");
      const suitNames: Record<string, string> = { wan: "万", tiao: "条", tong: "筒" };
      return {
        valid: false,
        reason: `${count}× ${num}${suitNames[suit] || suit} detected — only 4 copies of each tile exist. The AI may have misread a tile. Try fixing the tiles manually.`,
      };
    }
  }

  const validStructure = isSevenPairs(counts) || canDecompose(counts, suits);
  if (!validStructure) {
    return {
      valid: false,
      reason: "These tiles can't form 4 sets + 1 pair (or 7 pairs). A tile may have been misread — try tapping 'Fix tiles' to correct them.",
    };
  }

  return { valid: true };
}
