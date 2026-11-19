/** Supported scale types. */
export type ScaleType = 'base' | 'derived';

export const SCALE_TYPE_LABELS: Record<ScaleType, string> = {
  base: 'Basis-Skala',
  derived: 'Abgeleitete Skala',
};

const BASE_METHODS = ['SCORE_SUM', 'SCORE_RATIO', 'SCORE_MEAN', 'SCORE_MEDIAN', 'WLE', 'CODE_COUNT'];
const DERIVED_METHODS = ['SUM', 'MEAN', 'MAP'];

/**
 * Detects the scale type of loaded data by its characteristic properties (DEC-018):
 * derived: `sources`, `mappings`, `mappingsElse`/`mappingElse`, `publicVocabularyUrl` or a derived method;
 * base: `items`, `methodParameters`, `minItemNumber` or a base method.
 * Returns null if undetectable or ambiguous.
 */
export function detectScaleType(data: unknown): ScaleType | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const o = data as Record<string, unknown>;
  const derived =
    ['sources', 'mappings', 'mappingsElse', 'mappingElse', 'publicVocabularyUrl'].some((k) => k in o) ||
    DERIVED_METHODS.includes(o['method'] as string);
  const base =
    ['items', 'methodParameters', 'minItemNumber'].some((k) => k in o) ||
    BASE_METHODS.includes(o['method'] as string);
  if (derived === base) return null;
  return derived ? 'derived' : 'base';
}

/** Parses text as JSON and requires an object. */
export function parseJsonObject(text: string): { ok: true; data: object } | { ok: false; error: string } {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (e) {
    return { ok: false, error: `Datei ist kein gültiges JSON: ${(e as Error).message}` };
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, error: 'Datei enthält kein JSON-Objekt.' };
  }
  return { ok: true, data };
}
