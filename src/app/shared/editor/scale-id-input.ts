import { Component, computed, inject, input, output } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SCALE_TYPE_LABELS } from '../model/scale-type';
import { filterScaleIds, ScaleIdSuggestionsService } from '../services/scale-id-suggestions.service';

/**
 * Text field for a scale id with autocompletion of all known scale ids (DEC-031).
 * Free text is always allowed – a new id does not have to exist.
 */
@Component({
  selector: 'app-scale-id-input',
  imports: [MatAutocompleteModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field class="field" [subscriptSizing]="hint() ? 'fixed' : 'dynamic'">
      <mat-label>{{ label() }}</mat-label>
      <input matInput [attr.data-testid]="testId()" [value]="value()" [matAutocomplete]="auto"
             (input)="valueChange.emit($any($event.target).value)" />
      <mat-autocomplete #auto="matAutocomplete" (optionSelected)="valueChange.emit($event.option.value)">
        @for (s of options(); track s.id) {
          <mat-option [value]="s.id">
            <span class="id">{{ s.id }}</span>
            <span class="ctx">{{ typeLabels[s.type] }}@if (s.context) { · {{ s.context }}}</span>
          </mat-option>
        }
      </mat-autocomplete>
      @if (hint()) { <mat-hint>{{ hint() }}</mat-hint> }
    </mat-form-field>
  `,
  styles: `
    :host { display: block; }
    .field { width: 100%; }
    .id { margin-right: 8px; }
    .ctx { font: var(--mat-sys-body-small); color: var(--mat-sys-on-surface-variant); }
  `,
})
export class ScaleIdInput {
  private readonly suggestions = inject(ScaleIdSuggestionsService);
  readonly label = input('ID');
  readonly value = input.required<string>();
  readonly hint = input<string>('');
  readonly testId = input<string | null>(null);
  /** Ids not to suggest (e.g. the scale's own id for its sources). */
  readonly exclude = input<string[]>([]);
  readonly valueChange = output<string>();

  protected readonly typeLabels = SCALE_TYPE_LABELS;
  readonly options = computed(() => filterScaleIds(this.suggestions.all(), this.value(), this.exclude()));
}
