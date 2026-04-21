"use client";

import { QuantityInput } from "@/components/quantity-input";

interface IngredientRow {
  name: string;
  quantity: string;
  unit: string;
}

interface IngredientFieldListProps {
  ingredients: IngredientRow[];
  onChange: (ingredients: IngredientRow[]) => void;
}

export function IngredientFieldList({
  ingredients,
  onChange,
}: IngredientFieldListProps) {
  function updateRow(index: number, field: keyof IngredientRow, value: string) {
    const updated = ingredients.map((row, i) =>
      i === index ? { ...row, [field]: value } : row,
    );
    onChange(updated);
  }

  function addRow() {
    onChange([...ingredients, { name: "", quantity: "", unit: "" }]);
  }

  function removeRow(index: number) {
    onChange(ingredients.filter((_, i) => i !== index));
  }

  return (
    <div className="mt-4 space-y-3">
      {ingredients.map((row, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            name="ingredient-name"
            placeholder="Name"
            value={row.name}
            onChange={(e) => updateRow(index, "name", e.target.value)}
            required
            className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <QuantityInput
            name="ingredient-quantity"
            value={row.quantity}
            onChange={(value) => updateRow(index, "quantity", value)}
            required
          />
          <input
            type="text"
            name="ingredient-unit"
            placeholder="Unit"
            value={row.unit}
            onChange={(e) => updateRow(index, "unit", e.target.value)}
            required
            className="w-24 rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {ingredients.length > 1 && (
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="rounded-md border border-border px-2 py-2 text-sm text-muted transition-colors hover:bg-border hover:text-foreground"
            >
              &times;
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="rounded-md border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-border"
      >
        + Add Ingredient
      </button>
    </div>
  );
}
