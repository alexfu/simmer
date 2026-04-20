"use server";

import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export interface SettingsFormState {
  errors: string[];
  success: boolean;
}

const VALID_PROVIDERS = ["openai", "gemini", "anthropic"];

export async function saveSettings(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const activeProvider = formData.get("activeProvider")?.toString() ?? "";
  const apiKey = formData.get("apiKey")?.toString().trim() || null;

  const errors: string[] = [];

  if (!VALID_PROVIDERS.includes(activeProvider)) {
    errors.push("Please select a valid AI provider.");
  }

  if (!apiKey) {
    errors.push("An API key is required.");
  }

  if (errors.length > 0) {
    return { errors, success: false };
  }

  const existing = await getSettings();

  const data = {
    activeProvider,
    openaiApiKey: existing?.openaiApiKey ?? null,
    geminiApiKey: existing?.geminiApiKey ?? null,
    anthropicApiKey: existing?.anthropicApiKey ?? null,
  };

  if (activeProvider === "openai") data.openaiApiKey = apiKey;
  if (activeProvider === "gemini") data.geminiApiKey = apiKey;
  if (activeProvider === "anthropic") data.anthropicApiKey = apiKey;

  await prisma.settings.upsert({
    where: { id: "global" },
    create: data,
    update: data,
  });

  return { errors: [], success: true };
}
