import { computed, signal } from '@angular/core';
import { ValidationIssue, ValidationResult } from '../model/schema-validation';

/** Holds the scale currently open in an editor; shared by all scale types. */
export abstract class ScaleStoreBase<T> {
  private readonly _scale = signal<T | null>(null);
  private readonly _fileName = signal<string | null>(null);
  private readonly _dirty = signal(false);
  private readonly _fileHandle = signal<FileSystemFileHandle | null>(null);

  readonly scale = this._scale.asReadonly();
  readonly fileName = this._fileName.asReadonly();
  readonly dirty = this._dirty.asReadonly();
  /** Handle of the file the scale is linked to (File System Access API), else null. */
  readonly fileHandle = this._fileHandle.asReadonly();

  readonly validation = computed<ValidationResult | null>(() => {
    const s = this._scale();
    return s ? this.validate(s) : null;
  });

  /** Additional warnings from outside (e.g. index-wide checks, DEC-028); reactive. */
  private readonly _extraWarnings = signal<() => ValidationIssue[]>(() => []);

  /** Semantic warnings beyond the schema; they never make a scale invalid. */
  readonly warnings = computed<ValidationIssue[]>(() => {
    const s = this._scale();
    return s ? [...this.checkWarnings(s), ...this._extraWarnings()()] : [];
  });

  /** Sets a (reactive) source of additional warnings; null resets it. */
  setExtraWarnings(source: (() => ValidationIssue[]) | null): void {
    this._extraWarnings.set(source ?? (() => []));
  }

  // typed as unknown to keep ScaleStoreBase<T> covariant (stores are handled generically elsewhere)
  private changeListener: ((scale: unknown) => void) | null = null;

  protected abstract createEmpty(): T;

  /** Registers a callback for every edit via {@link update} (used to write back into an index, DEC-026). */
  setChangeListener(listener: ((scale: T) => void) | null): void {
    this.changeListener = listener as ((scale: unknown) => void) | null;
  }

  /** Override to provide type specific warnings. */
  protected checkWarnings(_scale: T): ValidationIssue[] {
    return [];
  }
  protected abstract validate(scale: T): ValidationResult;

  newScale(): void {
    this.load(this.createEmpty(), null);
  }

  load(scale: T, fileName: string | null, fileHandle: FileSystemFileHandle | null = null): void {
    this._scale.set(scale);
    this._fileName.set(fileName);
    this._fileHandle.set(fileHandle);
    this._dirty.set(false);
  }

  /** Replaces the scale with an updated copy and marks it as changed. */
  update(fn: (scale: T) => T): void {
    const s = this._scale();
    if (!s) return;
    const next = fn(s);
    this._scale.set(next);
    this._dirty.set(true);
    this.changeListener?.(next);
  }

  markSaved(fileName: string, fileHandle: FileSystemFileHandle | null = null): void {
    this._fileName.set(fileName);
    this._fileHandle.set(fileHandle);
    this._dirty.set(false);
  }

  close(): void {
    this._scale.set(null);
    this._fileName.set(null);
    this._fileHandle.set(null);
    this._dirty.set(false);
  }
}
