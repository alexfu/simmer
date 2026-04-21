"use client";

import { useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { buildIngredientTag } from "@/lib/parse-instruction-tags";
import { QuantityInput } from "@/components/quantity-input";

interface IngredientOption {
  name: string;
  unit: string;
}

interface InstructionFieldListProps {
  instructions: string[];
  ingredients: IngredientOption[];
  onChange: (instructions: string[]) => void;
}

export function InstructionFieldList({
  instructions,
  ingredients,
  onChange,
}: InstructionFieldListProps) {
  function updateRow(index: number, value: string) {
    const updated = instructions.map((text, i) =>
      i === index ? value : text,
    );
    onChange(updated);
  }

  function addRow() {
    onChange([...instructions, ""]);
  }

  function removeRow(index: number) {
    onChange(instructions.filter((_, i) => i !== index));
  }

  return (
    <div className="mt-4 space-y-6">
      {instructions.map((text, index) => (
        <InstructionRow
          key={index}
          index={index}
          text={text}
          ingredients={ingredients}
          onChange={(value) => updateRow(index, value)}
          onRemove={instructions.length > 1 ? () => removeRow(index) : undefined}
        />
      ))}
      <button
        type="button"
        onClick={addRow}
        className="w-full rounded-lg border border-dashed border-border px-4 py-3 text-sm font-medium text-muted transition-colors hover:border-primary/40 hover:text-foreground sm:w-auto"
      >
        + Add Step
      </button>
    </div>
  );
}

function InstructionRow({
  index,
  text,
  ingredients,
  onChange,
  onRemove,
}: {
  index: number;
  text: string;
  ingredients: IngredientOption[];
  onChange: (value: string) => void;
  onRemove?: () => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function insertTag(name: string, unit: string, quantity: number) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const tag = buildIngredientTag(name, quantity);
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = text.slice(0, start) + tag + text.slice(end);
    onChange(newText);
    setShowPicker(false);

    requestAnimationFrame(() => {
      const cursorPos = start + tag.length;
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  }

  const namedIngredients = ingredients.filter((i) => i.name.trim().length > 0);

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-surface">
          {index + 1}
        </span>
        <TextareaAutosize
          ref={textareaRef}
          name="instruction-text"
          placeholder={`Step ${index + 1}`}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          required
          minRows={2}
          className="w-full flex-1 resize-none rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="mt-0.5 text-sm text-muted transition-colors hover:text-foreground"
            aria-label="Remove step"
          >
            &times;
          </button>
        )}
      </div>
      <div className="relative mt-2 ml-10">
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          disabled={namedIngredients.length === 0}
          className="rounded-md px-2.5 py-1 text-xs text-muted transition-colors hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Insert Ingredient
        </button>
        {showPicker && (
          <IngredientPicker
            ingredients={namedIngredients}
            onInsert={insertTag}
            onClose={() => setShowPicker(false)}
          />
        )}
      </div>
    </div>
  );
}

function IngredientPicker({
  ingredients,
  onInsert,
  onClose,
}: {
  ingredients: IngredientOption[];
  onInsert: (name: string, unit: string, quantity: number) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<IngredientOption | null>(null);
  const [quantity, setQuantity] = useState("");

  return (
    <div className="absolute left-0 top-full z-10 mt-1 w-72 rounded-lg border border-border bg-surface p-3 shadow-md">
      {!selected ? (
        <div>
          <p className="mb-2 text-xs font-medium text-muted">
            Select an ingredient
          </p>
          <div className="max-h-40 space-y-1 overflow-y-auto">
            {ingredients.map((ing, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(ing)}
                className="w-full rounded-md px-3 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-border"
              >
                {ing.name}
                <span className="ml-1 text-muted">({ing.unit})</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 text-xs text-muted hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div>
          <p className="mb-2 text-xs font-medium text-muted">
            How much {selected.name}?
          </p>
          <div className="flex items-center gap-2">
            <QuantityInput
              value={quantity}
              onChange={setQuantity}
              placeholder="Qty"
              className="w-20"
            />
            <span className="text-sm text-muted">{selected.unit}</span>
            <button
              type="button"
              disabled={!quantity || parseFloat(quantity) <= 0}
              onClick={() =>
                onInsert(selected.name, selected.unit, parseFloat(quantity))
              }
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-surface transition-colors hover:bg-primary-hover disabled:opacity-40"
            >
              Insert
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelected(null);
              setQuantity("");
            }}
            className="mt-2 text-xs text-muted hover:text-foreground"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
