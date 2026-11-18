import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BaseScaleEditor } from './base/editor/base-scale-editor';
import { DerivedScaleEditor } from './derived/editor/derived-scale-editor';
import { IndexSidebar } from './index/sidebar/index-sidebar';
import { OpenOutcome, ScaleDocumentService } from './document/scale-document.service';
import { ScaleType, SCALE_TYPE_LABELS } from './shared/model/scale-type';
import { SaveTarget } from './shared/services/scale-file.service.base';
import { ConfirmService } from './shared/services/confirm.service';

@Component({
  selector: 'app-root',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSnackBarModule,
    MatToolbarModule,
    BaseScaleEditor,
    DerivedScaleEditor,
    IndexSidebar,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly doc = inject(ScaleDocumentService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly confirmService = inject(ConfirmService);
  protected readonly typeLabels = SCALE_TYPE_LABELS;

  /** Asks before discarding unsaved changes (DEC-007). */
  private confirmDiscard(): boolean {
    return !this.doc.dirty() || this.confirmService.confirm('Ungespeicherte Änderungen verwerfen?');
  }

  newScale(type: ScaleType): void {
    if (this.confirmDiscard()) this.doc.newScale(type);
  }

  /** Opens via File System Access picker, or the hidden file input as fallback (DEC-017). */
  async open(input: HTMLInputElement): Promise<void> {
    if (!this.confirmDiscard()) return;
    if (!this.doc.canWriteFiles) {
      input.click();
      return;
    }
    try {
      this.report(await this.doc.openWithPicker());
    } catch (e) {
      this.snackBar.open(`Datei konnte nicht geöffnet werden: ${(e as Error).message}`, 'OK');
    }
  }

  async onFileSelected(input: HTMLInputElement): Promise<void> {
    const file = input.files?.[0];
    input.value = '';
    if (file) this.report(await this.doc.openFile(file));
  }

  private report(outcome: OpenOutcome): void {
    if (outcome.status === 'error') {
      this.snackBar.open(outcome.error, 'OK');
    } else if (outcome.status === 'opened' && outcome.issueCount > 0) {
      const what = outcome.kind === 'index' ? 'Index' : SCALE_TYPE_LABELS[outcome.kind];
      this.snackBar.open(
        `${what} geladen, aber fehlerhaft (${outcome.issueCount} Problem(e)).`,
        'OK',
        { duration: 6000 },
      );
    }
  }

  save(): Promise<void> {
    return this.runSave(() => this.doc.save());
  }

  saveAs(): Promise<void> {
    return this.runSave(() => this.doc.saveAs());
  }

  private async runSave(action: () => Promise<SaveTarget | null>): Promise<void> {
    try {
      const target = await action();
      if (target?.handle) this.snackBar.open(`Gespeichert: ${target.fileName}`, undefined, { duration: 2500 });
    } catch (e) {
      this.snackBar.open(`Speichern fehlgeschlagen: ${(e as Error).message}`, 'OK');
    }
  }
}
