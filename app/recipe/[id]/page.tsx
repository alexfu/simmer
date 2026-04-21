import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecipeDetail } from "@/components/recipe-detail";

interface RecipePageProps {
  params: Promise<{ id: string }>;
}

export default async function RecipePage({ params }: RecipePageProps) {
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

  const serializedRecipe = {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    notes: recipe.notes,
    imageUrl: recipe.imageUrl,
    servings: recipe.servings,
    ingredients: recipe.ingredients.map((i) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
    })),
    instructions: recipe.instructions.map((i) => ({
      id: i.id,
      step: i.step,
      text: i.text,
      note: i.note,
    })),
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <RecipeDetail recipe={serializedRecipe} />
    </main>
  );
}
