/** Shallow merge that removes properties set to `undefined` (optional fields are omitted, not null). */
export function patchObject<T extends object>(obj: T, patch: Partial<T>): T {
  const next = { ...obj, ...patch };
  for (const k of Object.keys(next) as (keyof T)[]) {
    if (next[k] === undefined) delete next[k];
  }
  return next;
}
