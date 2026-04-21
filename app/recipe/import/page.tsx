import { RecipeImport } from "@/components/recipe-import";

export default function ImportRecipePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="font-serif text-3xl font-bold text-foreground">
        Import Recipe
      </h1>
      <p className="mt-2 text-sm text-muted">
        Upload a photo, PDF, or paste text and AI will extract the recipe for
        you.
      </p>
      <div className="mt-4 rounded-xl border border-border bg-surface p-4">
        <p className="text-sm font-medium text-foreground">
          Tips for best results
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
          <li>Use specific quantities with units (e.g. "2 tbsp" not "some")</li>
          <li>List each ingredient on its own line</li>
          <li>Separate ingredients from instructions</li>
          <li>Use single quantities, not ranges (e.g. "8 cloves" not "6-8 cloves")</li>
          <li>Include the number of servings</li>
          <li>For images, ensure text is clearly readable</li>
        </ul>
      </div>
      <RecipeImport />
    </main>
  );
}
