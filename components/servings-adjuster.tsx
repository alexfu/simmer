"use client";

interface ServingsAdjusterProps {
  servings: number;
  onChange: (servings: number) => void;
}

export function ServingsAdjuster({ servings, onChange }: ServingsAdjusterProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-foreground">Servings</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(1, servings - 1))}
          disabled={servings <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors hover:bg-border disabled:opacity-40 disabled:cursor-not-allowed"
        >
          &minus;
        </button>
        <span className="w-8 text-center font-medium text-foreground">
          {servings}
        </span>
        <button
          onClick={() => onChange(servings + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors hover:bg-border"
        >
          +
        </button>
      </div>
    </div>
  );
}
