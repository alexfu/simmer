import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RecipeCard } from "@/components/recipe-card";

export default async function HomePage() {
  const recipes = await prisma.recipe.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          My Recipes
        </h1>
        <div className="flex gap-3">
          <Link
            href="/recipe/import"
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-border"
          >
            Import Recipe
          </Link>
          <Link
            href="/recipe/new"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-surface shadow-sm transition-colors hover:bg-primary-hover"
          >
            + Add Recipe
          </Link>
        </div>
      </div>

      {recipes.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="font-serif text-xl text-muted">No recipes yet</p>
          <p className="mt-2 text-sm text-muted">
            Add your first recipe to get started.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              title={recipe.title}
              description={recipe.description}
              imageUrl={recipe.imageUrl}
              servings={recipe.servings}
            />
          ))}
        </div>
      )}
    </main>
  );
}
