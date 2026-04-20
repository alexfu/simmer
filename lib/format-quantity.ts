const FRACTIONS: [number, string][] = [
  [1 / 8, "\u215B"],
  [1 / 4, "\u00BC"],
  [1 / 3, "\u2153"],
  [3 / 8, "\u215C"],
  [1 / 2, "\u00BD"],
  [5 / 8, "\u215D"],
  [2 / 3, "\u2154"],
  [3 / 4, "\u00BE"],
  [7 / 8, "\u215E"],
];

const FRACTION_TOLERANCE = 0.05;

function closestFraction(decimal: number): string | null {
  for (const [value, symbol] of FRACTIONS) {
    if (Math.abs(decimal - value) < FRACTION_TOLERANCE) {
      return symbol;
    }
  }
  return null;
}

export function formatQuantity(quantity: number | string, scale: number): string {
  const value = Number(quantity) * scale;

  if (value <= 0) {
    return "0";
  }

  const whole = Math.floor(value);
  const decimal = value - whole;

  if (decimal < FRACTION_TOLERANCE) {
    return whole.toString();
  }

  const fraction = closestFraction(decimal);

  if (fraction) {
    return whole > 0 ? `${whole} ${fraction}` : fraction;
  }

  return parseFloat(value.toFixed(2)).toString();
}
