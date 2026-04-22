export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShoppingListEditor } from "@/components/shopping-list-editor";
import { DeleteShoppingListButton } from "@/components/delete-shopping-list-button";

interface EditShoppingListPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditShoppingListPage({
  params,
}: EditShoppingListPageProps) {
  const { id } = await params;

  const [list, recipes, otherLists] = await Promise.all([
    prisma.shoppingList.findUnique({
      where: { id },
      include: { items: true },
    }),
    prisma.recipe.findMany({
      select: { id: true, title: true, servings: true },
      orderBy: { title: "asc" },
    }),
    prisma.shoppingList.findMany({
      where: { id: { not: id } },
      select: {
        id: true,
        name: true,
        items: { select: { name: true, quantity: true, unit: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!list) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="font-serif text-3xl font-bold text-foreground">
        Edit Shopping List
      </h1>
      <ShoppingListEditor
        listId={list.id}
        name={list.name}
        items={list.items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
        }))}
        recipes={recipes}
        otherLists={otherLists}
      />
      <div className="mt-8 border-t border-border pt-8">
        <DeleteShoppingListButton listId={list.id} />
      </div>
    </main>
  );
}
