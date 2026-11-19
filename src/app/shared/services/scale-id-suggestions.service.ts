import { computed, Injectable, signal } from '@angular/core';
import { ScaleType } from '../model/scale-type';

/** A known scale id offered as suggestion while typing (DEC-031). */
export interface ScaleIdSuggestion {
  id: string;
  type: ScaleType;
  /** Where the scale lives, e.g. the assessment part label. */
  context?: string;
}

/**
 * Provides the known scale ids for autocompletion. The source is set by whoever knows
 * scales (currently the index workspace); without a source the list is empty.
 */
@Injectable({ providedIn: 'root' })
export class ScaleIdSuggestionsService {
  private readonly source = signal<() => ScaleIdSuggestion[]>(() => []);

  /** All known ids, unique (first occurrence wins), sorted alphabetically. */
  readonly all = computed<ScaleIdSuggestion[]>(() => {
    const seen = new Set<string>();
    return this.source()()
      .filter((s) => s.id.trim() !== '' && !seen.has(s.id) && seen.add(s.id))
      .sort((a, b) => a.id.localeCompare(b.id));
  });

  setSource(source: (() => ScaleIdSuggestion[]) | null): void {
    this.source.set(source ?? (() => []));
  }
}

/**
 * Filters suggestions by case-insensitive substring; prefix matches first.
 * Ids in `exclude` and an exact match of the current text are left out.
 */
export function filterScaleIds(all: ScaleIdSuggestion[], text: string, exclude: string[] = []): ScaleIdSuggestion[] {
  const q = text.trim().toLowerCase();
  const candidates = all.filter((s) => !exclude.includes(s.id) && s.id !== text);
  if (!q) return candidates;
  const matches = candidates.filter((s) => s.id.toLowerCase().includes(q));
  return [
    ...matches.filter((s) => s.id.toLowerCase().startsWith(q)),
    ...matches.filter((s) => !s.id.toLowerCase().startsWith(q)),
  ];
}
