"use client";

import { useActionState, useState } from "react";
import {
  saveSettings,
  type SettingsFormState,
} from "@/app/settings/actions";

interface SettingsFormProps {
  initialData: {
    activeProvider: string;
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

const inputClassName =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

function getInitialKey(provider: string, data: SettingsFormProps["initialData"]): string {
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

  const activeProviderConfig = PROVIDERS.find((p) => p.value === activeProvider);

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
                onChange={() => setActiveProvider(provider.value)}
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
        className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-surface transition-colors hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}
