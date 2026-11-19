import { ScaleType } from '../../shared/model/scale-type';
import { ValidationIssue } from '../../shared/model/schema-validation';
import { AcpIndex, AssessmentPart, SCALE_LIST_KEY } from './acp-index.model';

/** A warning concerning one scale of the index. */
export interface IndexWarning extends ValidationIssue {
  part: number;
  type: ScaleType;
  index: number;
}

/** Separators accepted between unit alias and item id (spec does not define one, Q-015). */
export const ITEM_ID_SEPARATORS = ['', '_', '-', '.'];

type Loose = Record<string, unknown>;
const asArray = (v: unknown): Loose[] => (Array.isArray(v) ? (v as Loose[]) : []);
const str = (v: unknown): string | undefined => (typeof v === 'string' && v !== '' ? v : undefined);

/**
 * All full item identifiers of an assessment part (acp-unit@0.5): unit alias (from booklet modules)
 * or unit id as prefix + item id, unless `useUnitAliasAsPrefix` is false. Returns null if the part
 * defines no unit items at all (then item references cannot be checked).
 */
export function knownItemIds(part: AssessmentPart): Set<string> | null {
  const aliases = new Map<string, Set<string>>();
  for (const m of asArray(part['bookletModules'])) {
    for (const u of asArray(m['units'])) {
      const id = str(u['id']);
      const alias = str(u['alias']);
      if (id && alias) aliases.set(id, (aliases.get(id) ?? new Set()).add(alias));
    }
  }
  const ids = new Set<string>();
  let anyItem = false;
  for (const unit of asArray(part['units'])) {
    const unitId = str(unit['id']);
    for (const item of asArray(unit['items'])) {
      const itemId = str(item['id']);
      if (!itemId) continue;
      anyItem = true;
      if (item['useUnitAliasAsPrefix'] === false) {
        ids.add(itemId);
        continue;
      }
      const prefixes = new Set(aliases.get(unitId ?? '') ?? []);
      if (unitId) prefixes.add(unitId);
      for (const prefix of prefixes) {
        for (const sep of ITEM_ID_SEPARATORS) ids.add(`${prefix}${sep}${itemId}`);
      }
    }
  }
  return anyItem ? ids : null;
}

/**
 * Index-wide checks (DEC-028), all as warnings:
 * - duplicate scale ids across the whole index
 * - `sources` of derived scales not referring to a scale of the index
 * - item ids of base scales not found in the units of their assessment part
 */
export function checkIndex(index: AcpIndex | null): IndexWarning[] {
  const parts = asArray(index?.assessmentParts) as AssessmentPart[];
  const warnings: IndexWarning[] = [];
  const scales: { part: number; type: ScaleType; index: number; scale: Loose }[] = [];
  parts.forEach((part, p) => {
    for (const type of ['base', 'derived'] as ScaleType[]) {
      asArray(part?.[SCALE_LIST_KEY[type]]).forEach((scale, i) => scales.push({ part: p, type, index: i, scale }));
    }
  });

  const count = new Map<string, number>();
  for (const { scale } of scales) {
    const id = str(scale?.['id']);
    if (id) count.set(id, (count.get(id) ?? 0) + 1);
  }
  for (const { part, type, index: i, scale } of scales) {
    const id = str(scale?.['id']);
    if (id && count.get(id)! > 1) {
      warnings.push({ part, type, index: i, path: '/id', message: `Skalen-ID "${id}" kommt im Index ${count.get(id)}-mal vor` });
    }
  }

  for (const { part, type, index: i, scale } of scales) {
    if (type !== 'derived') continue;
    asArray(scale?.['sources']).forEach((src, j) => {
      const s = str(src as unknown);
      if (s && !count.has(s)) {
        warnings.push({ part, type, index: i, path: `/sources/${j}`, message: `Quelle "${s}" ist keine Skala dieses Index` });
      }
    });
  }

  parts.forEach((part, p) => {
    const known = part ? knownItemIds(part) : null;
    if (!known) return;
    asArray(part[SCALE_LIST_KEY.base]).forEach((scale, i) => {
      asArray(scale?.['items']).forEach((item, j) => {
        const id = str(item?.['id']);
        if (id && !known.has(id)) {
          warnings.push({ part: p, type: 'base', index: i, path: `/items/${j}/id`, message: `Item "${id}" ist in den Units dieses Teils nicht definiert` });
        }
      });
    });
  });
  return warnings;
}
