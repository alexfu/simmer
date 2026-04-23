import { existsSync, mkdirSync, writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import type { ImageStorage } from "@/lib/storage/types";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

function ensureDir() {
  if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export class LocalImageStorage implements ImageStorage {
  async upload(
    file: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<string> {
    ensureDir();
    const ext = filename.split(".").pop() || mimeTypeToExt(mimeType);
    const key = `${uuidv4()}.${ext}`;
    const filePath = join(UPLOAD_DIR, key);
    writeFileSync(filePath, file);
    return key;
  }

  async delete(key: string): Promise<void> {
    const filePath = join(UPLOAD_DIR, key);
    try {
      unlinkSync(filePath);
    } catch {
      // File may already be deleted
    }
  }

  getUrl(key: string): string {
    return `/api/images/${key}`;
  }
}

function mimeTypeToExt(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[mimeType] || "jpg";
}
