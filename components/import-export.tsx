"use client";

import { useRef, useState } from "react";
import { exportRecipes } from "@/app/settings/export-action";
import { importRecipes, type ImportResult } from "@/app/settings/import-action";

export function ImportExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    setIsExporting(true);
    setResult(null);

    try {
      const json = await exportRecipes();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `simmer-recipes-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }

  async function handleImport(file: File) {
    setIsImporting(true);
    setResult(null);

    try {
      const text = await file.text();
      const res = await importRecipes(text);
      setResult(res);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h2 className="font-serif text-xl font-semibold text-foreground">
        Import & Export
      </h2>
      <p className="mt-2 text-sm text-muted">
        Export all recipes as JSON or import from a previously exported file.
      </p>

      {result && (
        <div
          className={`mt-4 rounded-lg border p-4 text-sm ${
            result.success
              ? "border-secondary/30 bg-secondary/5 text-secondary"
              : "border-primary/30 bg-primary/5 text-primary"
          }`}
        >
          {result.message}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="flex-1 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed sm:flex-none"
        >
          {isExporting ? "Exporting..." : "Export Recipes"}
        </button>

        <label className="flex-1 sm:flex-none">
          <span
            className={`block cursor-pointer rounded-lg border border-border px-6 py-3 text-center text-sm font-medium text-foreground transition-colors hover:bg-border ${
              isImporting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isImporting ? "Importing..." : "Import Recipes"}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            disabled={isImporting}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImport(file);
            }}
          />
        </label>
      </div>
    </div>
  );
}
