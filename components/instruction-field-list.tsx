"use client";

import { useRef, useState } from "react";
import { InstructionEditor, IngredientInserter } from "@/components/instruction-editor";
import { RichTextEditor } from "@/components/rich-text-editor";

interface IngredientOption {
  name: string;
  unit: string;
}

interface InstructionRow {
  text: string;
  note: string;
}

interface InstructionFieldListProps {
  instructions: InstructionRow[];
  ingredients: IngredientOption[];
  onChange: (instructions: InstructionRow[]) => void;
}

export function InstructionFieldList({
  instructions,
  ingredients,
  onChange,
}: InstructionFieldListProps) {
  function updateRow(index: number, field: keyof InstructionRow, value: string) {
    const updated = instructions.map((row, i) =>
      i === index ? { ...row, [field]: value } : row,
    );
    onChange(updated);
  }

  function addRow() {
    onChange([...instructions, { text: "", note: "" }]);
  }

  function removeRow(index: number) {
    onChange(instructions.filter((_, i) => i !== index));
  }

  return (
    <div className="mt-4 space-y-6">
      {instructions.map((row, index) => (
        <InstructionRowComponent
          key={index}
          index={index}
          text={row.text}
          note={row.note}
          ingredients={ingredients}
          onChangeText={(value) => updateRow(index, "text", value)}
          onChangeNote={(value) => updateRow(index, "note", value)}
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

function InstructionRowComponent({
  index,
  text,
  note,
  ingredients,
  onChangeText,
  onChangeNote,
  onRemove,
}: {
  index: number;
  text: string;
  note: string;
  ingredients: IngredientOption[];
  onChangeText: (value: string) => void;
  onChangeNote: (value: string) => void;
  onRemove?: () => void;
}) {
  const [showNote, setShowNote] = useState(note.length > 0);
  const insertIngredientRef = useRef<((name: string) => void) | null>(null);
  const namedIngredients = ingredients.filter((i) => i.name.trim().length > 0);

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start justify-between">
        <div className="flex flex-1 gap-3">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-surface">
            {index + 1}
          </span>
          <div className="flex-1">
            <InstructionEditor
              value={text}
              ingredients={ingredients}
              placeholder={`Step ${index + 1}`}
              onChange={onChangeText}
              onEditorReady={(fn) => { insertIngredientRef.current = fn; }}
            />
            <input type="hidden" name="instruction-text" value={text} />
          </div>
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-3 text-sm text-muted transition-colors hover:text-foreground"
            aria-label="Remove step"
          >
            &times;
          </button>
        )}
      </div>
      <div className="mt-2 ml-10 flex gap-3">
        {namedIngredients.length > 0 && (
          <IngredientInserter
            ingredients={namedIngredients}
            onInsert={(name) => insertIngredientRef.current?.(name)}
          />
        )}
        {!showNote && (
          <button
            type="button"
            onClick={() => setShowNote(true)}
            className="rounded-md px-2.5 py-1 text-xs text-muted transition-colors hover:text-foreground"
          >
            + Add Note
          </button>
        )}
      </div>
      {showNote && (
        <div className="mt-3 ml-10 border-l-2 border-secondary/30 pl-3">
          <label className="block text-xs font-medium text-muted">Note</label>
          <div className="mt-1">
            <RichTextEditor
              name="instruction-note"
              value={note}
              placeholder="Tip or note for this step..."
              onChange={onChangeNote}
            />
          </div>
        </div>
      )}
      {!showNote && <input type="hidden" name="instruction-note" value="" />}
    </div>
  );
}
