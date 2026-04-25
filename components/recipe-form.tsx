"use client";

import { useActionState, useMemo, useState } from "react";
import { IngredientFieldList } from "@/components/ingredient-field-list";
import { InstructionFieldList } from "@/components/instruction-field-list";
import { RichTextEditor } from "@/components/rich-text-editor";
import { ImageUpload } from "@/components/image-upload";
import { parseInstructionTags } from "@/lib/parse-instruction-tags";

interface FormState {
  errors: string[];
}

interface IngredientRow {
  name: string;
  quantity: string;
  unit: string;
}

interface InstructionRow {
  text: string;
  note: string;
}

interface RecipeFormProps {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  initialData?: {
    title: string;
    description: string | null;
    notes: string | null;
    imageUrl: string | null;
    servings: number;
    ingredients: { name: string; quantity: string; unit: string }[];
    instructions: { text: string; note?: string | null }[];
  };
}

const inputClassName =
  "w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

export function RecipeForm({ action, initialData }: RecipeFormProps) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    action,
    { errors: [] },
  );

  const [ingredients, setIngredients] = useState<IngredientRow[]>(
    initialData
      ? initialData.ingredients.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
        }))
      : [{ name: "", quantity: "", unit: "" }],
  );

  const [instructions, setInstructions] = useState<InstructionRow[]>(
    initialData
      ? initialData.instructions.map((i) => ({
          text: i.text,
          note: i.note ?? "",
        }))
      : [{ text: "", note: "" }],
  );

  const [recipeNotes, setRecipeNotes] = useState(initialData?.notes ?? "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? null);

  const unreferencedIngredients = useMemo(() => {
    const referencedNames = new Set<string>();
    for (const inst of instructions) {
      const segments = parseInstructionTags(inst.text);
      for (const seg of segments) {
        if (seg.type === "ingredient") {
          referencedNames.add(seg.name.toLowerCase());
        }
      }
    }
    return ingredients
      .filter((i) => i.name.trim().length > 0)
      .filter((i) => !referencedNames.has(i.name.toLowerCase()));
  }, [ingredients, instructions]);

  return (
    <form action={formAction} className="mt-8 space-y-8">
      {state.errors.length > 0 && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <ul className="space-y-1 text-sm text-primary">
            {state.errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <section>
        <ImageUpload value={imageUrl} onChange={setImageUrl} />
        <input type="hidden" name="imageUrl" value={imageUrl ?? ""} />
      </section>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-foreground"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            name="title"
            required
            defaultValue={initialData?.title ?? ""}
            className={`mt-1 ${inputClassName}`}
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-foreground"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={initialData?.description ?? ""}
            className={`mt-1 ${inputClassName}`}
          />
        </div>

        <div>
          <label
            htmlFor="servings"
            className="block text-sm font-medium text-foreground"
          >
            Servings
          </label>
          <input
            id="servings"
            type="number"
            name="servings"
            min="1"
            defaultValue={initialData?.servings ?? 1}
            required
            className={`mt-1 w-24 ${inputClassName}`}
          />
        </div>
      </div>

      <section>
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Ingredients
        </h2>
        <IngredientFieldList
          ingredients={ingredients}
          onChange={setIngredients}
        />
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Instructions
        </h2>
        <InstructionFieldList
          instructions={instructions}
          ingredients={ingredients.map((i) => ({
            name: i.name,
            unit: i.unit,
            quantity: i.quantity,
          }))}
          onChange={setInstructions}
        />
      </section>

      {unreferencedIngredients.length > 0 && (
        <div className="flex gap-3 rounded-lg bg-secondary/10 px-4 py-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 shrink-0 text-secondary"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <div>
            <p className="text-sm font-medium text-foreground">
              Some ingredients aren&apos;t referenced in instructions
            </p>
            <ul className="mt-2 list-disc space-y-0.5 pl-4 text-sm text-foreground">
              {unreferencedIngredients.map((ing, i) => (
                <li key={i}>{ing.name}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <section>
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Notes
        </h2>
        <div className="mt-4">
          <RichTextEditor
            name="recipe-notes"
            value={recipeNotes}
            placeholder="General tips, variations, or notes about this recipe..."
            onChange={setRecipeNotes}
          />
        </div>
      </section>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-medium text-surface transition-colors hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
      >
        {isPending ? "Saving..." : "Save Recipe"}
      </button>
    </form>
  );
}
