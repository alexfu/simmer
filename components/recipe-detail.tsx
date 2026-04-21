"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ServingsAdjuster } from "@/components/servings-adjuster";
import { IngredientList } from "@/components/ingredient-list";
import { InstructionList } from "@/components/instruction-list";
import { DeleteRecipeButton } from "@/components/delete-recipe-button";

interface RecipeDetailProps {
  recipe: {
    id: string;
    title: string;
    description: string | null;
    notes: string | null;
    imageUrl: string | null;
    servings: number;
    ingredients: {
      id: string;
      name: string;
      quantity: number | string;
      unit: string;
    }[];
    instructions: {
      id: string;
      step: number;
      text: string;
      note?: string | null;
    }[];
  };
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  const [servings, setServings] = useState(recipe.servings);
  const scale = servings / recipe.servings;

  return (
    <article>
      {recipe.imageUrl && (
        <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-lg">
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>
      )}

      <h1 className="font-serif text-3xl font-bold text-foreground">
        {recipe.title}
      </h1>
      <div className="mt-4 flex gap-2">
        <Link
          href={`/recipe/${recipe.id}/edit`}
          className="rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-border"
        >
          Edit
        </Link>
        <DeleteRecipeButton recipeId={recipe.id} />
      </div>

      {recipe.description && (
        <p className="mt-3 text-muted">{recipe.description}</p>
      )}

      <div className="mt-8">
        <ServingsAdjuster servings={servings} onChange={setServings} />
      </div>

      <section className="mt-8">
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Ingredients
        </h2>
        <IngredientList ingredients={recipe.ingredients} scale={scale} />
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Instructions
        </h2>
        <InstructionList
          instructions={recipe.instructions}
          ingredients={recipe.ingredients}
          scale={scale}
        />
      </section>

      {recipe.notes && (
        <section className="mt-8">
          <h2 className="font-serif text-xl font-semibold text-foreground">
            Notes
          </h2>
          <div className="mt-4 flex gap-3 rounded-lg bg-secondary/10 px-4 py-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 shrink-0 text-secondary"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <p className="whitespace-pre-line text-sm text-foreground">
              {recipe.notes}
            </p>
          </div>
        </section>
      )}
    </article>
  );
}
