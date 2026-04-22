"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleItem(itemId: string, checked: boolean) {
  await prisma.shoppingListItem.update({
    where: { id: itemId },
    data: { checked },
  });
  revalidatePath("/shopping-list");
}

export async function deleteShoppingList(listId: string) {
  await prisma.shoppingList.delete({ where: { id: listId } });
  redirect("/shopping-list");
}
