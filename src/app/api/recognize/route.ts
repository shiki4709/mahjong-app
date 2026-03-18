import { NextRequest, NextResponse } from "next/server";
import { recognizeTiles } from "@/lib/ai";
import { validateHand } from "@/lib/hand-validator";

const useMemoryBlob = !process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN === "your-blob-token";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("photo") as File;

  if (!file) {
    return NextResponse.json({ error: "No photo provided" }, { status: 400 });
  }

  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Photo is too large (max 10MB). Try taking a lower resolution photo." }, { status: 400 });
  }

  let photoUrl = "";

  if (useMemoryBlob) {
    photoUrl = `local://hands/${Date.now()}-${file.name}`;
  } else {
    try {
      const { put } = await import("@vercel/blob");
      const blob = await put(`hands/${Date.now()}-${file.name}`, file, { access: "public" });
      photoUrl = blob.url;
    } catch (blobError) {
      // Blob upload failed — continue without photo URL
      console.error("Blob upload failed:", blobError);
      photoUrl = "";
    }
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");

  // Determine media type, default to jpeg
  let mediaType: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg";
  if (file.type === "image/png") mediaType = "image/png";
  else if (file.type === "image/webp") mediaType = "image/webp";

  try {
    const result = await recognizeTiles(base64, mediaType);
    const validation = validateHand(result.tiles, result.kongs);

    return NextResponse.json({
      ...result,
      photoUrl,
      validation,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Tile recognition failed:", message);

    // Return the actual error for debugging
    return NextResponse.json({
      error: `Tile recognition failed: ${message}`,
      photoUrl,
    }, { status: 422 });
  }
}
