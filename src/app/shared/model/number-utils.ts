/** True if the string is a number in JSON notation (decimal point, no comma, not blank). */
export function isNumericString(p: string): boolean {
  return p.trim() !== '' && Number.isFinite(Number(p.trim()));
}

/** Value of a number input: undefined if empty/invalid (for optional fields). */
export function optionalNumber(input: HTMLInputElement): number | undefined {
  const n = input.valueAsNumber;
  return Number.isFinite(n) ? n : undefined;
}
