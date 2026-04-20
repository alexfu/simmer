"use client";

import { useActionState, useRef, useState } from "react";
import { RecipeForm } from "@/components/recipe-form";
import { extractRecipe, type ImportState } from "@/app/recipe/import/actions";
import { createRecipe } from "@/app/recipe/new/actions";

export function RecipeImport() {
  const [resetKey, setResetKey] = useState(0);

  return (
    <RecipeImportInner
      key={resetKey}
      onReset={() => setResetKey((k) => k + 1)}
    />
  );
}

function RecipeImportInner({ onReset }: { onReset: () => void }) {
  const [state, formAction, isPending] = useActionState<ImportState, FormData>(
    extractRecipe,
    { status: "idle", errors: [], data: null },
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (state.status === "success" && state.data) {
    return (
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-secondary">
            Recipe extracted. Review and edit before saving.
          </p>
          <button
            onClick={onReset}
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Start over
          </button>
        </div>
        <RecipeForm action={createRecipe} initialData={state.data} />
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8">
      {state.errors.length > 0 && (
        <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <ul className="space-y-1 text-sm text-primary">
            {state.errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <label
        htmlFor="file"
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-16 transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-surface hover:border-primary/40 hover:bg-primary/5"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file && fileInputRef.current) {
            const dt = new DataTransfer();
            dt.items.add(file);
            fileInputRef.current.files = dt.files;
            setFileName(file.name);
          }
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="mt-3 text-sm font-medium text-foreground">
          {fileName ?? "Choose a file or drag it here"}
        </p>
        <p className="mt-1 text-xs text-muted">
          JPEG, PNG, WebP, or PDF (max 10MB)
        </p>
        <input
          ref={fileInputRef}
          id="file"
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setFileName(file?.name ?? null);
          }}
        />
      </label>

      <button
        type="submit"
        disabled={isPending || !fileName}
        className="mt-6 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-surface transition-colors hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Extracting recipe..." : "Extract Recipe"}
      </button>
    </form>
  );
}
