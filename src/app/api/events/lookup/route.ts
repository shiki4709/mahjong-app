import { NextRequest, NextResponse } from "next/server";
import { getEventIdByTableCode } from "@/lib/store";

export async function POST(req: NextRequest) {
  const { tableCode } = await req.json();

  if (!tableCode?.trim()) {
    return NextResponse.json({ error: "Table code is required" }, { status: 400 });
  }

  const eventId = await getEventIdByTableCode(tableCode.trim().toUpperCase());

  if (!eventId) {
    return NextResponse.json({ error: "No table found with that code. Check with your host." }, { status: 404 });
  }

  return NextResponse.json({ eventId });
}
