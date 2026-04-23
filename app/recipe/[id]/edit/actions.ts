"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseRecipeForm } from "@/lib/parse-recipe-form";

export interface FormState {
  errors: string[];
}

export async function updateRecipe(
  recipeId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const { data, errors } = parseRecipeForm(formData);

  if (!data) {
    return { errors };
  }

  await prisma.$transaction([
    prisma.ingredient.deleteMany({ where: { recipeId } }),
    prisma.instruction.deleteMany({ where: { recipeId } }),
    prisma.recipe.update({
      where: { id: recipeId },
      data: {
        title: data.title,
        description: data.description,
        notes: data.notes,
        imageUrl: data.imageUrl,
        servings: data.servings,
        ingredients: {
          create: data.ingredients.map((ing) => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
          })),
        },
        instructions: {
          create: data.instructions.map((inst, index) => ({
            step: index + 1,
            text: inst.text,
            note: inst.note,
          })),
        },
      },
    }),
  ]);

  redirect(`/recipe/${recipeId}`);
}
