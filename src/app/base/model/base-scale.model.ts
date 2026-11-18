/**
 * Data model for base scales according to the specification
 * acp-scale-base@0.4 (https://iqb-specifications.github.io/acp-scale-base/).
 */
import { LanguageTaggedText } from '../../shared/model/language-tagged-text';

export const BASE_SCALE_SCHEMA_ID = 'acp-scale-base';
export const BASE_SCALE_SCHEMA_VERSION = '0.4';

export const BASE_SCALE_METHODS = [
  'SCORE_SUM',
  'SCORE_RATIO',
  'SCORE_MEAN',
  'SCORE_MEDIAN',
  'WLE',
  'CODE_COUNT',
] as const;
export type BaseScaleMethod = (typeof BASE_SCALE_METHODS)[number];

export const ITEM_PARAMETER_KEYS = [
  'LOGIT_FULL_CREDIT',
  'LOGIT_PARTIAL_CREDIT_1',
  'LOGIT_PARTIAL_CREDIT_2',
  'LOGIT_PARTIAL_CREDIT_3',
] as const;
export type ItemParameterKey = (typeof ITEM_PARAMETER_KEYS)[number];

/** Parameters for SCORE_RATIO; without them the number of items is taken as maxValue. */
export interface MethodParametersScoreRatio {
  maxValue: number;
}

/** Parameters for CODE_COUNT: the code to be counted. */
export interface MethodParametersCodeCount {
  codeValue: number;
}

export type MethodParameters = MethodParametersScoreRatio | MethodParametersCodeCount;

export interface ItemParameter {
  key: ItemParameterKey;
  value?: string;
}

export interface ItemInScale {
  /** Refers to the unique identifier of the item in the unit list. */
  id: string;
  parameters?: ItemParameter[];
  /** Defaults to 1. */
  weight?: number;
}

export interface BaseScale {
  id: string;
  name?: LanguageTaggedText;
  description?: LanguageTaggedText;
  method: BaseScaleMethod;
  methodParameters?: MethodParameters;
  /** At least one item. */
  items: ItemInScale[];
  /** Minimum number of items in responses for the scale to be reported; 0 = unlimited (default). */
  minItemNumber?: number;
}

/** Which methodParameters variant a method uses (undefined: none). */
export function methodParametersKind(method: unknown): 'maxValue' | 'codeValue' | undefined {
  if (method === 'SCORE_RATIO') return 'maxValue';
  if (method === 'CODE_COUNT') return 'codeValue';
  return undefined;
}
