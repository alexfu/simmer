interface InstructionItem {
  id: string;
  step: number;
  text: string;
}

interface InstructionListProps {
  instructions: InstructionItem[];
}

export function InstructionList({ instructions }: InstructionListProps) {
  return (
    <ol className="mt-4 space-y-4">
      {instructions.map((instruction) => (
        <li key={instruction.id} className="flex gap-4">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-surface">
            {instruction.step}
          </span>
          <p className="pt-0.5 text-foreground">{instruction.text}</p>
        </li>
      ))}
    </ol>
  );
}
