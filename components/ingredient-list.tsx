import { formatQuantity } from "@/lib/format-quantity";

interface IngredientItem {
  id: string;
  name: string;
  quantity: number | string;
  unit: string;
}

interface IngredientListProps {
  ingredients: IngredientItem[];
  scale: number;
}

export function IngredientList({ ingredients, scale }: IngredientListProps) {
  return (
    <ul className="mt-4 space-y-3">
      {ingredients.map((ingredient) => (
        <li
          key={ingredient.id}
          className="flex items-baseline gap-2 border-b border-border/50 pb-3 text-foreground last:border-0 last:pb-0"
        >
          <span className="font-medium">
            {formatQuantity(ingredient.quantity, scale)}
          </span>
          <span className="text-muted">{ingredient.unit}</span>
          <span>{ingredient.name}</span>
        </li>
      ))}
    </ul>
  );
}
