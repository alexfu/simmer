import {
  parseInstructionTags,
  type InstructionSegment,
} from "@/lib/parse-instruction-tags";
import { formatQuantity } from "@/lib/format-quantity";
import { RichTextDisplay } from "@/components/rich-text-display";

interface IngredientInfo {
  name: string;
  quantity: number | string;
  unit: string;
}

interface InstructionItem {
  id: string;
  step: number;
  text: string;
  note?: string | null;
}

interface InstructionListProps {
  instructions: InstructionItem[];
  ingredients: IngredientInfo[];
  scale: number;
}

export function InstructionList({
  instructions,
  ingredients,
  scale,
}: InstructionListProps) {
  return (
    <ol className="mt-4 space-y-6">
      {instructions.map((instruction) => {
        const segments = parseInstructionTags(instruction.text);

        return (
          <li key={instruction.id} className="flex gap-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-surface">
              {instruction.step}
            </span>
            <div className="pt-0.5">
              <p className="text-foreground">
                {segments.map((segment, i) => (
                  <InstructionSegmentView
                    key={i}
                    segment={segment}
                    ingredients={ingredients}
                    scale={scale}
                  />
                ))}
              </p>
              {instruction.note && (
                <div className="mt-2 rounded-lg bg-secondary/10 px-3 py-2.5">
                  <p className="text-xs font-medium text-secondary">Notes</p>
                  <div className="mt-1">
                    <RichTextDisplay html={instruction.note} />
                  </div>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function InstructionSegmentView({
  segment,
  ingredients,
  scale,
}: {
  segment: InstructionSegment;
  ingredients: IngredientInfo[];
  scale: number;
}) {
  if (segment.type === "text") {
    return <>{segment.value}</>;
  }

  const ingredient = ingredients.find(
    (ing) => ing.name.toLowerCase() === segment.name.toLowerCase(),
  );
  const quantity = ingredient?.quantity ?? "1";
  const unit = ingredient?.unit ?? "";
  const scaled = formatQuantity(quantity, scale);

  return (
    <span className="inline-flex items-baseline gap-1 rounded bg-secondary/10 px-1.5 py-0.5 text-sm font-medium text-secondary">
      {scaled} {unit} {segment.name}
    </span>
  );
}
