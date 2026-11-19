import { computed, inject, Injectable, signal } from '@angular/core';
import { createEmptyBaseScale } from '../../base/model/base-scale.factory';
import { BaseScale } from '../../base/model/base-scale.model';
import { validateBaseScale } from '../../base/model/base-scale-validation';
import { checkBaseScaleWarnings } from '../../base/model/base-scale-warnings';
import { BaseScaleStore } from '../../base/services/base-scale-store';
import { createEmptyDerivedScale } from '../../derived/model/derived-scale.factory';
import { DerivedScale } from '../../derived/model/derived-scale.model';
import { DerivedScaleStore } from '../../derived/services/derived-scale-store';
import { normalizeDerivedScaleInput } from '../../derived/model/derived-scale-normalize';
import { validateDerivedScale } from '../../derived/model/derived-scale-validation';
import { checkDerivedScaleWarnings } from '../../derived/model/derived-scale-warnings';
import { ScaleType } from '../../shared/model/scale-type';
import { ValidationIssue, ValidationResult } from '../../shared/model/schema-validation';
import { fileNameFromId, toJsonText } from '../../shared/services/json-file.service';
import { ScaleIdSuggestionsService } from '../../shared/services/scale-id-suggestions.service';
import { AcpIndex, AssessmentPart, SCALE_LIST_KEY } from '../model/acp-index.model';
import { checkIndex, IndexWarning } from '../model/index-checks';

/** Position of a scale inside the index. */
export interface ScaleRef {
  part: number;
  type: ScaleType;
  index: number;
}

export interface IndexScaleEntry extends ScaleRef {
  id: string;
  issueCount: number;
  warningCount: number;
}

export interface IndexPartView {
  index: number;
  id: string;
  label: string;
  scales: Record<ScaleType, IndexScaleEntry[]>;
}

const VALIDATORS: Record<ScaleType, (s: unknown) => ValidationResult> = {
  base: validateBaseScale,
  derived: validateDerivedScale,
};
const WARNINGS: Record<ScaleType, (s: unknown) => ValidationIssue[]> = {
  base: checkBaseScaleWarnings,
  derived: checkDerivedScaleWarnings,
};

/**
 * An acp index opened as workspace (DEC-026): lists all scales of all assessment parts,
 * edits one at a time via the existing stores/editors and writes changes back into the index.
 * All other index content is kept untouched.
 */
@Injectable({ providedIn: 'root' })
export class IndexWorkspaceService {
  private readonly stores = {
    base: inject(BaseScaleStore),
    derived: inject(DerivedScaleStore),
  };

  private readonly _index = signal<AcpIndex | null>(null);
  private readonly _fileName = signal<string | null>(null);
  private readonly _handle = signal<FileSystemFileHandle | null>(null);
  private readonly _dirty = signal(false);
  private readonly _selected = signal<ScaleRef | null>(null);

  readonly index = this._index.asReadonly();
  readonly fileName = this._fileName.asReadonly();
  readonly fileHandle = this._handle.asReadonly();
  readonly dirty = this._dirty.asReadonly();
  readonly selected = this._selected.asReadonly();
  readonly isOpen = computed(() => this._index() !== null);

  /** Index-wide warnings (DEC-028). */
  readonly indexWarnings = computed<IndexWarning[]>(() => checkIndex(this._index()));

  /** Assessment parts with their scales and per-scale check results (for the sidebar). */
  readonly parts = computed<IndexPartView[]>(() => {
    const parts = this._index()?.assessmentParts;
    if (!Array.isArray(parts)) return [];
    return parts.map((part, p) => ({
      index: p,
      id: typeof part?.id === 'string' ? part.id : '',
      label: partLabel(part, p),
      scales: {
        base: this.entries(part, p, 'base'),
        derived: this.entries(part, p, 'derived'),
      },
    }));
  });

  /** Total number of errors over all scales in the index. */
  readonly issueCount = computed(() =>
    this.parts().reduce((n, p) => n + [...p.scales.base, ...p.scales.derived].reduce((m, e) => m + e.issueCount, 0), 0),
  );

  constructor() {
    this.stores.base.setChangeListener((s) => this.onEdit('base', s));
    this.stores.derived.setChangeListener((s) => this.onEdit('derived', s));
    // all scale ids of the index as autocomplete suggestions (DEC-031)
    inject(ScaleIdSuggestionsService).setSource(() =>
      this.parts().flatMap((p) =>
        [...p.scales.base, ...p.scales.derived].map((e) => ({ id: e.id, type: e.type, context: p.label })),
      ),
    );
  }

  load(index: AcpIndex, fileName: string | null, handle: FileSystemFileHandle | null): void {
    this.closeStores();
    this._index.set(normalizeIndex(index));
    this._fileName.set(fileName);
    this._handle.set(handle);
    this._dirty.set(false);
    this._selected.set(null);
  }

  close(): void {
    this._index.set(null);
    this._fileName.set(null);
    this._handle.set(null);
    this._dirty.set(false);
    this._selected.set(null);
  }

  /** Opens the scale at `ref` in the matching store/editor. */
  select(ref: ScaleRef): void {
    const scale = this.scaleAt(ref);
    if (scale === undefined) return;
    this.closeStores();
    this._selected.set({ part: ref.part, type: ref.type, index: ref.index });
    const store = this.stores[ref.type] as BaseScaleStore | DerivedScaleStore;
    (store as { load(s: unknown, f: null): void }).load(scale, null);
    store.setExtraWarnings(() => this.warningsForSelected(ref.type));
  }

  /** Appends a new empty scale of `type` to assessment part `part` and selects it. */
  addScale(part: number, type: ScaleType): void {
    const scale = type === 'base' ? createEmptyBaseScale() : createEmptyDerivedScale();
    const key = SCALE_LIST_KEY[type];
    let newIndex = 0;
    this.updatePart(part, (p) => {
      const list = [...((p[key] as unknown[]) ?? []), scale];
      newIndex = list.length - 1;
      return { ...p, [key]: list };
    });
    this.select({ part, type, index: newIndex });
  }

  /** Removes the scale; an empty list is removed from the part (minItems: 1). */
  removeScale(ref: ScaleRef): void {
    const key = SCALE_LIST_KEY[ref.type];
    this.updatePart(ref.part, (p) => {
      const list = ((p[key] as unknown[]) ?? []).filter((_, i) => i !== ref.index);
      const next = { ...p, [key]: list };
      if (list.length === 0) delete next[key];
      return next;
    });
    const sel = this._selected();
    if (sel && sel.part === ref.part && sel.type === ref.type) {
      if (sel.index === ref.index) {
        this._selected.set(null);
        this.closeStores();
      } else if (sel.index > ref.index) {
        this._selected.set({ ...sel, index: sel.index - 1 });
      }
    }
  }

  /**
   * Moves a scale within its list or into the same-type list of another assessment part
   * (DEC-029). `toIndex` is the position in the target list after removal from the source.
   * Empty source lists are removed, missing target lists created; the selection follows the scale.
   */
  moveScale(from: ScaleRef, toPart: number, toIndex: number): void {
    const index = this._index();
    const parts = index?.assessmentParts;
    if (!index || !Array.isArray(parts) || !parts[toPart]) return;
    const key = SCALE_LIST_KEY[from.type];
    const source = parts[from.part]?.[key];
    if (!Array.isArray(source) || from.index < 0 || from.index >= source.length) return;
    if (from.part === toPart && from.index === toIndex) return;

    const sel = this._selected();
    const selectedScale = sel ? this.scaleAt(sel) : undefined;
    const moved = source[from.index];

    const lists = parts.map((p) => [...((p?.[key] as unknown[]) ?? [])]);
    lists[from.part].splice(from.index, 1);
    const target = lists[toPart];
    target.splice(Math.max(0, Math.min(toIndex, target.length)), 0, moved);

    this._index.set({
      ...index,
      assessmentParts: parts.map((p, i) => {
        if (i !== from.part && i !== toPart) return p;
        const next: AssessmentPart = { ...p, [key]: lists[i] };
        if (lists[i].length === 0) delete next[key];
        return next;
      }),
    });
    this._dirty.set(true);

    // keep the selection on the same scale object (it may have moved)
    if (sel && selectedScale !== undefined) {
      const pos = this.findScale(sel.type, selectedScale);
      this._selected.set(pos);
      if (pos) this.stores[pos.type].setExtraWarnings(() => this.warningsForSelected(pos.type));
    }
  }

  serialize(): string {
    return toJsonText(this._index());
  }

  /** Proposes a file name: current name, else `<packageId>.json`, else `index.json`. */
  suggestedFileName(): string {
    return this._fileName() ?? fileNameFromId(this._index()?.packageId, 'index');
  }

  markSaved(fileName: string, handle: FileSystemFileHandle | null): void {
    this._fileName.set(fileName);
    this._handle.set(handle);
    this._dirty.set(false);
  }

  private onEdit(type: ScaleType, scale: BaseScale | DerivedScale): void {
    const sel = this._selected();
    if (!this._index() || !sel || sel.type !== type) return;
    const key = SCALE_LIST_KEY[type];
    this.updatePart(sel.part, (p) => ({
      ...p,
      [key]: ((p[key] as unknown[]) ?? []).map((s, i) => (i === sel.index ? scale : s)),
    }));
  }

  private updatePart(part: number, fn: (p: AssessmentPart) => AssessmentPart): void {
    const index = this._index();
    if (!index || !Array.isArray(index.assessmentParts)) return;
    this._index.set({
      ...index,
      assessmentParts: index.assessmentParts.map((p, i) => (i === part ? fn(p) : p)),
    });
    this._dirty.set(true);
  }

  private findScale(type: ScaleType, scale: unknown): ScaleRef | null {
    const parts = this._index()?.assessmentParts ?? [];
    for (let p = 0; p < parts.length; p++) {
      const list = parts[p]?.[SCALE_LIST_KEY[type]];
      const i = Array.isArray(list) ? list.indexOf(scale as never) : -1;
      if (i >= 0) return { part: p, type, index: i };
    }
    return null;
  }

  private scaleAt(ref: ScaleRef): unknown {
    const part = this._index()?.assessmentParts?.[ref.part];
    const list = part?.[SCALE_LIST_KEY[ref.type]];
    return Array.isArray(list) ? list[ref.index] : undefined;
  }

  private entries(part: AssessmentPart, p: number, type: ScaleType): IndexScaleEntry[] {
    const list = part?.[SCALE_LIST_KEY[type]];
    if (!Array.isArray(list)) return [];
    const indexWarnings = this.indexWarnings();
    return list.map((scale: { id?: unknown }, i) => ({
      part: p,
      type,
      index: i,
      id: typeof scale?.id === 'string' ? scale.id : '',
      issueCount: VALIDATORS[type](scale).issues.length,
      warningCount:
        WARNINGS[type](scale).length + indexWarnings.filter((w) => sameRef(w, { part: p, type, index: i })).length,
    }));
  }

  /** Index warnings of the currently selected scale (reactive, shown in the editor). */
  private warningsForSelected(type: ScaleType): ValidationIssue[] {
    const sel = this._selected();
    if (!sel || sel.type !== type) return [];
    return this.indexWarnings()
      .filter((w) => sameRef(w, sel))
      .map(({ path, message }) => ({ path, message }));
  }

  private closeStores(): void {
    for (const store of [this.stores.base, this.stores.derived]) {
      store.close();
      store.setExtraWarnings(null);
    }
  }
}

function sameRef(a: ScaleRef, b: ScaleRef): boolean {
  return a.part === b.part && a.type === b.type && a.index === b.index;
}

/** Display label of an assessment part: German/first name, else id, else number. */
function partLabel(part: AssessmentPart, p: number): string {
  const names = Array.isArray(part?.name) ? part.name : [];
  const name = names.find((n) => n?.lang === 'de')?.value ?? names[0]?.value;
  return name || part?.id || `Teil ${p + 1}`;
}

/** Applies the derived-scale normalization (mappingElse → mappingsElse, DEC-004) to all derived scales. */
function normalizeIndex(index: AcpIndex): AcpIndex {
  if (!Array.isArray(index.assessmentParts)) return index;
  return {
    ...index,
    assessmentParts: index.assessmentParts.map((p) =>
      Array.isArray(p?.derivedScales)
        ? { ...p, derivedScales: p.derivedScales.map((d) => normalizeDerivedScaleInput(d) as DerivedScale) }
        : p,
    ),
  };
}
