import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DEFAULT_LANGUAGE, LanguageTaggedText } from '../model/language-tagged-text';

/** Edits a language tagged text (list of {lang, value}). */
@Component({
  selector: 'app-language-text-editor',
  imports: [MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule],
  template: `
    <div class="ltt">
      <div class="ltt-label">{{ label() }}</div>
      @for (entry of value(); track $index; let i = $index) {
        <div class="row">
          <mat-form-field class="lang" subscriptSizing="dynamic">
            <mat-label>Sprache</mat-label>
            <input matInput [value]="entry.lang" maxlength="2"
                   (input)="setLang(i, $any($event.target).value)" />
          </mat-form-field>
          <mat-form-field class="text" subscriptSizing="dynamic">
            <mat-label>Text</mat-label>
            <input matInput [value]="entry.value" (input)="setValue(i, $any($event.target).value)" />
          </mat-form-field>
          <button mat-icon-button type="button" aria-label="Sprache entfernen"
                  [disabled]="required() && value().length <= 1" (click)="remove(i)">
            <mat-icon>delete</mat-icon>
          </button>
        </div>
      }
      <button mat-button type="button" (click)="add()"><mat-icon>add</mat-icon> Sprache</button>
    </div>
  `,
  styles: `
    .ltt-label { font: var(--mat-sys-label-large); margin-bottom: 4px; }
    .row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
    .lang { width: 90px; }
    .text { flex: 1; }
  `,
})
export class LanguageTextEditor {
  readonly label = input('');
  readonly value = input.required<LanguageTaggedText>();
  /** If true, at least one entry must remain (minItems: 1). */
  readonly required = input(false);
  readonly valueChange = output<LanguageTaggedText>();

  setLang(i: number, lang: string): void {
    this.emit(this.value().map((e, j) => (j === i ? { ...e, lang } : e)));
  }

  setValue(i: number, value: string): void {
    this.emit(this.value().map((e, j) => (j === i ? { ...e, value } : e)));
  }

  add(): void {
    const used = new Set(this.value().map((e) => e.lang));
    const lang = used.has(DEFAULT_LANGUAGE) ? '' : DEFAULT_LANGUAGE;
    this.emit([...this.value(), { lang, value: '' }]);
  }

  remove(i: number): void {
    this.emit(this.value().filter((_, j) => j !== i));
  }

  private emit(v: LanguageTaggedText): void {
    this.valueChange.emit(v);
  }
}
