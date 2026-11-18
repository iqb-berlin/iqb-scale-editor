import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ScaleIdInput } from './scale-id-input';

/** List of scale ids (e.g. `sources`) with autocompletion per entry. */
@Component({
  selector: 'app-scale-id-list-editor',
  imports: [MatButtonModule, MatIconModule, ScaleIdInput],
  template: `
    @for (item of value(); track $index; let i = $index) {
      <div class="row">
        <app-scale-id-input class="grow" [label]="itemLabel() + ' ' + (i + 1)" [value]="item" [exclude]="exclude()"
                            [testId]="'scale-id-list-' + i" (valueChange)="set(i, $event)" />
        <button mat-icon-button type="button" aria-label="Eintrag entfernen"
                [disabled]="value().length <= minItems()" (click)="remove(i)">
          <mat-icon>delete</mat-icon>
        </button>
      </div>
    }
    <button mat-button type="button" (click)="add()"><mat-icon>add</mat-icon> {{ itemLabel() }}</button>
  `,
  styles: `
    .row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
    .grow { flex: 1; }
  `,
})
export class ScaleIdListEditor {
  readonly itemLabel = input('Skala');
  readonly value = input.required<string[]>();
  readonly minItems = input(0);
  readonly exclude = input<string[]>([]);
  readonly valueChange = output<string[]>();

  set(i: number, v: string): void {
    this.valueChange.emit(this.value().map((e, j) => (j === i ? v : e)));
  }

  add(): void {
    this.valueChange.emit([...this.value(), '']);
  }

  remove(i: number): void {
    this.valueChange.emit(this.value().filter((_, j) => j !== i));
  }
}
