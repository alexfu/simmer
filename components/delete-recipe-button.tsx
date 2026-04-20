"use client";

import { useTransition } from "react";
import { deleteRecipe } from "@/app/recipe/[id]/actions";

interface DeleteRecipeButtonProps {
  recipeId: string;
}

export function DeleteRecipeButton({ recipeId }: DeleteRecipeButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this recipe?")) {
      return;
    }

    startTransition(() => {
      deleteRecipe(recipeId);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-md border border-border px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
