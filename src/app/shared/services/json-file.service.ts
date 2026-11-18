import { inject, Injectable } from '@angular/core';
import { FileAccessService } from './file-access.service';

/** Where content was saved; handle is null for the download fallback. */
export interface SaveTarget {
  fileName: string;
  handle: FileSystemFileHandle | null;
}

/** Formats data as JSON file content (2 spaces, trailing newline). */
export function toJsonText(data: unknown): string {
  return `${JSON.stringify(data, null, 2)}\n`;
}

/** Turns an id into a safe file name: `<id>.json`, or `<fallback>.json` if empty. */
export function fileNameFromId(id: unknown, fallback: string): string {
  const clean = (typeof id === 'string' ? id : '').trim().replace(/[^\w.-]+/g, '_');
  return `${clean || fallback}.json`;
}

/**
 * Saves text files via File System Access API with download fallback (DEC-017).
 * Shared by scale files and index files.
 */
@Injectable({ providedIn: 'root' })
export class JsonFileService {
  private readonly fileAccess = inject(FileAccessService);

  get canWriteFiles(): boolean {
    return this.fileAccess.supported;
  }

  /** Writes into `handle` if given, else like {@link saveAs}. Null if the user cancelled. */
  async save(text: string, handle: FileSystemFileHandle | null, suggestedName: string): Promise<SaveTarget | null> {
    if (handle) {
      await this.fileAccess.write(handle, text);
      return { fileName: handle.name, handle };
    }
    return this.saveAs(text, suggestedName);
  }

  /** Asks for a target file (picker) or falls back to a browser download. Null on cancel. */
  async saveAs(text: string, suggestedName: string): Promise<SaveTarget | null> {
    if (!this.fileAccess.supported) {
      this.download(text, suggestedName);
      return { fileName: suggestedName, handle: null };
    }
    const handle = await this.fileAccess.pickSave(suggestedName);
    if (!handle) return null;
    await this.fileAccess.write(handle, text);
    return { fileName: handle.name, handle };
  }

  download(text: string, fileName: string): void {
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
}
