import { DEFAULT_LANGUAGE } from '../../shared/model/language-tagged-text';
import { BaseScale } from './base-scale.model';

/** Creates a new, empty base scale (DEC-019). */
export function createEmptyBaseScale(): BaseScale {
  return {
    id: '',
    name: [{ lang: DEFAULT_LANGUAGE, value: '' }],
    method: 'SCORE_SUM',
    items: [{ id: '' }],
  };
}
