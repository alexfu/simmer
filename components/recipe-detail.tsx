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

      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          {recipe.title}
        </h1>
        <div className="flex gap-2">
          <Link
            href={`/recipe/${recipe.id}/edit`}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-border"
          >
            Edit
          </Link>
          <DeleteRecipeButton recipeId={recipe.id} />
        </div>
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
    </article>
  );
}
