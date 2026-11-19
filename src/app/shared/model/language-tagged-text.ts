/** Language tagged text, shared by all IQB scale specifications. */
export interface LanguageTaggedTextEntry {
  /** ISO 639-1 language code, two lowercase letters. */
  lang: string;
  value: string;
}

export type LanguageTaggedText = LanguageTaggedTextEntry[];

export const DEFAULT_LANGUAGE = 'de';
