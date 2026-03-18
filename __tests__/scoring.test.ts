import { calculateFan, calculateScore } from "@/lib/scoring";
import { Tile } from "@/lib/types";

const BASE_CTX = { winType: "dianpao" as const, isLastTile: false, isKongWin: false, isRobbingKong: false, isDealerFirstDraw: false, isFirstDraw: false };
const ZIMO_CTX = { ...BASE_CTX, winType: "zimo" as const };

describe("calculateFan", () => {
  test("清一色 (flush) — all one suit", () => {
    const tiles: Tile[] = [
      { suit: "wan", number: 1 }, { suit: "wan", number: 2 }, { suit: "wan", number: 3 },
      { suit: "wan", number: 4 }, { suit: "wan", number: 5 }, { suit: "wan", number: 6 },
      { suit: "wan", number: 7 }, { suit: "wan", number: 8 }, { suit: "wan", number: 9 },
      { suit: "wan", number: 1 }, { suit: "wan", number: 2 }, { suit: "wan", number: 3 },
      { suit: "wan", number: 5 }, { suit: "wan", number: 5 },
    ];
    const result = calculateFan(tiles, ZIMO_CTX);
    const names = result.map((f) => f.name);
    expect(names).toContain("清一色");
  });

  test("对对胡 (all triplets)", () => {
    const tiles: Tile[] = [
      { suit: "wan", number: 1 }, { suit: "wan", number: 1 }, { suit: "wan", number: 1 },
      { suit: "wan", number: 3 }, { suit: "wan", number: 3 }, { suit: "wan", number: 3 },
      { suit: "tiao", number: 5 }, { suit: "tiao", number: 5 }, { suit: "tiao", number: 5 },
      { suit: "tiao", number: 7 }, { suit: "tiao", number: 7 }, { suit: "tiao", number: 7 },
      { suit: "wan", number: 9 }, { suit: "wan", number: 9 },
    ];
    const result = calculateFan(tiles, ZIMO_CTX);
    const names = result.map((f) => f.name);
    expect(names).toContain("对对胡");
  });

  test("七对 (seven pairs)", () => {
    const tiles: Tile[] = [
      { suit: "wan", number: 1 }, { suit: "wan", number: 1 },
      { suit: "wan", number: 3 }, { suit: "wan", number: 3 },
      { suit: "wan", number: 5 }, { suit: "wan", number: 5 },
      { suit: "tiao", number: 2 }, { suit: "tiao", number: 2 },
      { suit: "tiao", number: 4 }, { suit: "tiao", number: 4 },
      { suit: "tiao", number: 6 }, { suit: "tiao", number: 6 },
      { suit: "tiao", number: 8 }, { suit: "tiao", number: 8 },
    ];
    const result = calculateFan(tiles, BASE_CTX);
    const names = result.map((f) => f.name);
    expect(names).toContain("七对");
  });

  test("自摸 adds +1 fan", () => {
    const tiles: Tile[] = [
      { suit: "wan", number: 1 }, { suit: "wan", number: 2 }, { suit: "wan", number: 3 },
      { suit: "wan", number: 4 }, { suit: "wan", number: 5 }, { suit: "wan", number: 6 },
      { suit: "tiao", number: 1 }, { suit: "tiao", number: 2 }, { suit: "tiao", number: 3 },
      { suit: "tiao", number: 4 }, { suit: "tiao", number: 5 }, { suit: "tiao", number: 6 },
      { suit: "wan", number: 9 }, { suit: "wan", number: 9 },
    ];
    const resultZimo = calculateFan(tiles, ZIMO_CTX);
    const resultDianpao = calculateFan(tiles, BASE_CTX);
    const zimoTotal = resultZimo.reduce((sum, f) => sum + f.value, 0);
    const dianpaoTotal = resultDianpao.reduce((sum, f) => sum + f.value, 0);
    expect(zimoTotal).toBe(dianpaoTotal + 1);
  });

  test("根 (gen) — 4 of a kind counts as +1", () => {
    const tiles: Tile[] = [
      { suit: "wan", number: 1 }, { suit: "wan", number: 1 }, { suit: "wan", number: 1 }, { suit: "wan", number: 1 },
      { suit: "wan", number: 3 }, { suit: "wan", number: 4 }, { suit: "wan", number: 5 },
      { suit: "tiao", number: 1 }, { suit: "tiao", number: 2 }, { suit: "tiao", number: 3 },
      { suit: "tiao", number: 7 }, { suit: "tiao", number: 8 }, { suit: "tiao", number: 9 },
      { suit: "wan", number: 9 }, { suit: "wan", number: 9 },
    ];
    const result = calculateFan(tiles, BASE_CTX);
    const gen = result.find((f) => f.name === "根");
    expect(gen).toBeDefined();
    expect(gen!.value).toBe(1);
  });

  test("天胡 (heavenly hand)", () => {
    const tiles: Tile[] = [
      { suit: "wan", number: 1 }, { suit: "wan", number: 2 }, { suit: "wan", number: 3 },
      { suit: "wan", number: 4 }, { suit: "wan", number: 5 }, { suit: "wan", number: 6 },
      { suit: "tiao", number: 1 }, { suit: "tiao", number: 2 }, { suit: "tiao", number: 3 },
      { suit: "tiao", number: 4 }, { suit: "tiao", number: 5 }, { suit: "tiao", number: 6 },
      { suit: "wan", number: 9 }, { suit: "wan", number: 9 },
    ];
    const result = calculateFan(tiles, { ...ZIMO_CTX, isDealerFirstDraw: true });
    const names = result.map((f) => f.name);
    expect(names).toContain("天胡");
  });
});

describe("calculateScore", () => {
  test("base 1, 2 fan = 4 points", () => {
    expect(calculateScore(2, 1)).toBe(4);
  });

  test("base 1, 0 fan = 1 point", () => {
    expect(calculateScore(0, 1)).toBe(1);
  });

  test("base 2, 3 fan = 16 points", () => {
    expect(calculateScore(3, 2)).toBe(16);
  });
});
