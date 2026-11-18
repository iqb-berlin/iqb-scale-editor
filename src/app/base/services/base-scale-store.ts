import { Injectable } from '@angular/core';
import { ScaleStoreBase } from '../../shared/services/scale-store.base';
import { createEmptyBaseScale } from '../model/base-scale.factory';
import { BaseScale } from '../model/base-scale.model';
import { validateBaseScale } from '../model/base-scale-validation';
import { checkBaseScaleWarnings } from '../model/base-scale-warnings';

/** Holds the base scale currently open in the editor. */
@Injectable({ providedIn: 'root' })
export class BaseScaleStore extends ScaleStoreBase<BaseScale> {
  protected createEmpty() {
    return createEmptyBaseScale();
  }

  protected validate(scale: BaseScale) {
    return validateBaseScale(scale);
  }

  protected override checkWarnings(scale: BaseScale) {
    return checkBaseScaleWarnings(scale);
  }
}
