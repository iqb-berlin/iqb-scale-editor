import { Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LanguageTaggedText } from '../../shared/model/language-tagged-text';
import { patchObject } from '../../shared/model/object-utils';
import { OptionalLanguageTextEditor } from '../../shared/editor/optional-language-text-editor';
import { NewValue } from '../model/derived-scale.model';

type OptionalText = 'label' | 'description';

/** Edits a newValue (target value of a mapping or of mappingsElse). */
@Component({
  selector: 'app-new-value-editor',
  imports: [MatFormFieldModule, MatInputModule, OptionalLanguageTextEditor],
  template: `
    <div class="row">
      <mat-form-field class="value" subscriptSizing="dynamic">
        <mat-label>Neuer Wert</mat-label>
        <input matInput type="number" [value]="value().value"
               (input)="patch({ value: $any($event.target).valueAsNumber })" />
      </mat-form-field>
      <mat-form-field class="entry" subscriptSizing="dynamic">
        <mat-label>Vokabular-Eintrag</mat-label>
        <input matInput [value]="value().publicVocabularyEntry ?? ''"
               (input)="patch({ publicVocabularyEntry: $any($event.target).value || undefined })" />
      </mat-form-field>
    </div>
    @for (field of optionalTexts; track field.key) {
      <app-optional-language-text-editor [label]="field.label" [value]="value()[field.key]"
                                         (valueChange)="setText(field.key, $event)" />
    }
  `,
  styles: `
    .row { display: flex; gap: 8px; margin-bottom: 8px; }
    .value { width: 160px; }
    .entry { flex: 1; }
  `,
})
export class NewValueEditor {
  readonly value = input.required<NewValue>();
  readonly valueChange = output<NewValue>();

  protected readonly optionalTexts: { key: OptionalText; label: string }[] = [
    { key: 'label', label: 'Label' },
    { key: 'description', label: 'Beschreibung' },
  ];

  patch(p: Partial<NewValue>): void {
    this.valueChange.emit(patchObject(this.value(), p));
  }

  setText(key: OptionalText, text: LanguageTaggedText | undefined): void {
    this.patch({ [key]: text });
  }
}
