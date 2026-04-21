"use client";

import { useActionState, useState } from "react";
import { IngredientFieldList } from "@/components/ingredient-field-list";
import { InstructionFieldList } from "@/components/instruction-field-list";

interface FormState {
  errors: string[];
}

interface IngredientRow {
  name: string;
  quantity: string;
  unit: string;
}

interface RecipeFormProps {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  initialData?: {
    title: string;
    description: string | null;
    servings: number;
    ingredients: { name: string; quantity: number; unit: string }[];
    instructions: { text: string }[];
  };
}

const inputClassName =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

export function RecipeForm({ action, initialData }: RecipeFormProps) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    action,
    { errors: [] },
  );

  const [ingredients, setIngredients] = useState<IngredientRow[]>(
    initialData
      ? initialData.ingredients.map((i) => ({
          name: i.name,
          quantity: i.quantity.toString(),
          unit: i.unit,
        }))
      : [{ name: "", quantity: "", unit: "" }],
  );

  const [instructions, setInstructions] = useState<string[]>(
    initialData
      ? initialData.instructions.map((i) => i.text)
      : [""],
  );

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

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-foreground">
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
          <label htmlFor="description" className="block text-sm font-medium text-foreground">
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
          <label htmlFor="servings" className="block text-sm font-medium text-foreground">
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
          ingredients={ingredients.map((i) => ({ name: i.name, unit: i.unit }))}
          onChange={setInstructions}
        />
      </section>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-surface transition-colors hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Saving..." : "Save Recipe"}
      </button>
    </form>
  );
}
