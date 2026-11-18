import { computed, inject, Injectable, signal } from '@angular/core';
import { BaseScaleFileService } from '../base/services/base-scale-file.service';
import { BaseScaleStore } from '../base/services/base-scale-store';
import { DerivedScaleFileService } from '../derived/services/derived-scale-file.service';
import { DerivedScaleStore } from '../derived/services/derived-scale-store';
import { AcpIndex, isIndexData } from '../index/model/acp-index.model';
import { IndexWorkspaceService } from '../index/services/index-workspace.service';
import { detectScaleType, parseJsonObject, ScaleType, SCALE_TYPE_LABELS } from '../shared/model/scale-type';
import { FileAccessService } from '../shared/services/file-access.service';
import { JsonFileService, SaveTarget } from '../shared/services/json-file.service';
import { ScaleFileServiceBase } from '../shared/services/scale-file.service.base';
import { ScaleStoreBase } from '../shared/services/scale-store.base';

/** What a file contains: a single scale or an acp index. */
export type DocumentKind = ScaleType | 'index';

/** Outcome of opening a file, for user feedback. */
export type OpenOutcome =
  | { status: 'cancelled' }
  | { status: 'error'; error: string }
  | { status: 'opened'; kind: DocumentKind; issueCount: number };

interface ScaleTypeEntry {
  store: ScaleStoreBase<{ id: string }>;
  files: ScaleFileServiceBase<{ id: string }>;
}

/**
 * The "document" open in the app (DEC-018, DEC-026): either a single scale file of one type,
 * or an acp index as workspace containing many scales. Routes new/open/save accordingly.
 */
@Injectable({ providedIn: 'root' })
export class ScaleDocumentService {
  private readonly fileAccess = inject(FileAccessService);
  private readonly jsonFiles = inject(JsonFileService);
  readonly workspace = inject(IndexWorkspaceService);
  private readonly entries: Record<ScaleType, ScaleTypeEntry> = {
    base: { store: inject(BaseScaleStore), files: inject(BaseScaleFileService) },
    derived: { store: inject(DerivedScaleStore), files: inject(DerivedScaleFileService) },
  };

  /** Type of a standalone scale file (not used in index mode). */
  private readonly _fileType = signal<ScaleType | null>(null);

  readonly isIndex = this.workspace.isOpen;
  /** Type of the scale currently shown in the editor (in index mode: the selected one). */
  readonly type = computed<ScaleType | null>(() =>
    this.isIndex() ? (this.workspace.selected()?.type ?? null) : this._fileType(),
  );
  readonly typeLabel = computed(() => {
    const t = this.type();
    return t ? SCALE_TYPE_LABELS[t] : null;
  });

  private readonly store = computed(() => {
    const t = this.type();
    return t ? this.entries[t].store : null;
  });
  /** True if a scale is shown in the editor. */
  readonly hasScale = computed(() => !!this.store()?.scale());
  /** True if there is something to save (scale file or index). */
  readonly hasDocument = computed(() => this.isIndex() || this.hasScale());
  readonly fileName = computed(() =>
    this.isIndex() ? this.workspace.fileName() : (this.store()?.fileName() ?? null),
  );
  readonly dirty = computed(() => (this.isIndex() ? this.workspace.dirty() : (this.store()?.dirty() ?? false)));

  get canWriteFiles(): boolean {
    return this.fileAccess.supported;
  }

  /** Creates a new standalone scale file (closes an open index). */
  newScale(type: ScaleType): void {
    this.activate(type);
    this.entries[type].store.newScale();
  }

  /** Opens via File System Access picker. Only if `canWriteFiles`. */
  async openWithPicker(): Promise<OpenOutcome> {
    const handle = await this.fileAccess.pickOpen();
    if (!handle) return { status: 'cancelled' };
    return this.openText(await (await handle.getFile()).text(), handle.name, handle);
  }

  /** Opens a file chosen via file input (fallback). */
  async openFile(file: File): Promise<OpenOutcome> {
    return this.openText(await file.text(), file.name, null);
  }

  /** Parses text, detects index or scale type and opens it. */
  openText(text: string, fileName: string, handle: FileSystemFileHandle | null): OpenOutcome {
    const json = parseJsonObject(text);
    if (!json.ok) return { status: 'error', error: json.error };

    if (isIndexData(json.data)) {
      this._fileType.set(null);
      this.workspace.load(json.data as AcpIndex, fileName, handle);
      return { status: 'opened', kind: 'index', issueCount: this.workspace.issueCount() };
    }

    const type = detectScaleType(json.data);
    if (!type) {
      return {
        status: 'error',
        error: 'Dateityp nicht erkennbar (weder Index noch Basis-Skala noch abgeleitete Skala).',
      };
    }
    const result = this.entries[type].files.parseData(json.data);
    if (!result.ok) return { status: 'error', error: result.error };
    this.activate(type);
    this.entries[type].store.load(result.scale, fileName, handle);
    return { status: 'opened', kind: type, issueCount: result.validation.issues.length };
  }

  /** Saves into the linked file, else asks for a target (or downloads). Null if nothing saved. */
  save(): Promise<SaveTarget | null> {
    if (this.isIndex()) {
      const ws = this.workspace;
      return this.saveIndex(() => this.jsonFiles.save(ws.serialize(), ws.fileHandle(), ws.suggestedFileName()));
    }
    return this.runSave((e, scale) => e.files.save(scale, e.store.fileHandle(), e.store.fileName()));
  }

  /** Always asks for a new target (or downloads). Null if nothing saved. */
  saveAs(): Promise<SaveTarget | null> {
    if (this.isIndex()) {
      const ws = this.workspace;
      return this.saveIndex(() => this.jsonFiles.saveAs(ws.serialize(), ws.suggestedFileName()));
    }
    return this.runSave((e, scale) => e.files.saveAs(scale, e.store.fileName()));
  }

  private async saveIndex(action: () => Promise<SaveTarget | null>): Promise<SaveTarget | null> {
    const target = await action();
    if (target) this.workspace.markSaved(target.fileName, target.handle);
    return target;
  }

  private async runSave(
    action: (e: ScaleTypeEntry, scale: { id: string }) => Promise<SaveTarget | null>,
  ): Promise<SaveTarget | null> {
    const t = this._fileType();
    if (!t) return null;
    const entry = this.entries[t];
    const scale = entry.store.scale();
    if (!scale) return null;
    const target = await action(entry, scale);
    if (target) entry.store.markSaved(target.fileName, target.handle);
    return target;
  }

  /** Makes `type` the active standalone type; closes an open index and the other type's scale. */
  private activate(type: ScaleType): void {
    this.workspace.close();
    for (const t of Object.keys(this.entries) as ScaleType[]) {
      if (t !== type) this.entries[t].store.close();
    }
    this._fileType.set(type);
  }
}
