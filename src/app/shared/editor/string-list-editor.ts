import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

/** Edits a list of strings. */
@Component({
  selector: 'app-string-list-editor',
  imports: [MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule],
  template: `
    <div class="list">
      <div class="list-label">{{ label() }}</div>
      @for (item of value(); track $index; let i = $index) {
        <div class="row">
          <mat-form-field class="text" subscriptSizing="dynamic">
            <mat-label>{{ itemLabel() }} {{ i + 1 }}</mat-label>
            <input matInput [value]="item" (input)="set(i, $any($event.target).value)" />
          </mat-form-field>
          <button mat-icon-button type="button" aria-label="Eintrag entfernen"
                  [disabled]="value().length <= minItems()" (click)="remove(i)">
            <mat-icon>delete</mat-icon>
          </button>
        </div>
      }
      <button mat-button type="button" (click)="add()"><mat-icon>add</mat-icon> {{ itemLabel() }}</button>
    </div>
  `,
  styles: `
    .list-label { font: var(--mat-sys-label-large); margin-bottom: 4px; }
    .row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
    .text { flex: 1; }
  `,
})
export class StringListEditor {
  readonly label = input('');
  readonly itemLabel = input('Eintrag');
  readonly value = input.required<string[]>();
  readonly minItems = input(0);
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
