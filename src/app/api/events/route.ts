import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { saveEvent } from "@/lib/store";
import { MahjongEvent } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, baseScore = 1 } = body;

  if (!name) {
    return NextResponse.json({ error: "Event name is required" }, { status: 400 });
  }

  const event: MahjongEvent = {
    id: nanoid(8),
    name,
    hostPin: nanoid(4),
    baseScore,
    players: [],
    tables: [],
    rounds: [],
    status: "active",
    createdAt: Date.now(),
  };

  await saveEvent(event);
  return NextResponse.json({ event });
}
