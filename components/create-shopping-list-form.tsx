"use client";

import { useActionState } from "react";
import {
  createShoppingList,
  type CreateShoppingListState,
} from "@/app/shopping-list/new/actions";

const inputClassName =
  "w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

export function CreateShoppingListForm() {
  const [state, formAction, isPending] = useActionState<
    CreateShoppingListState,
    FormData
  >(createShoppingList, { errors: [] });

  return (
    <form action={formAction} className="mt-8 space-y-6">
      {state.errors.length > 0 && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <ul className="space-y-1 text-sm text-primary">
            {state.errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-foreground"
        >
          List Name
        </label>
        <input
          id="name"
          type="text"
          name="name"
          placeholder="e.g. This week's groceries"
          className={`mt-1 ${inputClassName}`}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-medium text-surface transition-colors hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
      >
        {isPending ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
