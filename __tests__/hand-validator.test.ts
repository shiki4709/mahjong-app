import { validateHand, ValidationResult } from "@/lib/hand-validator";
import { Tile } from "@/lib/types";

describe("validateHand", () => {
  test("valid hand with two suits passes", () => {
    const tiles: Tile[] = [
      { suit: "wan", number: 1 }, { suit: "wan", number: 2 }, { suit: "wan", number: 3 },
      { suit: "wan", number: 4 }, { suit: "wan", number: 5 }, { suit: "wan", number: 6 },
      { suit: "tiao", number: 1 }, { suit: "tiao", number: 2 }, { suit: "tiao", number: 3 },
      { suit: "tiao", number: 4 }, { suit: "tiao", number: 5 }, { suit: "tiao", number: 6 },
      { suit: "wan", number: 9 }, { suit: "wan", number: 9 },
    ];
    const result = validateHand(tiles);
    expect(result.valid).toBe(true);
  });

  test("rejects hand with three suits", () => {
    const tiles: Tile[] = [
      { suit: "wan", number: 1 }, { suit: "wan", number: 2 }, { suit: "wan", number: 3 },
      { suit: "tiao", number: 1 }, { suit: "tiao", number: 2 }, { suit: "tiao", number: 3 },
      { suit: "tong", number: 1 }, { suit: "tong", number: 2 }, { suit: "tong", number: 3 },
      { suit: "wan", number: 7 }, { suit: "wan", number: 8 }, { suit: "wan", number: 9 },
      { suit: "wan", number: 5 }, { suit: "wan", number: 5 },
    ];
    const result = validateHand(tiles);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("定缺");
  });

  test("accepts single suit hand (清一色)", () => {
    const tiles: Tile[] = [
      { suit: "wan", number: 1 }, { suit: "wan", number: 2 }, { suit: "wan", number: 3 },
      { suit: "wan", number: 4 }, { suit: "wan", number: 5 }, { suit: "wan", number: 6 },
      { suit: "wan", number: 7 }, { suit: "wan", number: 8 }, { suit: "wan", number: 9 },
      { suit: "wan", number: 1 }, { suit: "wan", number: 2 }, { suit: "wan", number: 3 },
      { suit: "wan", number: 5 }, { suit: "wan", number: 5 },
    ];
    const result = validateHand(tiles);
    expect(result.valid).toBe(true);
  });

  test("rejects wrong tile count", () => {
    const tiles: Tile[] = [
      { suit: "wan", number: 1 }, { suit: "wan", number: 2 }, { suit: "wan", number: 3 },
    ];
    const result = validateHand(tiles);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("tile");
  });

  test("accepts 15 tiles with 1 kong", () => {
    const tiles: Tile[] = [
      { suit: "wan", number: 1 }, { suit: "wan", number: 1 }, { suit: "wan", number: 1 }, { suit: "wan", number: 1 },
      { suit: "wan", number: 3 }, { suit: "wan", number: 4 }, { suit: "wan", number: 5 },
      { suit: "tiao", number: 1 }, { suit: "tiao", number: 2 }, { suit: "tiao", number: 3 },
      { suit: "tiao", number: 7 }, { suit: "tiao", number: 8 }, { suit: "tiao", number: 9 },
      { suit: "wan", number: 9 }, { suit: "wan", number: 9 },
    ];
    const result = validateHand(tiles, 1);
    expect(result.valid).toBe(true);
  });

  test("rejects invalid structure (no valid decomposition)", () => {
    const tiles: Tile[] = [
      { suit: "wan", number: 1 }, { suit: "wan", number: 1 }, { suit: "wan", number: 2 },
      { suit: "wan", number: 2 }, { suit: "wan", number: 3 }, { suit: "wan", number: 4 },
      { suit: "wan", number: 4 }, { suit: "wan", number: 5 }, { suit: "wan", number: 6 },
      { suit: "wan", number: 6 }, { suit: "wan", number: 7 }, { suit: "wan", number: 8 },
      { suit: "tiao", number: 1 }, { suit: "tiao", number: 3 },
    ];
    const result = validateHand(tiles);
    expect(result.valid).toBe(false);
  });

  test("accepts seven pairs", () => {
    const tiles: Tile[] = [
      { suit: "wan", number: 1 }, { suit: "wan", number: 1 },
      { suit: "wan", number: 3 }, { suit: "wan", number: 3 },
      { suit: "wan", number: 5 }, { suit: "wan", number: 5 },
      { suit: "tiao", number: 2 }, { suit: "tiao", number: 2 },
      { suit: "tiao", number: 4 }, { suit: "tiao", number: 4 },
      { suit: "tiao", number: 6 }, { suit: "tiao", number: 6 },
      { suit: "tiao", number: 8 }, { suit: "tiao", number: 8 },
    ];
    const result = validateHand(tiles);
    expect(result.valid).toBe(true);
  });
});
