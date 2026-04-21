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
    <div className="mt-4 space-y-4">
      {ingredients.map((row, index) => (
        <div
          key={index}
          className="rounded-lg border border-border bg-surface p-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted">
                  Ingredient
                </label>
                <input
                  type="text"
                  name="ingredient-name"
                  placeholder="e.g. Ground beef"
                  value={row.name}
                  onChange={(e) => updateRow(index, "name", e.target.value)}
                  required
                  className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-muted">
                    Quantity
                  </label>
                  <QuantityInput
                    name="ingredient-quantity"
                    value={row.quantity}
                    onChange={(value) => updateRow(index, "quantity", value)}
                    placeholder="e.g. 1/4"
                    className="mt-1 w-full"
                    inputClassName="bg-input"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-muted">
                    Unit
                  </label>
                  <input
                    type="text"
                    name="ingredient-unit"
                    placeholder="e.g. cups"
                    value={row.unit}
                    onChange={(e) => updateRow(index, "unit", e.target.value)}
                    required
                    className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            </div>
            {ingredients.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="ml-3 text-sm text-muted transition-colors hover:text-foreground"
                aria-label="Remove ingredient"
              >
                &times;
              </button>
            )}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="w-full rounded-lg border border-dashed border-border px-4 py-3 text-sm font-medium text-muted transition-colors hover:border-primary/40 hover:text-foreground sm:w-auto"
      >
        + Add Ingredient
      </button>
    </div>
  );
}
