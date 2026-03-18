import { computeLedger } from "@/lib/ledger";
import { MahjongEvent } from "@/lib/types";

describe("computeLedger", () => {
  const baseEvent: MahjongEvent = {
    id: "test", name: "Test", hostPin: "1234", baseScore: 1,
    players: [
      { id: "p1", name: "Alice", tableId: "t1" },
      { id: "p2", name: "Bob", tableId: "t1" },
      { id: "p3", name: "Charlie", tableId: "t1" },
      { id: "p4", name: "Dave", tableId: "t1" },
    ],
    tables: [], rounds: [], status: "active", createdAt: 0,
  };

  test("empty event returns zero-initialized ledgers", () => {
    const ledgers = computeLedger(baseEvent);
    expect(ledgers).toHaveLength(4);
    expect(ledgers[0].totalPoints).toBe(0);
    expect(ledgers[0].wins).toBe(0);
  });

  test("zimo win: all remaining players pay", () => {
    const event = {
      ...baseEvent,
      rounds: [{
        id: "r1", tableId: "t1", status: "completed" as const,
        wins: [{
          id: "w1", winnerId: "p1", tiles: [], photoUrl: "", fan: [],
          totalFan: 2, score: 4, winType: "zimo" as const,
          paidBy: ["p2", "p3", "p4"], pointsPerPayer: 4,
        }],
        kongEvents: [], handsPlayed: ["p1", "p2", "p3", "p4"], timestamp: 0,
      }],
    };
    const ledgers = computeLedger(event);
    const alice = ledgers.find((l) => l.playerId === "p1")!;
    const bob = ledgers.find((l) => l.playerId === "p2")!;
    expect(alice.totalPoints).toBe(12);
    expect(alice.wins).toBe(1);
    expect(bob.totalPoints).toBe(-4);
    expect(bob.losses).toBe(1);
  });

  test("kong events affect points", () => {
    const event = {
      ...baseEvent,
      rounds: [{
        id: "r1", tableId: "t1", status: "completed" as const, wins: [],
        kongEvents: [{
          id: "k1", playerId: "p1", kongType: "an" as const,
          paidBy: ["p2", "p3", "p4"], pointsPerPayer: 2, timestamp: 0,
        }],
        handsPlayed: ["p1", "p2", "p3", "p4"], timestamp: 0,
      }],
    };
    const ledgers = computeLedger(event);
    const alice = ledgers.find((l) => l.playerId === "p1")!;
    expect(alice.totalPoints).toBe(6);
  });
});
