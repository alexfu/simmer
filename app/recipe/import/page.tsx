import { RecipeImport } from "@/components/recipe-import";

export default function ImportRecipePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="font-serif text-3xl font-bold text-foreground">
        Import Recipe
      </h1>
      <p className="mt-2 text-sm text-muted">
        Upload a photo or PDF of a recipe and AI will extract the details for
        you.
      </p>
      <RecipeImport />
    </main>
  );
}
