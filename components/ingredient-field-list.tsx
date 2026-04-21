"use client";

import { useState } from "react";
import { parseQuantityExpression } from "@/lib/parse-quantity";
import { formatQuantity } from "@/lib/format-quantity";

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
            value={row.quantity}
            onChange={(value) => updateRow(index, "quantity", value)}
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

function QuantityInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [display, setDisplay] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  const parsed = parseQuantityExpression(display);
  const isExpression = display !== "" && display !== String(parsed);
  const isInvalid = display !== "" && parsed === null;

  function handleBlur() {
    setIsFocused(false);
    if (parsed !== null) {
      const rounded = parseFloat(parsed.toFixed(4));
      onChange(String(rounded));
      setDisplay(String(rounded));
    }
  }

  function handleChange(newValue: string) {
    setDisplay(newValue);
    // For plain numbers, update immediately
    const num = parseFloat(newValue);
    if (!isNaN(num) && String(num) === newValue.trim()) {
      onChange(newValue);
    }
  }

  return (
    <div className="relative w-28">
      <input
        type="text"
        name="ingredient-quantity"
        placeholder="Qty (e.g. 1/4)"
        value={isFocused ? display : value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => {
          setIsFocused(true);
          setDisplay(value);
        }}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleBlur();
          }
        }}
        required
        className={`w-full rounded-md border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 ${
          isInvalid && isFocused
            ? "border-primary focus:border-primary"
            : "border-border focus:border-primary"
        }`}
      />
      {isFocused && isExpression && parsed !== null && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted">
          = {formatQuantity(parsed, 1)}
        </span>
      )}
    </div>
  );
}
