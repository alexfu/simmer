"use server";

import { getSettings } from "@/lib/settings";
import { extractRecipeFromFile } from "@/lib/ai/extract-recipe";
import type { ExtractedRecipe } from "@/lib/ai/types";

export interface ImportState {
  status: "idle" | "error" | "success";
  errors: string[];
  data: ExtractedRecipe | null;
}

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function extractRecipe(
  _prevState: ImportState,
  formData: FormData,
): Promise<ImportState> {
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    return { status: "error", errors: ["Please select a file."], data: null };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      status: "error",
      errors: [
        "Unsupported file type. Please upload an image (JPEG, PNG, WebP) or PDF.",
      ],
      data: null,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      status: "error",
      errors: ["File is too large. Maximum size is 10MB."],
      data: null,
    };
  }

  const settings = await getSettings();
  if (!settings) {
    return {
      status: "error",
      errors: [
        "Please configure your AI provider in Settings first.",
      ],
      data: null,
    };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    const recipe = await extractRecipeFromFile(
      { base64, mimeType: file.type },
      settings,
    );

    return { status: "success", errors: [], data: recipe };
  } catch (error) {
    return {
      status: "error",
      errors: [
        error instanceof Error
          ? error.message
          : "Failed to extract recipe. Please try again.",
      ],
      data: null,
    };
  }
}
