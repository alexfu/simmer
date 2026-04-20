export interface ParsedRecipeData {
  title: string;
  description: string | null;
  servings: number;
  ingredients: { name: string; quantity: number; unit: string }[];
  instructions: string[];
}

export function parseRecipeForm(formData: FormData): {
  data: ParsedRecipeData | null;
  errors: string[];
} {
  const title = formData.get("title")?.toString().trim() ?? "";
  const description = formData.get("description")?.toString().trim() || null;
  const servingsRaw = Number(formData.get("servings"));
  const servings =
    Number.isFinite(servingsRaw) && servingsRaw >= 1
      ? Math.floor(servingsRaw)
      : 0;

  const names = formData.getAll("ingredient-name").map((v) => v.toString().trim());
  const quantities = formData.getAll("ingredient-quantity").map((v) => v.toString());
  const units = formData.getAll("ingredient-unit").map((v) => v.toString().trim());
  const instructionTexts = formData.getAll("instruction-text").map((v) => v.toString().trim());

  const errors: string[] = [];

  if (!title) {
    errors.push("Title is required.");
  }

  if (servings < 1) {
    errors.push("Servings must be at least 1.");
  }

  const ingredients = names
    .map((name, i) => ({
      name,
      quantity: parseFloat(quantities[i]),
      unit: units[i],
    }))
    .filter((ing) => ing.name || !isNaN(ing.quantity) || ing.unit);

  if (ingredients.length === 0) {
    errors.push("At least one ingredient is required.");
  } else {
    for (const ing of ingredients) {
      if (!ing.name) {
        errors.push("Each ingredient must have a name.");
        break;
      }
      if (isNaN(ing.quantity) || ing.quantity <= 0) {
        errors.push("Each ingredient must have a valid quantity.");
        break;
      }
      if (!ing.unit) {
        errors.push("Each ingredient must have a unit.");
        break;
      }
    }
  }

  const instructions = instructionTexts.filter((text) => text.length > 0);

  if (instructions.length === 0) {
    errors.push("At least one instruction is required.");
  }

  if (errors.length > 0) {
    return { data: null, errors };
  }

  return {
    data: { title, description, servings, ingredients, instructions },
    errors: [],
  };
}
