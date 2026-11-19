import {
  checkLanguageTaggedText,
  checkNonEmptyString,
  mergeIssues,
} from '../../shared/model/content-checks';
import { createSchemaValidator, ValidationIssue, ValidationResult } from '../../shared/model/schema-validation';
import schema from './acp-scale-base.schema.json';

/** Validates against the acp-scale-base JSON schema only. */
export const validateBaseScaleSchema = createSchemaValidator(schema);

type Loose = Record<string, unknown> | null | undefined;

/**
 * Content checks beyond the schema (DEC-014, DEC-020): no empty id/item ids/texts,
 * no duplicate languages, item ids unique, parameter keys unique per item.
 */
export function checkBaseScaleContent(data: unknown): ValidationIssue[] {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return [];
  const s = data as Record<string, unknown>;
  const items = Array.isArray(s['items']) ? (s['items'] as Loose[]) : [];
  const issues: ValidationIssue[] = [
    ...checkNonEmptyString(s['id'], '/id', 'ID'),
    ...checkLanguageTaggedText(s['name'], '/name', 'Name'),
    ...checkLanguageTaggedText(s['description'], '/description', 'Beschreibung'),
  ];
  const seenIds = new Set<string>();
  items.forEach((item, i) => {
    if (!item || typeof item !== 'object') return;
    const id = item['id'];
    issues.push(...checkNonEmptyString(id, `/items/${i}/id`, `Item-ID ${i + 1}`));
    if (typeof id === 'string' && id.trim() !== '') {
      if (seenIds.has(id)) issues.push({ path: `/items/${i}/id`, message: `Item-ID "${id}" ist doppelt` });
      seenIds.add(id);
    }
    const params = Array.isArray(item['parameters']) ? (item['parameters'] as Loose[]) : [];
    const seenKeys = new Set<string>();
    params.forEach((p, j) => {
      const key = p?.['key'];
      if (typeof key !== 'string') return;
      if (seenKeys.has(key)) {
        issues.push({ path: `/items/${i}/parameters/${j}/key`, message: `Parameter "${key}" ist doppelt` });
      }
      seenKeys.add(key);
    });
  });
  return issues;
}

/** Full validation: JSON schema + content checks. */
export function validateBaseScale(data: unknown): ValidationResult {
  return mergeIssues(validateBaseScaleSchema(data).issues, checkBaseScaleContent(data));
}
