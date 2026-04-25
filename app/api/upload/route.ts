import { NextResponse } from "next/server";
import { getImageStorage } from "@/lib/storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type. Use JPEG, PNG, WebP, or GIF." },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 5MB." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storage = getImageStorage();
  const key = await storage.upload(buffer, file.name, file.type);
  const url = storage.getUrl(key);

  return NextResponse.json({ key, url });
}
