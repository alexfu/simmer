"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseQuantityExpression } from "@/lib/parse-quantity";
import { mergeIngredients } from "@/lib/merge-ingredients";

export interface EditShoppingListState {
  errors: string[];
}

export async function autoSaveShoppingList(
  listId: string,
  name: string,
  items: { name: string; quantity: string; unit: string }[],
): Promise<void> {
  const filtered = items.filter((item) => item.name.trim().length > 0);

  await prisma.$transaction([
    prisma.shoppingListItem.deleteMany({ where: { shoppingListId: listId } }),
    prisma.shoppingList.update({
      where: { id: listId },
      data: {
        name: name.trim() || "Shopping List",
        items: {
          create: filtered.map((item) => ({
            name: item.name.trim(),
            quantity: item.quantity.trim(),
            unit: item.unit.trim(),
          })),
        },
      },
    }),
  ]);
}

export async function updateShoppingList(
  listId: string,
  _prevState: EditShoppingListState,
  formData: FormData,
): Promise<EditShoppingListState> {
  const name = formData.get("name")?.toString().trim() || "Shopping List";
  const itemNames = formData
    .getAll("item-name")
    .map((v) => v.toString().trim());
  const itemQuantities = formData
    .getAll("item-quantity")
    .map((v) => v.toString().trim());
  const itemUnits = formData
    .getAll("item-unit")
    .map((v) => v.toString().trim());

  const items = itemNames
    .map((itemName, i) => ({
      name: itemName,
      quantity: itemQuantities[i] ?? "",
      unit: itemUnits[i] ?? "",
    }))
    .filter((item) => item.name.length > 0);

  await prisma.$transaction([
    prisma.shoppingListItem.deleteMany({ where: { shoppingListId: listId } }),
    prisma.shoppingList.update({
      where: { id: listId },
      data: {
        name,
        items: {
          create: items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
          })),
        },
      },
    }),
  ]);

  redirect(`/shopping-list/${listId}`);
}

export interface RecipeIngredient {
  name: string;
  quantity: string;
  unit: string;
}

export async function getRecipeIngredients(
  recipeId: string,
  servings: number,
): Promise<RecipeIngredient[]> {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: { ingredients: true },
  });

  if (!recipe) return [];

  const scale = servings / recipe.servings;

  return recipe.ingredients.map((ing) => {
    let scaledQuantity = ing.quantity;

    if (ing.quantity) {
      const parsed = parseQuantityExpression(ing.quantity);
      if (parsed !== null) {
        const scaled = parsed * scale;
        scaledQuantity = Number.isInteger(scaled)
          ? scaled.toString()
          : parseFloat(scaled.toFixed(4)).toString();
      }
    }

    return {
      name: ing.name,
      quantity: scaledQuantity,
      unit: ing.unit,
    };
  });
}

export async function addIngredientsToList(
  listId: string,
  ingredients: RecipeIngredient[],
): Promise<void> {
  // Get existing items
  const existing = await prisma.shoppingListItem.findMany({
    where: { shoppingListId: listId },
  });

  const allIngredients = [
    ...existing.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
    })),
    ...ingredients,
  ];

  const merged = mergeIngredients(allIngredients);

  await prisma.$transaction([
    prisma.shoppingListItem.deleteMany({ where: { shoppingListId: listId } }),
    ...merged.map((item) =>
      prisma.shoppingListItem.create({
        data: {
          shoppingListId: listId,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
        },
      }),
    ),
  ]);
}
