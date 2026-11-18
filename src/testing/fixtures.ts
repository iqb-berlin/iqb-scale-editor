import { DerivedScale } from '../app/derived/model/derived-scale.model';

/** Valid scale modelled on the MAP example of the spec README (with mappingsElse). */
export const VALID_DERIVED_MAP_SCALE: DerivedScale = {
  id: 'derived2.comp-level',
  name: [{ lang: 'de', value: 'Kompetenzstufe' }],
  method: 'MAP',
  sources: ['base2.wle'],
  publicVocabularyUrl: 'https://w3id.org/iqb/v71/mp1/',
  mappings: [
    {
      method: 'MIN',
      parameters: ['600'],
      newValue: {
        value: 5,
        label: [{ lang: 'de', value: 'V' }],
        description: [{ lang: 'de', value: 'Optimalstandard' }],
        publicVocabularyEntry: 'p2p',
      },
    },
  ],
  mappingsElse: { value: 1, label: [{ lang: 'de', value: 'Ia' }], publicVocabularyEntry: 'a9d' },
};
