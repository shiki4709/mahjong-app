export interface Tile {
  suit: "wan" | "tiao" | "tong";
  number: number; // 1-9
}

export interface FanBreakdown {
  name: string;
  nameEn: string;
  value: number;
}

export interface WinResult {
  id: string;
  winnerId: string;
  tiles: Tile[];
  photoUrl: string;
  fan: FanBreakdown[];
  totalFan: number;
  score: number;
  winType: "zimo" | "dianpao";
  paidBy: string[];
  pointsPerPayer: number;
}

export interface KongEvent {
  id: string;
  playerId: string;
  kongType: "ming" | "an" | "bu";
  paidBy: string[];
  pointsPerPayer: number;
  timestamp: number;
}

export interface Round {
  id: string;
  tableId: string;
  status: "in_progress" | "completed" | "draw";
  wins: WinResult[];
  kongEvents: KongEvent[];
  handsPlayed: string[];
  timestamp: number;
}

export interface Player {
  id: string;
  name: string;
  tableId: string;
  joinedAt?: number; // timestamp when joined, used for score calculation
}

export interface Table {
  id: string;
  name: string;
  code: string; // unique join code for this table
  playerIds: string[];
}

export interface DepartedPlayer {
  id: string;
  name: string;
  departedAt: number;
}

export interface MahjongEvent {
  id: string;
  name: string;
  hostPin: string;
  baseScore: number;
  players: Player[];
  departedPlayers?: DepartedPlayer[];
  tables: Table[];
  rounds: Round[];
  status: "active" | "finished";
  createdAt: number;
}

export interface PointLedger {
  playerId: string;
  playerName: string;
  totalPoints: number;
  wins: number;
  losses: number;
  biggestFan: number;
  handsPlayed: number;
  gamesPlayed: number;   // completed rounds participated in
  avgPointsPerGame: number;
}

export interface PersonalityProfile {
  playerId: string;
  playerName: string;
  title: string;
  titleEn: string;
  description: string;
}

export interface RecognitionResult {
  tiles: Tile[];
  confidence: "high" | "medium" | "low";
  kongs: number;
}
