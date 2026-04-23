"use client";

import { useState } from "react";
import { RecipeCard } from "@/components/recipe-card";

type TimeRatingFilter = "all" | "quick" | "medium" | "involved";

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  servings: number;
  timeRating: string | null;
}

interface RecipeListProps {
  recipes: Recipe[];
}

const FILTERS: { value: TimeRatingFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "quick", label: "Quick" },
  { value: "medium", label: "Medium" },
  { value: "involved", label: "Involved" },
];

export function RecipeList({ recipes }: RecipeListProps) {
  const [filter, setFilter] = useState<TimeRatingFilter>("all");

  const filtered =
    filter === "all"
      ? recipes
      : recipes.filter((r) => r.timeRating === filter);

  return (
    <div>
      <div className="mt-6 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-primary text-surface"
                : "bg-surface border border-border text-muted hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="font-serif text-xl text-muted">No recipes found</p>
          {filter !== "all" && (
            <p className="mt-2 text-sm text-muted">
              No recipes rated as &ldquo;{filter}&rdquo; yet.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((recipe) => (
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
    </div>
  );
}
