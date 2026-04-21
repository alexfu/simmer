export interface ExtractedRecipe {
  title: string;
  description: string | null;
  servings: number;
  ingredients: { name: string; quantity: string; unit: string }[];
  instructions: { text: string }[];
}
