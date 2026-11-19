import { inject } from '@angular/core';
import { parseJsonObject } from '../model/scale-type';
import { ValidationResult } from '../model/schema-validation';
import { fileNameFromId, JsonFileService, SaveTarget, toJsonText } from './json-file.service';

export type { SaveTarget } from './json-file.service';

export type ParseResult<T> =
  | { ok: true; scale: T; validation: ValidationResult }
  | { ok: false; error: string };


/**
 * Loading/saving of scale JSON files, shared by all scale types.
 * Subclasses provide the type specific normalization and validation.
 */
export abstract class ScaleFileServiceBase<T extends { id: string }> {
  protected readonly jsonFiles = inject(JsonFileService);

  /** True if files can be opened and written in place (File System Access API). */
  get canWriteFiles(): boolean {
    return this.jsonFiles.canWriteFiles;
  }
  protected abstract validate(data: unknown): ValidationResult;

  /** Hook for tolerant reading of legacy/variant formats. */
  protected normalize(data: object): unknown {
    return data;
  }

  /**
   * Parses the text of a scale file. Any JSON object is accepted (DEC-005),
   * schema violations are reported via `validation`.
   */
  parse(text: string): ParseResult<T> {
    const json = parseJsonObject(text);
    return json.ok ? this.parseData(json.data) : json;
  }

  /** Normalizes and validates an already parsed JSON object. */
  parseData(data: object): ParseResult<T> {
    const normalized = this.normalize(data);
    return { ok: true, scale: normalized as T, validation: this.validate(normalized) };
  }

  async readFile(file: File): Promise<ParseResult<T>> {
    return this.parse(await file.text());
  }

  /**
   * Saves the scale (DEC-017): into `handle` if given, else like {@link saveAs}.
   * Returns where it was saved, or null if the user cancelled.
   */
  save(scale: T, handle: FileSystemFileHandle | null, currentName: string | null): Promise<SaveTarget | null> {
    return this.jsonFiles.save(this.serialize(scale), handle, this.fileNameFor(scale, currentName));
  }

  /** Asks for a target file (picker) or falls back to a browser download. Null on cancel. */
  saveAs(scale: T, currentName: string | null): Promise<SaveTarget | null> {
    return this.jsonFiles.saveAs(this.serialize(scale), this.fileNameFor(scale, currentName));
  }

  serialize(scale: T): string {
    return toJsonText(scale);
  }

  /** Proposes a file name: given name, else `<id>.json`, else `scale.json`. */
  fileNameFor(scale: T, current?: string | null): string {
    return current || fileNameFromId(scale.id, 'scale');
  }
}
