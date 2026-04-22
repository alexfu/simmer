import { parseQuantityExpression } from "@/lib/parse-quantity";

export interface MergedIngredient {
  name: string;
  quantity: string;
  unit: string;
}

interface RawIngredient {
  name: string;
  quantity: string;
  unit: string;
}

/**
 * Merges ingredients by exact name + unit match, summing quantities.
 * Same name but different units are kept separate.
 */
export function mergeIngredients(
  ingredients: RawIngredient[],
): MergedIngredient[] {
  const map = new Map<string, MergedIngredient>();

  for (const ing of ingredients) {
    if (!ing.name.trim()) continue;

    const key = `${ing.name.toLowerCase()}|${ing.unit.toLowerCase()}`;
    const existing = map.get(key);

    if (existing) {
      const existingQty = parseQuantityExpression(existing.quantity);
      const newQty = parseQuantityExpression(ing.quantity);

      if (existingQty !== null && newQty !== null) {
        const sum = existingQty + newQty;
        existing.quantity = Number.isInteger(sum)
          ? sum.toString()
          : parseFloat(sum.toFixed(4)).toString();
      }
    } else {
      map.set(key, {
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
      });
    }
  }

  return Array.from(map.values());
}
