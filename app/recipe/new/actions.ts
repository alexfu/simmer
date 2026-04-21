"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseRecipeForm } from "@/lib/parse-recipe-form";

export interface FormState {
  errors: string[];
}

export async function createRecipe(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const { data, errors } = parseRecipeForm(formData);

  if (!data) {
    return { errors };
  }

  const recipe = await prisma.recipe.create({
    data: {
      title: data.title,
      description: data.description,
      notes: data.notes,
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
  });

  redirect(`/recipe/${recipe.id}`);
}
