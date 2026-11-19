import { isNumericString } from '../../shared/model/number-utils';
import { ValidationIssue } from '../../shared/model/schema-validation';
import { methodParametersKind } from './base-scale.model';

/**
 * Semantic warnings for base scales (DEC-021). They never make a scale invalid.
 * Robust against schema-invalid input.
 */
export function checkBaseScaleWarnings(scale: unknown): ValidationIssue[] {
  if (!scale || typeof scale !== 'object' || Array.isArray(scale)) return [];
  const s = scale as Record<string, unknown>;
  const warnings: ValidationIssue[] = [];
  const method = s['method'];
  const kind = methodParametersKind(method);
  const mp = s['methodParameters'];

  if (mp !== undefined && mp !== null && typeof mp === 'object') {
    const has = (k: string) => k in (mp as object);
    if (!kind || !has(kind)) {
      warnings.push({ path: '/methodParameters', message: `Methodenparameter passen nicht zur Methode ${String(method)}` });
    }
  }
  if (method === 'CODE_COUNT' && (mp === undefined || mp === null)) {
    warnings.push({ path: '/methodParameters', message: 'CODE_COUNT: zu zählender Code (codeValue) fehlt' });
  }

  const items = Array.isArray(s['items']) ? s['items'] : [];
  const min = s['minItemNumber'];
  if (typeof min === 'number') {
    if (min < 0) {
      warnings.push({ path: '/minItemNumber', message: 'Mindestanzahl Items ist negativ' });
    } else if (min > items.length) {
      warnings.push({
        path: '/minItemNumber',
        message: `Mindestanzahl Items (${min}) ist größer als die Anzahl der Items (${items.length})`,
      });
    }
  }
  items.forEach((item: Record<string, unknown> | null, i) => {
    const params = item && Array.isArray(item['parameters']) ? (item['parameters'] as Record<string, unknown>[]) : [];
    if (params.length > 0 && method !== 'WLE') {
      warnings.push({ path: `/items/${i}/parameters`, message: `Logit-Parameter werden nur bei Methode WLE verwendet` });
    }
    params.forEach((p, j) => {
      const v = p?.['value'];
      if (v === undefined || (typeof v === 'string' && !isNumericString(v))) {
        warnings.push({
          path: `/items/${i}/parameters/${j}/value`,
          message: v === undefined || v === '' ? 'Wert fehlt' : `"${String(v)}" ist keine Zahl (Dezimaltrennzeichen: Punkt)`,
        });
      }
    });
  });
  return warnings;
}
