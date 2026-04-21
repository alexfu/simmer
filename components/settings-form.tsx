"use client";

import { useActionState, useState } from "react";
import {
  saveSettings,
  type SettingsFormState,
} from "@/app/settings/actions";

interface SettingsFormProps {
  initialData: {
    activeProvider: string;
    activeModel: string;
    openaiApiKey: string;
    geminiApiKey: string;
    anthropicApiKey: string;
  };
}

const PROVIDERS = [
  { value: "openai", label: "OpenAI", keyPlaceholder: "sk-..." },
  { value: "gemini", label: "Google Gemini", keyPlaceholder: "AI..." },
  { value: "anthropic", label: "Anthropic", keyPlaceholder: "sk-ant-..." },
];

const MODELS: Record<string, { value: string; label: string }[]> = {
  openai: [
    { value: "gpt-5.4", label: "GPT-5.4" },
    { value: "gpt-5.4-mini", label: "GPT-5.4 Mini" },
    { value: "gpt-5.4-nano", label: "GPT-5.4 Nano" },
    { value: "gpt-4.1", label: "GPT-4.1" },
    { value: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
    { value: "gpt-4.1-nano", label: "GPT-4.1 Nano" },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "o3", label: "o3" },
    { value: "o3-pro", label: "o3 Pro" },
    { value: "o3-mini", label: "o3 Mini" },
    { value: "o4-mini", label: "o4 Mini" },
  ],
  gemini: [
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  ],
  anthropic: [
    { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
    { value: "claude-opus-4-20250514", label: "Claude Opus 4" },
    { value: "claude-haiku-4-20250514", label: "Claude Haiku 4" },
  ],
};

const DEFAULT_MODELS: Record<string, string> = {
  openai: "gpt-4.1",
  gemini: "gemini-2.5-flash",
  anthropic: "claude-sonnet-4-20250514",
};

const inputClassName =
  "w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

function getInitialKey(
  provider: string,
  data: SettingsFormProps["initialData"],
): string {
  const map: Record<string, string> = {
    openai: data.openaiApiKey,
    gemini: data.geminiApiKey,
    anthropic: data.anthropicApiKey,
  };
  return map[provider] ?? "";
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState<
    SettingsFormState,
    FormData
  >(saveSettings, { errors: [], success: false });

  const [activeProvider, setActiveProvider] = useState(
    initialData.activeProvider,
  );
  const [activeModel, setActiveModel] = useState(initialData.activeModel);

  const activeProviderConfig = PROVIDERS.find(
    (p) => p.value === activeProvider,
  );
  const availableModels = MODELS[activeProvider] ?? [];

  function handleProviderChange(provider: string) {
    setActiveProvider(provider);
    setActiveModel(DEFAULT_MODELS[provider]);
  }

  return (
    <form action={formAction} className="mt-8 space-y-8">
      {state.errors.length > 0 && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <ul className="space-y-1 text-sm text-primary">
            {state.errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {state.success && (
        <div className="rounded-lg border border-secondary/30 bg-secondary/5 p-4">
          <p className="text-sm text-secondary">Settings saved.</p>
        </div>
      )}

      <section>
        <h2 className="font-serif text-xl font-semibold text-foreground">
          AI Provider
        </h2>
        <div className="mt-4 space-y-2">
          {PROVIDERS.map((provider) => (
            <label
              key={provider.value}
              className="flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-3 cursor-pointer transition-colors hover:bg-border/30"
            >
              <input
                type="radio"
                name="activeProvider"
                value={provider.value}
                checked={activeProvider === provider.value}
                onChange={() => handleProviderChange(provider.value)}
                className="accent-primary"
              />
              <span className="text-sm font-medium text-foreground">
                {provider.label}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Model
        </h2>
        <div className="mt-4">
          <select
            name="activeModel"
            value={activeModel}
            onChange={(e) => setActiveModel(e.target.value)}
            className={`appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23A89585%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[position:right_12px_center] bg-no-repeat pr-10 ${inputClassName}`}
          >
            {availableModels.map((model) => (
              <option key={model.value} value={model.value}>
                {model.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold text-foreground">
          API Key
        </h2>
        <div className="mt-4">
          <label
            htmlFor="apiKey"
            className="block text-sm font-medium text-foreground"
          >
            {activeProviderConfig?.label} API Key
          </label>
          <input
            id="apiKey"
            type="password"
            name="apiKey"
            defaultValue={getInitialKey(activeProvider, initialData)}
            key={activeProvider}
            placeholder={activeProviderConfig?.keyPlaceholder}
            className={`mt-1 ${inputClassName}`}
          />
        </div>
      </section>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-medium text-surface transition-colors hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
      >
        {isPending ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}
