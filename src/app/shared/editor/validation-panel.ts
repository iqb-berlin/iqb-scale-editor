import { JsonPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { ValidationIssue, ValidationResult } from '../model/schema-validation';

/** "Prüfung" card: errors, warnings and JSON preview of a scale; shared by all scale types. */
@Component({
  selector: 'app-validation-panel',
  imports: [JsonPipe, MatCardModule, MatExpansionModule, MatIconModule],
  template: `
    <mat-card>
      <mat-card-header><mat-card-title>Prüfung</mat-card-title></mat-card-header>
      <mat-card-content>
        @if (validation(); as v) {
          @if (v.valid) {
            <p class="ok" data-testid="validation-ok">
              <mat-icon>check_circle</mat-icon> Gültig (Schema {{ schemaLabel() }} und Inhaltsprüfung)
            </p>
          } @else {
            <ul class="issues" data-testid="validation-issues">
              @for (issue of v.issues; track $index) {
                <li><code>{{ issue.path || '/' }}</code>: {{ issue.message }}</li>
              }
            </ul>
          }
        }
        @if (warnings().length) {
          <ul class="warnings" data-testid="validation-warnings">
            @for (w of warnings(); track $index) {
              <li><mat-icon inline>warning</mat-icon> <code>{{ w.path }}</code>: {{ w.message }}</li>
            }
          </ul>
        }
        <mat-expansion-panel>
          <mat-expansion-panel-header><mat-panel-title>JSON-Vorschau</mat-panel-title></mat-expansion-panel-header>
          <pre>{{ scale() | json }}</pre>
        </mat-expansion-panel>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    :host { display: block; }
    .ok { display: flex; align-items: center; gap: 4px; color: var(--mat-sys-primary); }
    .issues { color: var(--mat-sys-error); }
    .warnings { color: var(--mat-sys-tertiary); }
    pre { font-size: 12px; overflow: auto; }
  `,
})
export class ValidationPanel {
  readonly scale = input.required<unknown>();
  readonly validation = input<ValidationResult | null>(null);
  readonly warnings = input<ValidationIssue[]>([]);
  /** e.g. "acp-scale-derived@0.4" */
  readonly schemaLabel = input.required<string>();
}

/** Messages of all warnings at `prefix` or below (for inline display next to a field). */
export function warningsAt(warnings: ValidationIssue[], prefix: string): string[] {
  return warnings.filter((w) => w.path === prefix || w.path.startsWith(`${prefix}/`)).map((w) => w.message);
}
