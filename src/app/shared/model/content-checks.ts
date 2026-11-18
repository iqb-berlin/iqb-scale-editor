import { ValidationIssue } from './schema-validation';

/**
 * Content checks beyond the JSON schema shared by all scale types (DEC-014).
 * All functions are robust against schema-invalid input (they skip what they can't check).
 */

/** Error if the value is a string that is empty or whitespace only. */
export function checkNonEmptyString(value: unknown, path: string, label: string): ValidationIssue[] {
  return typeof value === 'string' && value.trim() === '' ? [{ path, message: `${label} ist leer` }] : [];
}

/** Errors for empty entries in a list of strings. */
export function checkNonEmptyStrings(values: unknown, path: string, label: string): ValidationIssue[] {
  if (!Array.isArray(values)) return [];
  return values.flatMap((v, i) => checkNonEmptyString(v, `${path}/${i}`, `${label} ${i + 1}`));
}

/** Errors for empty texts and duplicate languages in a language tagged text. */
export function checkLanguageTaggedText(text: unknown, path: string, label: string): ValidationIssue[] {
  if (!Array.isArray(text)) return [];
  const issues: ValidationIssue[] = [];
  const seen = new Set<string>();
  text.forEach((entry: { lang?: unknown; value?: unknown }, i) => {
    if (!entry || typeof entry !== 'object') return;
    issues.push(...checkNonEmptyString(entry.value, `${path}/${i}/value`, `${label} (${entry.lang || '?'})`));
    if (typeof entry.lang === 'string' && entry.lang !== '') {
      if (seen.has(entry.lang)) {
        issues.push({ path: `${path}/${i}/lang`, message: `${label}: Sprache "${entry.lang}" ist doppelt` });
      }
      seen.add(entry.lang);
    }
  });
  return issues;
}

/** Combines several results; valid only if all issues lists are empty. */
export function mergeIssues(...lists: ValidationIssue[][]): { valid: boolean; issues: ValidationIssue[] } {
  const issues = lists.flat();
  return { valid: issues.length === 0, issues };
}
