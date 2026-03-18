import Anthropic from "@anthropic-ai/sdk";
import { RecognitionResult, Tile, PersonalityProfile, PointLedger, WinResult } from "./types";

const client = new Anthropic();

export async function recognizeTiles(imageBase64: string, mediaType: "image/jpeg" | "image/png" | "image/webp"): Promise<RecognitionResult> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: `You are analyzing a photo of a winning Sichuan mahjong (血战到底) hand.

Identify every mahjong tile visible in the photo. For each tile, determine:
- suit: "wan" (万/characters), "tiao" (条/bamboo), or "tong" (筒/dots)
- number: 1-9

Also count how many kongs (杠) are visible — groups of 4 identical tiles laid out together.

In Sichuan mahjong, a winning hand follows the 定缺 rule: it uses at most two suits (or one suit for 清一色).

Return ONLY valid JSON in this exact format, no other text:
{
  "tiles": [{"suit": "wan", "number": 1}, ...],
  "confidence": "high" | "medium" | "low",
  "kongs": 0
}

Order tiles by suit (tiao, tong, wan) then by number ascending.`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse tile recognition response");
  }

  const parsed = JSON.parse(jsonMatch[0]) as RecognitionResult;
  return parsed;
}

export async function generatePersonality(
  playerName: string,
  ledger: PointLedger,
  wins: WinResult[]
): Promise<PersonalityProfile> {
  const suitCounts = { wan: 0, tiao: 0, tong: 0 };
  let zimoCount = 0;
  let dianpaoCount = 0;
  const fanNames: string[] = [];

  for (const win of wins) {
    for (const tile of win.tiles) {
      suitCounts[tile.suit]++;
    }
    if (win.winType === "zimo") zimoCount++;
    else dianpaoCount++;
    for (const f of win.fan) {
      fanNames.push(f.name);
    }
  }

  const prompt = `You are writing fun, short personality profiles for mahjong players at a casual event.

Player: ${playerName}
Stats:
- Total points: ${ledger.totalPoints}
- Wins: ${ledger.wins}, Losses: ${ledger.losses}
- Biggest hand: ${ledger.biggestFan} fan
- Hands played: ${ledger.handsPlayed}
- Self-draw (自摸) wins: ${zimoCount}, Discard (点炮) wins: ${dianpaoCount}
- Suit usage: 万=${suitCounts.wan}, 条=${suitCounts.tiao}, 筒=${suitCounts.tong}
- Yaku achieved: ${fanNames.join(", ") || "none"}

Write a personality profile in this JSON format:
{
  "title": "Chinese nickname (2-4 chars)",
  "titleEn": "English translation",
  "description": "2-3 fun sentences about their play style. Mix Chinese mahjong terms with English. Be playful and specific to their stats."
}

Return ONLY the JSON, no other text.`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse personality response");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    playerId: ledger.playerId,
    playerName,
    ...parsed,
  };
}
