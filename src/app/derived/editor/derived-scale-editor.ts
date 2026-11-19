import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { LanguageTextEditor } from '../../shared/editor/language-text-editor';
import { OptionalLanguageTextEditor } from '../../shared/editor/optional-language-text-editor';
import { ScaleIdInput } from '../../shared/editor/scale-id-input';
import { ScaleIdListEditor } from '../../shared/editor/scale-id-list-editor';
import { ValidationPanel, warningsAt } from '../../shared/editor/validation-panel';
import { StringListEditor } from '../../shared/editor/string-list-editor';
import { LanguageTaggedText } from '../../shared/model/language-tagged-text';
import { patchObject } from '../../shared/model/object-utils';
import { ConfirmService } from '../../shared/services/confirm.service';
import {
  DERIVED_SCALE_METHODS,
  DERIVED_SCALE_SCHEMA_ID,
  DERIVED_SCALE_SCHEMA_VERSION,
  DerivedScale,
  Mapping,
  MAPPING_METHODS,
  DerivedScaleMethod,
  NewValue,
} from '../model/derived-scale.model';
import { DerivedScaleStore } from '../services/derived-scale-store';
import { NewValueEditor } from './new-value-editor';

export const MAPPING_METHOD_LABELS: Record<string, string> = {
  EQUALS: 'gleich (EQUALS)',
  LESS_THAN: 'kleiner als (LESS_THAN)',
  MORE_THAN: 'größer als (MORE_THAN)',
  MAX: 'höchstens (MAX)',
  MIN: 'mindestens (MIN)',
};

/** Main editor for the scale held in {@link DerivedScaleStore}. */
@Component({
  selector: 'app-derived-scale-editor',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    LanguageTextEditor,
    NewValueEditor,
    OptionalLanguageTextEditor,
    ScaleIdInput,
    ScaleIdListEditor,
    StringListEditor,
    ValidationPanel,
  ],
  templateUrl: './derived-scale-editor.html',
  styleUrl: './derived-scale-editor.scss',
})
export class DerivedScaleEditor {
  protected readonly store = inject(DerivedScaleStore);
  private readonly confirmService = inject(ConfirmService);
  protected readonly scale = computed(() => this.store.scale()!);

  /**
   * Mappings and mappingsElse are only shown for method MAP (DEC-015) – or if data is present
   * anyway (e.g. loaded file), so it is not hidden from the user.
   */
  protected readonly showMappings = computed(() => {
    const s = this.scale();
    return (s.method ?? 'MAP') === 'MAP' || hasMappingData(s);
  });
  protected readonly scaleMethods = DERIVED_SCALE_METHODS;
  protected readonly mappingMethods = MAPPING_METHODS;
  protected readonly mappingMethodLabels = MAPPING_METHOD_LABELS;
  protected readonly schemaLabel = `${DERIVED_SCALE_SCHEMA_ID}@${DERIVED_SCALE_SCHEMA_VERSION}`;

  /**
   * Changes the method. Leaving MAP while mappings or mappingsElse exist asks for confirmation
   * and removes them; on cancel the selection is reverted (DEC-015).
   */
  changeMethod(event: MatSelectChange<DerivedScaleMethod>): void {
    const method = event.value;
    const s = this.scale();
    if (method === 'MAP') {
      this.patch({ method });
      return;
    }
    if (hasMappingData(s)) {
      const ok = this.confirmService.confirm(
        `Bei Methode ${method} werden keine Mappings verwendet. Vorhandene Regeln und Sonst-Wert entfernen?`,
      );
      if (!ok) {
        event.source.value = s.method ?? 'MAP';
        return;
      }
    }
    this.patch({ method, mappings: undefined, mappingsElse: undefined });
  }

  patch(p: Partial<DerivedScale>): void {
    this.store.update((s) => patchObject(s, p));
  }

  setDescription(text: LanguageTaggedText | undefined): void {
    this.patch({ description: text });
  }

  addMapping(): void {
    const mapping: Mapping = { method: 'EQUALS', parameters: [''], newValue: { value: 0 } };
    this.patch({ mappings: [...(this.scale().mappings ?? []), mapping] });
  }

  updateMapping(i: number, p: Partial<Mapping>): void {
    const mappings = (this.scale().mappings ?? []).map((m, j) => (j === i ? { ...m, ...p } : m));
    this.patch({ mappings });
  }

  removeMapping(i: number): void {
    this.patch({ mappings: (this.scale().mappings ?? []).filter((_, j) => j !== i) });
  }

  moveMapping(i: number, delta: number): void {
    const mappings = [...(this.scale().mappings ?? [])];
    const target = i + delta;
    if (target < 0 || target >= mappings.length) return;
    [mappings[i], mappings[target]] = [mappings[target], mappings[i]];
    this.patch({ mappings });
  }

  /** Warnings concerning the parameters of mapping i (shown inline). */
  mappingWarnings(i: number): string[] {
    return warningsAt(this.store.warnings(), `/mappings/${i}/parameters`);
  }

  setMappingsElse(v: NewValue | undefined): void {
    this.patch({ mappingsElse: v });
  }
}

/** True if the scale contains mapping rules or an else value. */
export function hasMappingData(s: DerivedScale): boolean {
  return (s.mappings?.length ?? 0) > 0 || s.mappingsElse !== undefined;
}
