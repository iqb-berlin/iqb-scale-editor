/**
 * Minimal view of an assessment content package index according to
 * acp-index@0.6 (https://iqb-specifications.github.io/acp-index/).
 * Only the parts needed to edit scales are typed; everything else is kept untouched (DEC-026).
 */
import { BaseScale } from '../../base/model/base-scale.model';
import { DerivedScale } from '../../derived/model/derived-scale.model';
import { LanguageTaggedText } from '../../shared/model/language-tagged-text';
import { ScaleType } from '../../shared/model/scale-type';

export const ACP_INDEX_SCHEMA_ID = 'acp-index';
export const ACP_INDEX_SCHEMA_VERSION = '0.6';

export interface AssessmentPart {
  id: string;
  name: LanguageTaggedText;
  baseScales?: BaseScale[];
  derivedScales?: DerivedScale[];
  [other: string]: unknown;
}

export interface AcpIndex {
  packageId: string;
  version: string;
  name: LanguageTaggedText;
  assessmentParts?: AssessmentPart[];
  [other: string]: unknown;
}

/** Property of an assessment part holding scales of the given type. */
export const SCALE_LIST_KEY: Record<ScaleType, 'baseScales' | 'derivedScales'> = {
  base: 'baseScales',
  derived: 'derivedScales',
};

/** True if the data looks like an acp index (`packageId` or `assessmentParts`). */
export function isIndexData(data: unknown): boolean {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
  return 'packageId' in data || 'assessmentParts' in data;
}
