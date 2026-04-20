import { RecipeForm } from "@/components/recipe-form";
import { createRecipe } from "@/app/recipe/new/actions";

export default function NewRecipePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="font-serif text-3xl font-bold text-foreground">
        Add Recipe
      </h1>
      <RecipeForm action={createRecipe} />
    </main>
  );
}
