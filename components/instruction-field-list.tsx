"use client";

interface InstructionFieldListProps {
  instructions: string[];
  onChange: (instructions: string[]) => void;
}

export function InstructionFieldList({
  instructions,
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
    <div className="mt-4 space-y-3">
      {instructions.map((text, index) => (
        <div key={index} className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-surface">
            {index + 1}
          </span>
          <textarea
            name="instruction-text"
            placeholder={`Step ${index + 1}`}
            value={text}
            onChange={(e) => updateRow(index, e.target.value)}
            required
            rows={2}
            className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {instructions.length > 1 && (
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="self-start rounded-md border border-border px-2 py-2 text-sm text-muted transition-colors hover:bg-border hover:text-foreground"
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
        + Add Step
      </button>
    </div>
  );
}
