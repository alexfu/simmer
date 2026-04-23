"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { TimeRating } from "@/app/generated/prisma/client";

export async function deleteRecipe(recipeId: string): Promise<void> {
  await prisma.recipe.delete({ where: { id: recipeId } });
  redirect("/");
}

export async function setTimeRating(
  recipeId: string,
  rating: TimeRating | null,
): Promise<void> {
  await prisma.recipe.update({
    where: { id: recipeId },
    data: { timeRating: rating },
  });
  revalidatePath(`/recipe/${recipeId}`);
}
