"use client";

import { useOptimistic, useTransition } from "react";
import { setTimeRating } from "@/app/recipe/[id]/actions";

type TimeRatingValue = "quick" | "medium" | "involved";

interface TimeRatingProps {
  recipeId: string;
  value: TimeRatingValue | null;
}

interface TimeRatingBadgeProps {
  value: TimeRatingValue;
}

const RATINGS: {
  value: TimeRatingValue;
  label: string;
  description: string;
}[] = [
  { value: "quick", label: "Quick", description: "Under 30 min" },
  { value: "medium", label: "Medium", description: "30–60 min" },
  { value: "involved", label: "Involved", description: "60+ min" },
];

export function TimeRatingBadge({ value }: TimeRatingBadgeProps) {
  const rating = RATINGS.find((r) => r.value === value);
  if (!rating) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1 text-sm text-secondary">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      {rating.label} · {rating.description}
    </span>
  );
}

export function TimeRating({ recipeId, value }: TimeRatingProps) {
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const [, startTransition] = useTransition();

  function handleSelect(rating: TimeRatingValue) {
    const newValue = optimisticValue === rating ? null : rating;
    startTransition(async () => {
      setOptimisticValue(newValue);
      await setTimeRating(recipeId, newValue);
    });
  }

  return (
    <div className="flex gap-2">
      {RATINGS.map((rating) => {
        const isSelected = optimisticValue === rating.value;
        return (
          <button
            key={rating.value}
            type="button"
            onClick={() => handleSelect(rating.value)}
            className={`flex flex-col items-center rounded-lg border px-4 py-2.5 text-center transition-colors ${
              isSelected
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-surface text-muted hover:border-primary/40 hover:text-foreground"
            }`}
          >
            <span className="text-sm font-medium">{rating.label}</span>
            <span className="mt-0.5 text-xs">{rating.description}</span>
          </button>
        );
      })}
    </div>
  );
}
