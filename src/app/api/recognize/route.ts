import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { recognizeTiles } from "@/lib/ai";
import { validateHand } from "@/lib/hand-validator";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("photo") as File;

  if (!file) {
    return NextResponse.json({ error: "No photo provided" }, { status: 400 });
  }

  const blob = await put(`hands/${Date.now()}-${file.name}`, file, { access: "public" });

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const mediaType = file.type as "image/jpeg" | "image/png" | "image/webp";

  try {
    const result = await recognizeTiles(base64, mediaType);
    const validation = validateHand(result.tiles, result.kongs);

    return NextResponse.json({
      ...result,
      photoUrl: blob.url,
      validation,
    });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to recognize tiles. Please try again or use manual input.",
      photoUrl: blob.url,
    }, { status: 422 });
  }
}
