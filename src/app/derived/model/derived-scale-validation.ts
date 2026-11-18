import {
  checkLanguageTaggedText,
  checkNonEmptyString,
  checkNonEmptyStrings,
  mergeIssues,
} from '../../shared/model/content-checks';
import { createSchemaValidator, ValidationIssue, ValidationResult } from '../../shared/model/schema-validation';
import schema from './acp-scale-derived.schema.json';

/** Validates against the acp-scale-derived JSON schema only. */
export const validateDerivedScaleSchema = createSchemaValidator(schema);

type Loose = Record<string, unknown> | null | undefined;

function checkNewValue(nv: Loose, path: string): ValidationIssue[] {
  if (!nv || typeof nv !== 'object') return [];
  return [
    ...checkLanguageTaggedText(nv['label'], `${path}/label`, 'Label'),
    ...checkLanguageTaggedText(nv['description'], `${path}/description`, 'Beschreibung'),
  ];
}

/** Content checks beyond the schema (DEC-014): no empty id/sources/texts, no duplicate languages. */
export function checkDerivedScaleContent(data: unknown): ValidationIssue[] {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return [];
  const s = data as Record<string, unknown>;
  const mappings = Array.isArray(s['mappings']) ? (s['mappings'] as Loose[]) : [];
  return [
    ...checkNonEmptyString(s['id'], '/id', 'ID'),
    ...checkLanguageTaggedText(s['name'], '/name', 'Name'),
    ...checkLanguageTaggedText(s['description'], '/description', 'Beschreibung'),
    ...checkNonEmptyStrings(s['sources'], '/sources', 'Quelle'),
    ...mappings.flatMap((m, i) => checkNewValue(m?.['newValue'] as Loose, `/mappings/${i}/newValue`)),
    ...checkNewValue(s['mappingsElse'] as Loose, '/mappingsElse'),
  ];
}

/** Full validation: JSON schema + content checks. */
export function validateDerivedScale(data: unknown): ValidationResult {
  return mergeIssues(validateDerivedScaleSchema(data).issues, checkDerivedScaleContent(data));
}
