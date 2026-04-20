"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function deleteRecipe(recipeId: string): Promise<void> {
  await prisma.recipe.delete({ where: { id: recipeId } });
  redirect("/");
}
