"use client";

import { useRef, useState } from "react";
import { RecipeForm } from "@/components/recipe-form";
import { createRecipe } from "@/app/recipe/new/actions";
import type { ExtractedRecipe, DiagnosticLog } from "@/lib/ai/types";

type InputMode = "file" | "text";

interface Phase {
  key: string;
  label: string;
}

function downloadDiagnosticLog(log: DiagnosticLog) {
  const blob = new Blob([JSON.stringify(log, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `simmer-import-log-${log.timestamp.slice(0, 19).replace(/:/g, "-")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

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
  const [mode, setMode] = useState<InputMode>("file");
  const [diagnostics, setDiagnostics] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [currentPhase, setCurrentPhase] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<ExtractedRecipe | null>(null);
  const [diagnosticLog, setDiagnosticLog] = useState<DiagnosticLog | null>(
    null,
  );

  async function handleImport(formData: FormData) {
    setIsImporting(true);
    setCurrentPhase(null);
    setErrors([]);

    formData.set("mode", mode);
    formData.set("diagnostics", String(diagnostics));

    try {
      const response = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const reader = response.body?.getReader();
      if (!reader) {
        setErrors(["Failed to connect to import service."]);
        setIsImporting(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line);

          if (event.type === "phases") {
            setPhases(event.phases);
          } else if (event.type === "progress") {
            setCurrentPhase(event.phase);
          } else if (event.type === "result") {
            setResult(event.data);
            setDiagnosticLog(event.diagnosticLog ?? null);
          } else if (event.type === "error") {
            setErrors([event.message]);
          }
        }
      }
    } catch {
      setErrors(["Import failed. Please try again."]);
    }

    setIsImporting(false);
  }

  if (result) {
    return (
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-secondary">
            Recipe extracted. Review and edit before saving.
          </p>
          <div className="flex gap-3">
            {diagnosticLog && (
              <button
                onClick={() => downloadDiagnosticLog(diagnosticLog)}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                Download Log
              </button>
            )}
            <button
              onClick={onReset}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              Start over
            </button>
          </div>
        </div>
        <RecipeForm action={createRecipe} initialData={result} />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
        <button
          type="button"
          onClick={() => setMode("file")}
          disabled={isImporting}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            mode === "file"
              ? "bg-primary text-surface"
              : "text-muted hover:text-foreground"
          }`}
        >
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setMode("text")}
          disabled={isImporting}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            mode === "text"
              ? "bg-primary text-surface"
              : "text-muted hover:text-foreground"
          }`}
        >
          Paste Text
        </button>
      </div>

      {errors.length > 0 && (
        <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <ul className="space-y-1 text-sm text-primary">
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {isImporting && (
        <div className="mt-6">
          <ImportProgress phases={phases} currentPhase={currentPhase} />
        </div>
      )}

      {!isImporting && (
        <>
          {mode === "file" ? (
            <FileUpload
              onSubmit={handleImport}
              diagnostics={diagnostics}
              onDiagnosticsChange={setDiagnostics}
            />
          ) : (
            <TextInput
              onSubmit={handleImport}
              diagnostics={diagnostics}
              onDiagnosticsChange={setDiagnostics}
            />
          )}
        </>
      )}
    </div>
  );
}

function ImportProgress({
  phases,
  currentPhase,
}: {
  phases: Phase[];
  currentPhase: string | null;
}) {
  const currentIndex = phases.findIndex((p) => p.key === currentPhase);

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="space-y-3">
        {phases.map((phase, index) => {
          const isComplete = currentIndex > index;
          const isCurrent = currentIndex === index;
          const isPending = currentIndex < index;

          return (
            <div key={phase.key} className="flex items-center gap-3">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                  isComplete
                    ? "bg-secondary text-surface"
                    : isCurrent
                      ? "bg-primary text-surface"
                      : "bg-border text-muted"
                }`}
              >
                {isComplete ? (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`text-sm ${
                  isComplete
                    ? "text-secondary"
                    : isCurrent
                      ? "font-medium text-foreground"
                      : isPending
                        ? "text-muted"
                        : ""
                }`}
              >
                {phase.label}
                {isCurrent && (
                  <svg
                    className="ml-2 inline-block h-4 w-4 animate-spin text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FileUpload({
  onSubmit,
  diagnostics,
  onDiagnosticsChange,
}: {
  onSubmit: (formData: FormData) => void;
  diagnostics: boolean;
  onDiagnosticsChange: (value: boolean) => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-16 transition-colors ${
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
        <input
          ref={fileInputRef}
          type="file"
          name="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf,image/*,application/pdf"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setFileName(file?.name ?? null);
          }}
        />
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
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-medium text-surface transition-colors hover:bg-primary-hover sm:w-auto"
        >
          Import
        </button>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={diagnostics}
            onChange={(e) => onDiagnosticsChange(e.target.checked)}
            className="accent-primary"
          />
          <span className="text-sm text-muted">Enable diagnostic log</span>
        </label>
      </div>
    </form>
  );
}

function TextInput({
  onSubmit,
  diagnostics,
  onDiagnosticsChange,
}: {
  onSubmit: (formData: FormData) => void;
  diagnostics: boolean;
  onDiagnosticsChange: (value: boolean) => void;
}) {
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData();
    formData.set("text", text);
    onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        name="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your recipe text here..."
        rows={12}
        className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={!text.trim()}
          className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-medium text-surface transition-colors hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
        >
          Import
        </button>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={diagnostics}
            onChange={(e) => onDiagnosticsChange(e.target.checked)}
            className="accent-primary"
          />
          <span className="text-sm text-muted">Enable diagnostic log</span>
        </label>
      </div>
    </form>
  );
}
