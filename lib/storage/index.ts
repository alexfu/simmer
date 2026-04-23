import type { ImageStorage } from "@/lib/storage/types";
import { LocalImageStorage } from "@/lib/storage/local";

let instance: ImageStorage | null = null;

/**
 * Returns the configured image storage provider.
 *
 * Set IMAGE_STORAGE env var to switch providers:
 * - "local" (default): stores images on the local filesystem (UPLOAD_DIR, default ./uploads)
 */
export function getImageStorage(): ImageStorage {
  if (instance) return instance;

  const storageType = process.env.IMAGE_STORAGE || "local";

  switch (storageType) {
    case "local":
    default:
      instance = new LocalImageStorage();
      break;
  }

  return instance;
}

export type { ImageStorage };
