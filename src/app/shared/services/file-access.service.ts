import { Injectable } from '@angular/core';

/** Minimal typings for the File System Access API pickers (not yet in lib.dom). */
interface FilePickerAcceptType {
  description?: string;
  accept: Record<string, string[]>;
}
interface FilePickerOptions {
  types?: FilePickerAcceptType[];
  excludeAcceptAllOption?: boolean;
}
interface SaveFilePickerOptions extends FilePickerOptions {
  suggestedName?: string;
}
interface FileSystemAccessWindow {
  showOpenFilePicker?: (o?: FilePickerOptions) => Promise<FileSystemFileHandle[]>;
  showSaveFilePicker?: (o?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
}

const JSON_TYPES: FilePickerAcceptType[] = [
  { description: 'JSON-Datei', accept: { 'application/json': ['.json'] } },
];

/** True if the user closed a picker without choosing (not an error). */
export function isAbortError(e: unknown): boolean {
  return e instanceof DOMException && e.name === 'AbortError';
}

/**
 * Thin wrapper around the File System Access API (DEC-017). Supported in Chromium based
 * browsers; elsewhere `supported` is false and callers fall back to file input / download.
 */
@Injectable({ providedIn: 'root' })
export class FileAccessService {
  private get win(): FileSystemAccessWindow {
    return window as unknown as FileSystemAccessWindow;
  }

  get supported(): boolean {
    return typeof this.win.showOpenFilePicker === 'function' && typeof this.win.showSaveFilePicker === 'function';
  }

  /** Lets the user pick a JSON file; null on cancel. */
  async pickOpen(): Promise<FileSystemFileHandle | null> {
    try {
      const [handle] = await this.win.showOpenFilePicker!({ types: JSON_TYPES });
      return handle ?? null;
    } catch (e) {
      if (isAbortError(e)) return null;
      throw e;
    }
  }

  /** Lets the user choose a target file; null on cancel. */
  async pickSave(suggestedName: string): Promise<FileSystemFileHandle | null> {
    try {
      return await this.win.showSaveFilePicker!({ suggestedName, types: JSON_TYPES });
    } catch (e) {
      if (isAbortError(e)) return null;
      throw e;
    }
  }

  async write(handle: FileSystemFileHandle, content: string): Promise<void> {
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
  }
}
