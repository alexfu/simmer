import type { Settings } from "@/app/generated/prisma/client";
import type {
  ExtractedRecipe,
  ExtractionResult,
  DiagnosticPhase,
} from "@/lib/ai/types";
import {
  OCR_PROMPT,
  STRUCTURE_PROMPT,
  SPLIT_PROMPT,
  TAGGING_PROMPT,
} from "@/lib/ai/prompts";
import { openaiVision, openaiText } from "@/lib/ai/providers/openai";
import { geminiVision, geminiText } from "@/lib/ai/providers/gemini";
import { anthropicVision, anthropicText } from "@/lib/ai/providers/anthropic";

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

function callVision(
  provider: string,
  apiKey: string,
  model: string,
  prompt: string,
  base64: string,
  mimeType: string,
): Promise<string> {
  switch (provider) {
    case "openai":
      return openaiVision(apiKey, model, prompt, base64, mimeType);
    case "gemini":
      return geminiVision(apiKey, model, prompt, base64, mimeType);
    case "anthropic":
      return anthropicVision(apiKey, model, prompt, base64, mimeType);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

function callText(
  provider: string,
  apiKey: string,
  model: string,
  prompt: string,
): Promise<string> {
  switch (provider) {
    case "openai":
      return openaiText(apiKey, model, prompt);
    case "gemini":
      return geminiText(apiKey, model, prompt);
    case "anthropic":
      return anthropicText(apiKey, model, prompt);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

function cleanJson(raw: string): string {
  return raw.replace(/```(?:json)?\n?|\n?```/g, "").trim();
}

function parseRecipeJson(raw: string): ExtractedRecipe {
  const parsed = JSON.parse(cleanJson(raw));

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
            ("name" in i || "ingredient" in i),
        )
        .map((i: Record<string, unknown>) => ({
          name: String(i.name ?? i.ingredient ?? "").trim(),
          quantity: String(i.quantity ?? i.amount ?? i.qty ?? "1").trim() || "1",
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
            const text =
              obj.text ?? obj.instruction ?? obj.step ?? obj.description;
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
  collectDiagnostics = false,
): Promise<ExtractionResult> {
  const apiKey = getApiKey(settings);
  const model = settings.activeModel;
  const provider = settings.activeProvider;
  const phases: DiagnosticPhase[] = [];

  // Phase 1: OCR
  const ocrPrompt = OCR_PROMPT;
  const rawText = await callVision(
    provider, apiKey, model, ocrPrompt, file.base64, file.mimeType,
  );
  if (collectDiagnostics) {
    phases.push({ name: "ocr", prompt: ocrPrompt, response: rawText });
  }

  // Phase 2: Structure
  const structurePrompt = `${STRUCTURE_PROMPT}\n\nRecipe text:\n${rawText}`;
  const structuredRaw = await callText(provider, apiKey, model, structurePrompt);
  const structured = parseRecipeJson(structuredRaw);
  if (collectDiagnostics) {
    phases.push({ name: "structure", prompt: structurePrompt, response: structuredRaw, parsed: structured });
  }

  // Phase 3: Split
  const splitPrompt = `${SPLIT_PROMPT}\n\nRecipe JSON:\n${JSON.stringify(structured, null, 2)}`;
  const splitRaw = await callText(provider, apiKey, model, splitPrompt);
  const split = parseRecipeJson(splitRaw);
  if (collectDiagnostics) {
    phases.push({ name: "split", prompt: splitPrompt, response: splitRaw, parsed: split });
  }

  // Phase 4: Tagging
  const tagPrompt = `${TAGGING_PROMPT}\n\nRecipe JSON:\n${JSON.stringify(split, null, 2)}`;
  const taggedRaw = await callText(provider, apiKey, model, tagPrompt);
  const finalResult = parseRecipeJson(taggedRaw);
  if (collectDiagnostics) {
    phases.push({ name: "tagging", prompt: tagPrompt, response: taggedRaw, parsed: finalResult });
  }

  return {
    recipe: finalResult,
    diagnosticLog: collectDiagnostics
      ? { provider, model, timestamp: new Date().toISOString(), source: "file", phases, finalResult }
      : undefined,
  };
}

export async function extractRecipeFromText(
  text: string,
  settings: Settings,
  collectDiagnostics = false,
): Promise<ExtractionResult> {
  const apiKey = getApiKey(settings);
  const model = settings.activeModel;
  const provider = settings.activeProvider;
  const phases: DiagnosticPhase[] = [];

  // Phase 1: Structure
  const structurePrompt = `${STRUCTURE_PROMPT}\n\nRecipe text:\n${text}`;
  const structuredRaw = await callText(provider, apiKey, model, structurePrompt);
  const structured = parseRecipeJson(structuredRaw);
  if (collectDiagnostics) {
    phases.push({ name: "structure", prompt: structurePrompt, response: structuredRaw, parsed: structured });
  }

  // Phase 2: Split
  const splitPrompt = `${SPLIT_PROMPT}\n\nRecipe JSON:\n${JSON.stringify(structured, null, 2)}`;
  const splitRaw = await callText(provider, apiKey, model, splitPrompt);
  const split = parseRecipeJson(splitRaw);
  if (collectDiagnostics) {
    phases.push({ name: "split", prompt: splitPrompt, response: splitRaw, parsed: split });
  }

  // Phase 3: Tagging
  const tagPrompt = `${TAGGING_PROMPT}\n\nRecipe JSON:\n${JSON.stringify(split, null, 2)}`;
  const taggedRaw = await callText(provider, apiKey, model, tagPrompt);
  const finalResult = parseRecipeJson(taggedRaw);
  if (collectDiagnostics) {
    phases.push({ name: "tagging", prompt: tagPrompt, response: taggedRaw, parsed: finalResult });
  }

  return {
    recipe: finalResult,
    diagnosticLog: collectDiagnostics
      ? { provider, model, timestamp: new Date().toISOString(), source: "text", phases, finalResult }
      : undefined,
  };
}
