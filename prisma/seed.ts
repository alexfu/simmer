import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.recipe.deleteMany();

  await prisma.recipe.create({
    data: {
      title: "Classic Tomato Soup",
      description:
        "A rich, velvety tomato soup with fresh basil and a hint of cream.",
      servings: 4,
      ingredients: {
        create: [
          { name: "Roma tomatoes", quantity: "8", unit: "whole" },
          { name: "Onion", quantity: "1", unit: "whole" },
          { name: "Garlic", quantity: "3", unit: "cloves" },
          { name: "Olive oil", quantity: "2", unit: "tbsp" },
          { name: "Vegetable broth", quantity: "2", unit: "cups" },
          { name: "Heavy cream", quantity: "1/4", unit: "cup" },
          { name: "Fresh basil", quantity: "1/4", unit: "cup" },
          { name: "Salt", quantity: "1", unit: "tsp" },
          { name: "Black pepper", quantity: "1/2", unit: "tsp" },
        ],
      },
      instructions: {
        create: [
          { step: 1, text: "Preheat oven to 400°F (200°C)." },
          {
            step: 2,
            text: "Halve the tomatoes, toss with olive oil, and roast for 25 minutes.",
          },
          {
            step: 3,
            text: "Sauté diced onion and garlic in a pot until softened.",
          },
          {
            step: 4,
            text: "Add roasted tomatoes and broth. Simmer for 15 minutes.",
          },
          { step: 5, text: "Blend until smooth. Stir in cream and basil." },
          { step: 6, text: "Season with salt and pepper. Serve warm." },
        ],
      },
    },
  });

  await prisma.recipe.create({
    data: {
      title: "Garlic Butter Pasta",
      description:
        "Simple yet satisfying pasta tossed in golden garlic butter with parmesan.",
      servings: 2,
      ingredients: {
        create: [
          { name: "Spaghetti", quantity: "200", unit: "g" },
          { name: "Butter", quantity: "3", unit: "tbsp" },
          { name: "Garlic", quantity: "4", unit: "cloves" },
          { name: "Parmesan cheese", quantity: "1/2", unit: "cup" },
          { name: "Red pepper flakes", quantity: "1/4", unit: "tsp" },
          { name: "Fresh parsley", quantity: "2", unit: "tbsp" },
          { name: "Salt", quantity: "1", unit: "tsp" },
        ],
      },
      instructions: {
        create: [
          {
            step: 1,
            text: "Cook spaghetti in salted boiling water until al dente. Reserve 1 cup pasta water.",
          },
          {
            step: 2,
            text: "Melt butter in a large pan over medium heat. Add thinly sliced garlic and cook until golden.",
          },
          {
            step: 3,
            text: "Add red pepper flakes, then toss in the drained pasta.",
          },
          {
            step: 4,
            text: "Add pasta water a splash at a time, tossing until glossy.",
          },
          {
            step: 5,
            text: "Remove from heat, toss with parmesan and parsley. Serve immediately.",
          },
        ],
      },
    },
  });

  await prisma.recipe.create({
    data: {
      title: "Blueberry Pancakes",
      description: "Fluffy buttermilk pancakes studded with fresh blueberries.",
      servings: 6,
      ingredients: {
        create: [
          { name: "All-purpose flour", quantity: "1+1/2", unit: "cups" },
          { name: "Buttermilk", quantity: "1+1/4", unit: "cups" },
          { name: "Egg", quantity: "1", unit: "whole" },
          { name: "Sugar", quantity: "2", unit: "tbsp" },
          { name: "Baking powder", quantity: "1+1/2", unit: "tsp" },
          { name: "Baking soda", quantity: "1/2", unit: "tsp" },
          { name: "Salt", quantity: "1/4", unit: "tsp" },
          { name: "Butter (melted)", quantity: "2", unit: "tbsp" },
          { name: "Fresh blueberries", quantity: "1", unit: "cup" },
        ],
      },
      instructions: {
        create: [
          {
            step: 1,
            text: "Whisk flour, sugar, baking powder, baking soda, and salt in a bowl.",
          },
          {
            step: 2,
            text: "In another bowl, mix buttermilk, egg, and melted butter.",
          },
          {
            step: 3,
            text: "Combine wet and dry ingredients. Fold in blueberries. Don't overmix.",
          },
          {
            step: 4,
            text: "Pour ¼ cup batter per pancake onto a buttered griddle over medium heat.",
          },
          {
            step: 5,
            text: "Cook until bubbles form on the surface, flip, and cook until golden.",
          },
        ],
      },
    },
  });

  console.log("Seeded 3 recipes.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
