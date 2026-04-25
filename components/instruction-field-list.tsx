"use client";

import { useId, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  InstructionEditor,
  IngredientInserter,
} from "@/components/instruction-editor";
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
  const dndId = useId();

  // Generate stable IDs for sortable items
  const [itemIds] = useState(() => instructions.map(() => uuidv4()));

  // Keep IDs in sync with instruction count
  while (itemIds.length < instructions.length) {
    itemIds.push(uuidv4());
  }
  while (itemIds.length > instructions.length) {
    itemIds.pop();
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = itemIds.indexOf(active.id as string);
    const newIndex = itemIds.indexOf(over.id as string);

    const newInstructions = [...instructions];
    const [moved] = newInstructions.splice(oldIndex, 1);
    newInstructions.splice(newIndex, 0, moved);

    const [movedId] = itemIds.splice(oldIndex, 1);
    itemIds.splice(newIndex, 0, movedId);

    onChange(newInstructions);
  }

  function updateRow(
    index: number,
    field: keyof InstructionRow,
    value: string,
  ) {
    const updated = instructions.map((row, i) =>
      i === index ? { ...row, [field]: value } : row,
    );
    onChange(updated);
  }

  function addRow() {
    itemIds.push(uuidv4());
    onChange([...instructions, { text: "", note: "" }]);
  }

  function removeRow(index: number) {
    itemIds.splice(index, 1);
    onChange(instructions.filter((_, i) => i !== index));
  }

  return (
    <div className="mt-4 space-y-6">
      <DndContext
        id={dndId}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {instructions.map((row, index) => (
            <SortableInstructionRow
              key={itemIds[index]}
              id={itemIds[index]}
              index={index}
              text={row.text}
              note={row.note}
              ingredients={ingredients}
              onChangeText={(value) => updateRow(index, "text", value)}
              onChangeNote={(value) => updateRow(index, "note", value)}
              onRemove={
                instructions.length > 1 ? () => removeRow(index) : undefined
              }
            />
          ))}
        </SortableContext>
      </DndContext>
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

function SortableInstructionRow({
  id,
  index,
  text,
  note,
  ingredients,
  onChangeText,
  onChangeNote,
  onRemove,
}: {
  id: string;
  index: number;
  text: string;
  note: string;
  ingredients: IngredientOption[];
  onChangeText: (value: string) => void;
  onChangeNote: (value: string) => void;
  onRemove?: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [showNote, setShowNote] = useState(note.length > 0);
  const insertIngredientRef = useRef<((name: string) => void) | null>(null);
  const namedIngredients = ingredients.filter((i) => i.name.trim().length > 0);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border border-border bg-surface p-4 ${
        isDragging ? "z-10 shadow-lg opacity-90" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-1 gap-3">
          {/* Drag handle */}
          <button
            type="button"
            className="mt-1 flex cursor-grab touch-none flex-col items-center gap-0.5 text-muted active:cursor-grabbing"
            aria-label="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="9" cy="6" r="1.5" />
              <circle cx="15" cy="6" r="1.5" />
              <circle cx="9" cy="12" r="1.5" />
              <circle cx="15" cy="12" r="1.5" />
              <circle cx="9" cy="18" r="1.5" />
              <circle cx="15" cy="18" r="1.5" />
            </svg>
          </button>
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-surface">
            {index + 1}
          </span>
          <div className="flex-1">
            <InstructionEditor
              value={text}
              ingredients={ingredients}
              placeholder={`Step ${index + 1}`}
              onChange={onChangeText}
              onEditorReady={(fn) => {
                insertIngredientRef.current = fn;
              }}
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
      <div className="mt-2 ml-16 flex gap-3">
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
        <div className="mt-3 ml-16 border-l-2 border-secondary/30 pl-3">
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
