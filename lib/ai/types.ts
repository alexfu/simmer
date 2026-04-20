export interface ExtractedRecipe {
  title: string;
  description: string | null;
  servings: number;
  ingredients: { name: string; quantity: number; unit: string }[];
  instructions: { text: string }[];
}
