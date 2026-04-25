export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ShoppingListIndexPage() {
  const lists = await prisma.shoppingList.findMany({
    include: {
      items: { select: { id: true, checked: true } },
      recipes: { select: { recipeTitle: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Shopping Lists
        </h1>
        <Link
          href="/shopping-list/new"
          className="rounded-lg bg-primary px-5 py-3 text-center text-sm font-medium text-surface shadow-sm transition-colors hover:bg-primary-hover sm:py-2.5"
        >
          + Create Shopping List
        </Link>
      </div>

      {lists.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="font-serif text-xl text-muted">No shopping lists yet</p>
          <p className="mt-2 text-sm text-muted">
            Create one from your recipes.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {lists.map((list) => {
            const total = list.items.length;
            const checked = list.items.filter((i) => i.checked).length;
            const recipeNames = list.recipes
              .map((r) => r.recipeTitle)
              .join(", ");

            return (
              <Link
                key={list.id}
                href={`/shopping-list/${list.id}`}
                className="block rounded-lg border border-border bg-surface p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-lg font-semibold text-foreground">
                    {list.name}
                  </h2>
                  <span className="text-sm text-muted">
                    {checked}/{total} items
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {list.createdAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {recipeNames && ` · ${recipeNames}`}
                </p>
                {total > 0 && (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-secondary transition-all"
                      style={{
                        width: `${(checked / total) * 100}%`,
                      }}
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
