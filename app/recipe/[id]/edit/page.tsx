import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecipeForm } from "@/components/recipe-form";
import { updateRecipe } from "@/app/recipe/[id]/edit/actions";
import { DeleteRecipeButton } from "@/components/delete-recipe-button";

interface EditRecipePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: true,
      instructions: { orderBy: { step: "asc" } },
    },
  });

  if (!recipe) {
    notFound();
  }

  const initialData = {
    title: recipe.title,
    description: recipe.description,
    notes: recipe.notes,
    imageUrl: recipe.imageUrl,
    servings: recipe.servings,
    ingredients: recipe.ingredients.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
    })),
    instructions: recipe.instructions.map((i) => ({
      text: i.text,
      note: i.note,
    })),
  };

  const action = updateRecipe.bind(null, id);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="font-serif text-3xl font-bold text-foreground">
        Edit Recipe
      </h1>
      <RecipeForm action={action} initialData={initialData} />
      <div className="mt-8 border-t border-border pt-8">
        <DeleteRecipeButton recipeId={id} />
      </div>
    </main>
  );
}
