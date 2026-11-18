import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { OptionalLanguageTextEditor } from '../../shared/editor/optional-language-text-editor';
import { ScaleIdInput } from '../../shared/editor/scale-id-input';
import { ValidationPanel, warningsAt } from '../../shared/editor/validation-panel';
import { LanguageTaggedText } from '../../shared/model/language-tagged-text';
import { optionalNumber } from '../../shared/model/number-utils';
import { patchObject } from '../../shared/model/object-utils';
import { ConfirmService } from '../../shared/services/confirm.service';
import {
  BASE_SCALE_METHODS,
  BASE_SCALE_SCHEMA_ID,
  BASE_SCALE_SCHEMA_VERSION,
  BaseScale,
  BaseScaleMethod,
  ITEM_PARAMETER_KEYS,
  ItemInScale,
  ItemParameter,
  methodParametersKind,
} from '../model/base-scale.model';
import { BaseScaleStore } from '../services/base-scale-store';

export const BASE_METHOD_LABELS: Record<BaseScaleMethod, string> = {
  SCORE_SUM: 'Summe der Scores (SCORE_SUM)',
  SCORE_RATIO: 'Anteil der Scores (SCORE_RATIO)',
  SCORE_MEAN: 'Mittelwert der Scores (SCORE_MEAN)',
  SCORE_MEDIAN: 'Median der Scores (SCORE_MEDIAN)',
  WLE: 'Personenparameter (WLE)',
  CODE_COUNT: 'Anzahl eines Codes (CODE_COUNT)',
};

/** Main editor for the scale held in {@link BaseScaleStore}. */
@Component({
  selector: 'app-base-scale-editor',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    OptionalLanguageTextEditor,
    ScaleIdInput,
    ValidationPanel,
  ],
  templateUrl: './base-scale-editor.html',
  styleUrl: './base-scale-editor.scss',
})
export class BaseScaleEditor {
  protected readonly store = inject(BaseScaleStore);
  private readonly confirmService = inject(ConfirmService);
  protected readonly scale = computed(() => this.store.scale()!);
  protected readonly methods = BASE_SCALE_METHODS;
  protected readonly methodLabels = BASE_METHOD_LABELS;
  protected readonly parameterKeys = ITEM_PARAMETER_KEYS;
  protected readonly schemaLabel = `${BASE_SCALE_SCHEMA_ID}@${BASE_SCALE_SCHEMA_VERSION}`;
  protected readonly optionalNumber = optionalNumber;

  /** Which methodParameters field to show for the current method. */
  protected readonly parametersKind = computed(() => methodParametersKind(this.scale().method));

  patch(p: Partial<BaseScale>): void {
    this.store.update((s) => patchObject(s, p));
  }

  setText(key: 'name' | 'description', text: LanguageTaggedText | undefined): void {
    this.patch({ [key]: text });
  }

  /**
   * Changes the method. Existing methodParameters that do not fit the new method are removed
   * after confirmation; on cancel the selection is reverted (DEC-022).
   */
  changeMethod(event: MatSelectChange<BaseScaleMethod>): void {
    const method = event.value;
    const s = this.scale();
    const mp = s.methodParameters;
    const newKind = methodParametersKind(method);
    if (mp && !(newKind && newKind in mp)) {
      const ok = this.confirmService.confirm(
        `Die Methodenparameter passen nicht zu ${method}. Methodenparameter entfernen?`,
      );
      if (!ok) {
        event.source.value = s.method;
        return;
      }
      this.patch({ method, methodParameters: undefined });
      return;
    }
    this.patch({ method });
  }

  /** Sets maxValue/codeValue; an empty field removes methodParameters. */
  setMethodParameter(value: number | undefined): void {
    const kind = this.parametersKind();
    if (!kind) return;
    this.patch({ methodParameters: value === undefined ? undefined : ({ [kind]: value } as never) });
  }

  methodParameterValue(): number | string {
    const kind = this.parametersKind();
    const mp = this.scale().methodParameters as Record<string, number> | undefined;
    return kind && mp && kind in mp ? mp[kind] : '';
  }

  // --- items ---

  addItem(): void {
    this.patch({ items: [...this.scale().items, { id: '' }] });
  }

  updateItem(i: number, p: Partial<ItemInScale>): void {
    this.patch({ items: this.scale().items.map((it, j) => (j === i ? patchObject(it, p) : it)) });
  }

  removeItem(i: number): void {
    this.patch({ items: this.scale().items.filter((_, j) => j !== i) });
  }

  addItemParameter(i: number): void {
    const item = this.scale().items[i];
    const used = new Set((item.parameters ?? []).map((p) => p.key));
    const key = ITEM_PARAMETER_KEYS.find((k) => !used.has(k)) ?? ITEM_PARAMETER_KEYS[0];
    this.updateItem(i, { parameters: [...(item.parameters ?? []), { key, value: '' }] });
  }

  updateItemParameter(i: number, j: number, p: Partial<ItemParameter>): void {
    const params = (this.scale().items[i].parameters ?? []).map((x, k) => (k === j ? { ...x, ...p } : x));
    this.updateItem(i, { parameters: params });
  }

  /** Removing the last parameter removes the `parameters` property. */
  removeItemParameter(i: number, j: number): void {
    const params = (this.scale().items[i].parameters ?? []).filter((_, k) => k !== j);
    this.updateItem(i, { parameters: params.length ? params : undefined });
  }

  warnings(prefix: string): string[] {
    return warningsAt(this.store.warnings(), prefix);
  }
}
