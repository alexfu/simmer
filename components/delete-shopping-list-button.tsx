"use client";

import { useTransition } from "react";
import { deleteShoppingList } from "@/app/shopping-list/[id]/actions";

interface DeleteShoppingListButtonProps {
  listId: string;
}

export function DeleteShoppingListButton({
  listId,
}: DeleteShoppingListButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this shopping list?")) {
      return;
    }

    startTransition(() => {
      deleteShoppingList(listId);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-md border border-border px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? "Deleting..." : "Delete List"}
    </button>
  );
}
