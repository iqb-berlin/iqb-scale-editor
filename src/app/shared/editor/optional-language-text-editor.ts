import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DEFAULT_LANGUAGE, LanguageTaggedText } from '../model/language-tagged-text';
import { LanguageTextEditor } from './language-text-editor';

/** Optional language tagged text: "add" button when absent, editor + "remove" when present. */
@Component({
  selector: 'app-optional-language-text-editor',
  imports: [MatButtonModule, MatIconModule, LanguageTextEditor],
  template: `
    @if (value(); as text) {
      <app-language-text-editor [label]="label()" [value]="text" [required]="true"
                                (valueChange)="valueChange.emit($event)" />
      <button mat-button type="button" (click)="valueChange.emit(undefined)">
        <mat-icon>remove</mat-icon> {{ label() }} entfernen
      </button>
    } @else {
      <button mat-button type="button" (click)="valueChange.emit([{ lang: defaultLang, value: '' }])">
        <mat-icon>add</mat-icon> {{ label() }}
      </button>
    }
  `,
  styles: `:host { display: block; }`,
})
export class OptionalLanguageTextEditor {
  readonly label = input.required<string>();
  readonly value = input<LanguageTaggedText | undefined>();
  readonly valueChange = output<LanguageTaggedText | undefined>();
  protected readonly defaultLang = DEFAULT_LANGUAGE;
}
