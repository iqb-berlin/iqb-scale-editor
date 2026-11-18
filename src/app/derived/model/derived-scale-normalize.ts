/**
 * Tolerant reading of scale files (see DEC-004):
 * the spec README uses "mappingElse" while the schema defines "mappingsElse".
 * On load, "mappingElse" is renamed to "mappingsElse" if the latter is absent.
 */
export function normalizeDerivedScaleInput(data: unknown): unknown {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const obj = { ...(data as Record<string, unknown>) };
    if ('mappingElse' in obj && !('mappingsElse' in obj)) {
      obj['mappingsElse'] = obj['mappingElse'];
      delete obj['mappingElse'];
    }
    return obj;
  }
  return data;
}
