import { isNumericString } from '../../shared/model/number-utils';
import { ValidationIssue } from '../../shared/model/schema-validation';
import { MappingMethod } from './derived-scale.model';

/** Methods that compare against exactly one numeric threshold. */
const SINGLE_NUMBER_METHODS: readonly MappingMethod[] = ['MIN', 'MAX', 'LESS_THAN', 'MORE_THAN'];

/** True if the mapping parameter is a number in JSON notation. */
export const isNumericParameter = isNumericString;

/**
 * Semantic checks beyond the JSON schema (DEC-013). Results are warnings: they do not
 * make the scale invalid and do not block saving. Robust against schema-invalid input.
 */
export function checkDerivedScaleWarnings(scale: unknown): ValidationIssue[] {
  const s = scale as { method?: unknown; mappings?: unknown; mappingsElse?: unknown } | null;
  const warnings: ValidationIssue[] = [];
  if (s && (s.method === 'SUM' || s.method === 'MEAN')) {
    if (Array.isArray(s.mappings) && s.mappings.length > 0) {
      warnings.push({ path: '/mappings', message: `Mappings werden bei Methode ${s.method} nicht verwendet` });
    }
    if (s.mappingsElse !== undefined) {
      warnings.push({ path: '/mappingsElse', message: `Sonst-Wert wird bei Methode ${s.method} nicht verwendet` });
    }
  }
  const mappings = s?.mappings;
  if (!Array.isArray(mappings)) return warnings;
  mappings.forEach((m: { method?: unknown; parameters?: unknown }, i) => {
    if (!m || !Array.isArray(m.parameters)) return;
    const path = `/mappings/${i}/parameters`;
    const params = m.parameters as unknown[];
    const method = m.method as MappingMethod;
    if (SINGLE_NUMBER_METHODS.includes(method)) {
      if (params.length !== 1) {
        warnings.push({ path, message: `${method} erwartet genau einen Parameter (vorhanden: ${params.length})` });
      }
      params.forEach((p, j) => {
        if (typeof p === 'string' && !isNumericParameter(p)) {
          warnings.push({ path: `${path}/${j}`, message: `"${p}" ist keine Zahl (Dezimaltrennzeichen: Punkt)` });
        }
      });
    } else if (method === 'EQUALS') {
      if (params.length === 0) {
        warnings.push({ path, message: 'EQUALS erwartet mindestens einen Parameter' });
      }
      params.forEach((p, j) => {
        if (typeof p === 'string' && p.trim() === '') {
          warnings.push({ path: `${path}/${j}`, message: 'Parameter ist leer' });
        }
      });
    }
  });
  return warnings;
}
