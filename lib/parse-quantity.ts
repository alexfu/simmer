import { evaluate } from "mathjs";

/**
 * Evaluates an arithmetic expression into a number.
 *
 * Supports standard math: +, -, *, /, parentheses, fractions.
 * Examples: "1/4", "1+1/4", "2*3", "(1+2)/3"
 */
export function parseQuantityExpression(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    const result = evaluate(trimmed);
    if (typeof result !== "number" || !Number.isFinite(result) || result < 0) {
      return null;
    }
    return result;
  } catch {
    return null;
  }
}
