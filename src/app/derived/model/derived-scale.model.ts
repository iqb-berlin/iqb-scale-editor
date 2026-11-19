/**
 * Data model for scales according to the specification
 * acp-scale-derived@0.4 (https://iqb-specifications.github.io/acp-scale-derived/).
 */
import { LanguageTaggedText } from '../../shared/model/language-tagged-text';

export const DERIVED_SCALE_SCHEMA_ID = 'acp-scale-derived';
export const DERIVED_SCALE_SCHEMA_VERSION = '0.4';

export const DERIVED_SCALE_METHODS = ['SUM', 'MEAN', 'MAP'] as const;
export type DerivedScaleMethod = (typeof DERIVED_SCALE_METHODS)[number];

export const MAPPING_METHODS = ['EQUALS', 'LESS_THAN', 'MORE_THAN', 'MAX', 'MIN'] as const;
export type MappingMethod = (typeof MAPPING_METHODS)[number];

export interface NewValue {
  value: number;
  label?: LanguageTaggedText;
  description?: LanguageTaggedText;
  /** URL suffix for a specific entry of the public vocabulary. */
  publicVocabularyEntry?: string;
}

export interface Mapping {
  method: MappingMethod;
  parameters: string[];
  newValue: NewValue;
}

export interface DerivedScale {
  id: string;
  name: LanguageTaggedText;
  description?: LanguageTaggedText;
  /** IDs of the scales providing their values to this scale (min. 1). */
  sources: string[];
  /** Defaults to MAP. */
  method?: DerivedScaleMethod;
  publicVocabularyUrl?: string;
  /** Applied for method MAP; the first match wins. */
  mappings?: Mapping[];
  mappingsElse?: NewValue;
}
