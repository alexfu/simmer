export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShoppingListView } from "@/components/shopping-list-view";

interface ShoppingListPageProps {
  params: Promise<{ id: string }>;
}

export default async function ShoppingListPage({
  params,
}: ShoppingListPageProps) {
  const { id } = await params;

  const list = await prisma.shoppingList.findUnique({
    where: { id },
    include: {
      items: true,
      recipes: true,
    },
  });

  if (!list) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="font-serif text-3xl font-bold text-foreground">
        {list.name}
      </h1>

      {list.recipes.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {list.recipes.map((r) => (
            <span
              key={r.id}
              className="rounded-md bg-secondary/10 px-2 py-1 text-xs text-secondary"
            >
              {r.recipeTitle} ({r.servings} servings)
            </span>
          ))}
        </div>
      )}

      <div className="mt-4">
        <Link
          href={`/shopping-list/${list.id}/edit`}
          className="rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-border"
        >
          Edit
        </Link>
      </div>

      <ShoppingListView items={list.items} />
    </main>
  );
}
