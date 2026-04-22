"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export interface CreateShoppingListState {
  errors: string[];
}

export async function createShoppingList(
  _prevState: CreateShoppingListState,
  formData: FormData,
): Promise<CreateShoppingListState> {
  const name = formData.get("name")?.toString().trim() || "Shopping List";

  const shoppingList = await prisma.shoppingList.create({
    data: { name },
  });

  redirect(`/shopping-list/${shoppingList.id}/edit`);
}
