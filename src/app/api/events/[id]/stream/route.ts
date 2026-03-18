import { NextRequest, NextResponse } from "next/server";
import { getEvent } from "@/lib/store";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  return NextResponse.json({ event, timestamp: Date.now() });
}
