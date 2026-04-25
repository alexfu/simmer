"use server";

import { prisma } from "@/lib/prisma";

export interface ImportResult {
  success: boolean;
  message: string;
}

interface RecipeData {
  title: string;
  description?: string | null;
  servings?: number;
  imageUrl?: string | null;
  ingredients: { name: string; quantity: string | number; unit: string }[];
  notes?: string | null;
  instructions: { step?: number; text: string; note?: string | null }[];
}

export async function importRecipes(json: string): Promise<ImportResult> {
  let recipes: RecipeData[];

  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) {
      return {
        success: false,
        message: "Invalid format: expected an array of recipes.",
      };
    }
    recipes = parsed;
  } catch {
    return { success: false, message: "Invalid JSON file." };
  }

  if (recipes.length === 0) {
    return { success: false, message: "No recipes found in file." };
  }

  let imported = 0;

  for (const recipe of recipes) {
    if (
      !recipe.title ||
      !Array.isArray(recipe.ingredients) ||
      !Array.isArray(recipe.instructions)
    ) {
      continue;
    }

    await prisma.recipe.create({
      data: {
        title: recipe.title,
        description: recipe.description ?? null,
        notes: recipe.notes ?? null,
        servings: recipe.servings ?? 1,
        imageUrl: recipe.imageUrl ?? null,
        ingredients: {
          create: recipe.ingredients
            .filter((i) => i.name && i.quantity != null && i.unit)
            .map((i) => ({
              name: i.name,
              quantity: String(i.quantity),
              unit: i.unit,
            })),
        },
        instructions: {
          create: recipe.instructions
            .filter((i) => i.text)
            .map((i, index) => ({
              step: i.step ?? index + 1,
              text: i.text,
              note: i.note ?? null,
            })),
        },
      },
    });

    imported++;
  }

  return {
    success: true,
    message: `Imported ${imported} recipe${imported === 1 ? "" : "s"}.`,
  };
}
