import { DEFAULT_LANGUAGE } from '../../shared/model/language-tagged-text';
import { DerivedScale } from './derived-scale.model';

/** Creates a new, empty derived scale. */
export function createEmptyDerivedScale(): DerivedScale {
  return {
    id: '',
    name: [{ lang: DEFAULT_LANGUAGE, value: '' }],
    sources: [''],
    method: 'MAP',
    mappings: [],
  };
}
