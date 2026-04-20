import type { Settings } from "@/app/generated/prisma/client";
import type { ExtractedRecipe } from "@/lib/ai/types";
import { extractWithOpenAI, extractWithOpenAIText } from "@/lib/ai/providers/openai";
import { extractWithGemini, extractWithGeminiText } from "@/lib/ai/providers/gemini";
import { extractWithAnthropic, extractWithAnthropicText } from "@/lib/ai/providers/anthropic";

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
            typeof i === "object" && i !== null && ("name" in i || "ingredient" in i),
        )
        .map((i: Record<string, unknown>) => ({
          name: String(i.name ?? i.ingredient ?? "").trim(),
          quantity: Number(i.quantity ?? i.amount ?? i.qty ?? 1) || 1,
          unit: String(i.unit ?? i.measurement ?? "whole").trim() || "whole",
        }))
        .filter((i: { name: string }) => i.name.length > 0)
    : [];

  if (ingredients.length === 0) {
    throw new Error("AI could not extract any ingredients.");
  }

  const instructions = Array.isArray(parsed.instructions)
    ? parsed.instructions
        .map((i: unknown) => {
          if (typeof i === "string") return { text: i.trim() };
          if (typeof i === "object" && i !== null) {
            const obj = i as Record<string, unknown>;
            const text = obj.text ?? obj.instruction ?? obj.step ?? obj.description;
            if (typeof text === "string") return { text: text.trim() };
          }
          return { text: "" };
        })
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

  const model = settings.activeModel;

  let raw: string;
  switch (settings.activeProvider) {
    case "openai":
      raw = await extractWithOpenAI(apiKey, model, file.base64, file.mimeType);
      break;
    case "gemini":
      raw = await extractWithGemini(apiKey, model, file.base64, file.mimeType);
      break;
    case "anthropic":
      raw = await extractWithAnthropic(apiKey, model, file.base64, file.mimeType);
      break;
    default:
      throw new Error(`Unknown provider: ${settings.activeProvider}`);
  }

  return parseResponse(raw);
}

export async function extractRecipeFromText(
  text: string,
  settings: Settings,
): Promise<ExtractedRecipe> {
  const apiKey = getApiKey(settings);
  const model = settings.activeModel;

  let raw: string;
  switch (settings.activeProvider) {
    case "openai":
      raw = await extractWithOpenAIText(apiKey, model, text);
      break;
    case "gemini":
      raw = await extractWithGeminiText(apiKey, model, text);
      break;
    case "anthropic":
      raw = await extractWithAnthropicText(apiKey, model, text);
      break;
    default:
      throw new Error(`Unknown provider: ${settings.activeProvider}`);
  }

  return parseResponse(raw);
}
