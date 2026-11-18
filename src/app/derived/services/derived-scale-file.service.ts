import { Injectable } from '@angular/core';
import { ScaleFileServiceBase } from '../../shared/services/scale-file.service.base';
import { DerivedScale } from '../model/derived-scale.model';
import { normalizeDerivedScaleInput } from '../model/derived-scale-normalize';
import { validateDerivedScale } from '../model/derived-scale-validation';

@Injectable({ providedIn: 'root' })
export class DerivedScaleFileService extends ScaleFileServiceBase<DerivedScale> {
  protected validate(data: unknown) {
    return validateDerivedScale(data);
  }

  protected override normalize(data: object): unknown {
    return normalizeDerivedScaleInput(data);
  }
}
