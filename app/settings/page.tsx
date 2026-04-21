import { getSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/settings-form";
import { ImportExport } from "@/components/import-export";

export default async function SettingsPage() {
  const settings = await getSettings();

  const initialData = {
    activeProvider: settings?.activeProvider ?? "openai",
    activeModel: settings?.activeModel ?? "gpt-4o",
    openaiApiKey: settings?.openaiApiKey ?? "",
    geminiApiKey: settings?.geminiApiKey ?? "",
    anthropicApiKey: settings?.anthropicApiKey ?? "",
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="font-serif text-3xl font-bold text-foreground">
        Settings
      </h1>
      <SettingsForm initialData={initialData} />
      <div className="mt-8">
        <ImportExport />
      </div>
    </main>
  );
}
