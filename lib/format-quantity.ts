import { toVulgar } from "vulgar-fractions";
import { parseQuantityExpression } from "@/lib/parse-quantity";

export function formatQuantity(
  quantity: number | string,
  scale: number,
): string {
  const parsed =
    typeof quantity === "number"
      ? quantity
      : parseQuantityExpression(String(quantity));
  const value = (parsed ?? 0) * scale;

  if (value <= 0) {
    return "0";
  }

  const whole = Math.floor(value);
  const decimal = value - whole;

  if (decimal < 0.01) {
    return whole.toString();
  }

  const fraction = toVulgar(decimal);
  const isFraction = fraction !== String(decimal);

  if (isFraction) {
    return whole > 0 ? `${whole} ${fraction}` : fraction;
  }

  return parseFloat(value.toFixed(2)).toString();
}
