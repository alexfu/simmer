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

  function insertTag(name: string, unit: string, quantity: string) {
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
          className="w-full flex-1 resize-none rounded-md border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
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
  onInsert: (name: string, unit: string, quantity: string) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<IngredientOption | null>(null);
  const [quantity, setQuantity] = useState("");

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-foreground/20"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-border bg-surface px-6 pb-8 pt-4 shadow-lg sm:absolute sm:inset-auto sm:bottom-auto sm:left-0 sm:top-full sm:mt-2 sm:w-80 sm:rounded-xl sm:border sm:pb-4 sm:pt-4">
        {/* Drag handle (mobile only) */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border sm:hidden" />

        {!selected ? (
          <div>
            <p className="mb-3 text-sm font-medium text-foreground">
              Select an ingredient
            </p>
            <div className="max-h-64 space-y-1 overflow-y-auto sm:max-h-48">
              {ingredients.map((ing, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelected(ing)}
                  className="w-full rounded-lg px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-background active:bg-background sm:py-2"
                >
                  {ing.name}
                  <span className="ml-2 text-muted">({ing.unit})</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full rounded-lg border border-border py-3 text-sm font-medium text-muted transition-colors hover:text-foreground sm:w-auto sm:border-0 sm:py-1"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div>
            <p className="mb-4 text-sm font-medium text-foreground">
              How much {selected.name}?
            </p>
            <div className="flex items-center gap-3">
              <QuantityInput
                value={quantity}
                onChange={setQuantity}
                placeholder="e.g. 1/2"
                className="flex-1"
                inputClassName="bg-input"
              />
              <span className="text-sm text-muted">{selected.unit}</span>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setQuantity("");
                }}
                className="flex-1 rounded-lg border border-border py-3 text-sm font-medium text-muted transition-colors hover:text-foreground sm:flex-none sm:py-2 sm:px-4"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!quantity}
                onClick={() =>
                  onInsert(selected.name, selected.unit, quantity)
                }
                className="flex-1 rounded-lg bg-primary py-3 text-sm font-medium text-surface transition-colors hover:bg-primary-hover disabled:opacity-40 sm:flex-none sm:py-2 sm:px-6"
              >
                Insert
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
