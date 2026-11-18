import { Injectable } from '@angular/core';
import { ScaleStoreBase } from '../../shared/services/scale-store.base';
import { createEmptyDerivedScale } from '../model/derived-scale.factory';
import { DerivedScale } from '../model/derived-scale.model';
import { validateDerivedScale } from '../model/derived-scale-validation';
import { checkDerivedScaleWarnings } from '../model/derived-scale-warnings';

/** Holds the derived scale currently open in the editor. */
@Injectable({ providedIn: 'root' })
export class DerivedScaleStore extends ScaleStoreBase<DerivedScale> {
  protected createEmpty() {
    return createEmptyDerivedScale();
  }

  protected validate(scale: DerivedScale) {
    return validateDerivedScale(scale);
  }

  protected override checkWarnings(scale: DerivedScale) {
    return checkDerivedScaleWarnings(scale);
  }
}
