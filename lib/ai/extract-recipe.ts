import type { Settings } from "@/app/generated/prisma/client";
import type { ExtractedRecipe } from "@/lib/ai/types";
import { extractWithOpenAI } from "@/lib/ai/providers/openai";
import { extractWithGemini } from "@/lib/ai/providers/gemini";
import { extractWithAnthropic } from "@/lib/ai/providers/anthropic";

function getApiKey(settings: Settings): string {
  const keyMap: Record<string, string | null> = {
    openai: settings.openaiApiKey,
    gemini: settings.geminiApiKey,
    anthropic: settings.anthropicApiKey,
  };

  const key = keyMap[settings.activeProvider];
  if (!key) {
    throw new Error(
      `No API key configured for ${settings.activeProvider}. Please check your settings.`,
    );
  }
  return key;
}

function parseResponse(raw: string): ExtractedRecipe {
  const cleaned = raw.replace(/```(?:json)?\n?|\n?```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  const title = typeof parsed.title === "string" ? parsed.title.trim() : "";
  if (!title) {
    throw new Error("AI could not extract a recipe title.");
  }

  const description =
    typeof parsed.description === "string" ? parsed.description.trim() : null;

  const servings =
    typeof parsed.servings === "number" && parsed.servings >= 1
      ? Math.floor(parsed.servings)
      : 4;

  const ingredients = Array.isArray(parsed.ingredients)
    ? parsed.ingredients
        .filter(
          (i: unknown) =>
            typeof i === "object" &&
            i !== null &&
            "name" in i &&
            "quantity" in i &&
            "unit" in i,
        )
        .map((i: { name: string; quantity: number; unit: string }) => ({
          name: String(i.name).trim(),
          quantity: Number(i.quantity) || 1,
          unit: String(i.unit).trim() || "whole",
        }))
    : [];

  if (ingredients.length === 0) {
    throw new Error("AI could not extract any ingredients.");
  }

  const instructions = Array.isArray(parsed.instructions)
    ? parsed.instructions
        .filter(
          (i: unknown) =>
            typeof i === "object" && i !== null && "text" in i,
        )
        .map((i: { text: string }) => ({
          text: String(i.text).trim(),
        }))
        .filter((i: { text: string }) => i.text.length > 0)
    : [];

  if (instructions.length === 0) {
    throw new Error("AI could not extract any instructions.");
  }

  return { title, description, servings, ingredients, instructions };
}

export async function extractRecipeFromFile(
  file: { base64: string; mimeType: string },
  settings: Settings,
): Promise<ExtractedRecipe> {
  const apiKey = getApiKey(settings);

  let raw: string;
  switch (settings.activeProvider) {
    case "openai":
      raw = await extractWithOpenAI(apiKey, file.base64, file.mimeType);
      break;
    case "gemini":
      raw = await extractWithGemini(apiKey, file.base64, file.mimeType);
      break;
    case "anthropic":
      raw = await extractWithAnthropic(apiKey, file.base64, file.mimeType);
      break;
    default:
      throw new Error(`Unknown provider: ${settings.activeProvider}`);
  }

  return parseResponse(raw);
}
