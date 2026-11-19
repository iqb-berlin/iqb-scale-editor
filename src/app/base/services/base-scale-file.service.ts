import { Injectable } from '@angular/core';
import { ScaleFileServiceBase } from '../../shared/services/scale-file.service.base';
import { BaseScale } from '../model/base-scale.model';
import { validateBaseScale } from '../model/base-scale-validation';

@Injectable({ providedIn: 'root' })
export class BaseScaleFileService extends ScaleFileServiceBase<BaseScale> {
  protected validate(data: unknown) {
    return validateBaseScale(data);
  }
}
