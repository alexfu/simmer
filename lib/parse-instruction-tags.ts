export type InstructionSegment =
  | { type: "text"; value: string }
  | { type: "ingredient"; name: string; quantity: number };

const TAG_PATTERN = /\{\{([^|]+)\|([^}]+)\}\}/g;

export function parseInstructionTags(text: string): InstructionSegment[] {
  const segments: InstructionSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(TAG_PATTERN)) {
    const matchIndex = match.index!;

    if (matchIndex > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, matchIndex) });
    }

    segments.push({
      type: "ingredient",
      name: match[1].trim(),
      quantity: parseFloat(match[2]),
    });

    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments;
}

export function buildIngredientTag(name: string, quantity: number): string {
  return `{{${name}|${quantity}}}`;
}
