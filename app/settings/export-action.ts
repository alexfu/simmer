"use server";

import { prisma } from "@/lib/prisma";

export async function exportRecipes(): Promise<string> {
  const recipes = await prisma.recipe.findMany({
    include: {
      ingredients: true,
      instructions: { orderBy: { step: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });

  const data = recipes.map((recipe) => ({
    title: recipe.title,
    description: recipe.description,
    servings: recipe.servings,
    imageUrl: recipe.imageUrl,
    ingredients: recipe.ingredients.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
    })),
    instructions: recipe.instructions.map((i) => ({
      step: i.step,
      text: i.text,
    })),
  }));

  return JSON.stringify(data, null, 2);
}
