import schema from './acp-scale-derived.schema.json';
import { DERIVED_SCALE_SCHEMA_ID, DERIVED_SCALE_SCHEMA_VERSION } from './derived-scale.model';
import { VALID_DERIVED_MAP_SCALE } from '../../../testing/fixtures';
import { createEmptyDerivedScale } from './derived-scale.factory';
import { checkDerivedScaleContent, validateDerivedScale, validateDerivedScaleSchema } from './derived-scale-validation';

describe('validateDerivedScale (REQ-005)', () => {
  it('TC-010 accepts a valid MAP scale', () => {
    expect(validateDerivedScale(VALID_DERIVED_MAP_SCALE)).toEqual({ valid: true, issues: [] });
  });

  it('TC-011 accepts a minimal scale (id, name, sources)', () => {
    const r = validateDerivedScale({ id: 'x', name: [{ lang: 'de', value: 'X' }], sources: ['a'] });
    expect(r.valid).toBe(true);
  });

  it('TC-012 reports missing required fields', () => {
    const r = validateDerivedScale({});
    expect(r.valid).toBe(false);
    const messages = r.issues.map((i) => i.message).join('|');
    expect(messages).toContain('"id"');
    expect(messages).toContain('"name"');
    expect(messages).toContain('"sources"');
  });

  it('TC-013 rejects empty sources', () => {
    const r = validateDerivedScale({ ...VALID_DERIVED_MAP_SCALE, sources: [] });
    expect(r.valid).toBe(false);
    expect(r.issues.some((i) => i.path === '/sources')).toBe(true);
  });

  it('TC-014 rejects language codes not matching ^[a-z]{2}$', () => {
    const r = validateDerivedScale({ ...VALID_DERIVED_MAP_SCALE, name: [{ lang: 'de-DE', value: 'X' }] });
    expect(r.valid).toBe(false);
    expect(r.issues[0].path).toBe('/name/0/lang');
  });

  it('TC-015 rejects unknown properties (e.g. mappingElse)', () => {
    const r = validateDerivedScale({ ...VALID_DERIVED_MAP_SCALE, mappingElse: { value: 1 } });
    expect(r.valid).toBe(false);
    expect(r.issues[0].message).toContain('mappingElse');
  });

  it('TC-016 rejects unknown mapping and scale methods', () => {
    expect(validateDerivedScale({ ...VALID_DERIVED_MAP_SCALE, method: 'MEDIAN' }).valid).toBe(false);
    const badMapping = { ...VALID_DERIVED_MAP_SCALE.mappings![0], method: 'BETWEEN' };
    expect(validateDerivedScale({ ...VALID_DERIVED_MAP_SCALE, mappings: [badMapping] }).valid).toBe(false);
  });

  it('TC-017 rejects a non-numeric newValue.value', () => {
    const r = validateDerivedScale({ ...VALID_DERIVED_MAP_SCALE, mappingsElse: { value: '1' } });
    expect(r.valid).toBe(false);
  });

  it('TC-018 a new empty scale is schema-valid but fails the content checks (DEC-014)', () => {
    const empty = createEmptyDerivedScale();
    expect(validateDerivedScaleSchema(empty).valid).toBe(true);
    const r = validateDerivedScale(empty);
    expect(r.valid).toBe(false);
    expect(r.issues.map((i) => i.path)).toEqual(['/id', '/name/0/value', '/sources/0']);
  });
});

describe('schema constants', () => {
  it('TC-019 DERIVED_SCALE_SCHEMA_ID and DERIVED_SCALE_SCHEMA_VERSION match the $id of the bundled schema', () => {
    expect(`${DERIVED_SCALE_SCHEMA_ID}@${DERIVED_SCALE_SCHEMA_VERSION}`).toBe(schema.$id);
  });
});

describe('checkDerivedScaleContent (REQ-007)', () => {
  const base = VALID_DERIVED_MAP_SCALE;
  const paths = (data: unknown) => checkDerivedScaleContent(data).map((i) => i.path);

  it('TC-100 no content errors for a correct scale', () => {
    expect(checkDerivedScaleContent(base)).toEqual([]);
  });

  it('TC-101 empty or whitespace-only id is an error', () => {
    expect(paths({ ...base, id: '  ' })).toEqual(['/id']);
  });

  it('TC-102 empty source entries are errors', () => {
    expect(paths({ ...base, sources: ['a', '', ' '] })).toEqual(['/sources/1', '/sources/2']);
  });

  it('TC-103 empty texts in name/description are errors', () => {
    expect(paths({ ...base, name: [{ lang: 'de', value: '' }], description: [{ lang: 'en', value: ' ' }] }))
      .toEqual(['/name/0/value', '/description/0/value']);
  });

  it('TC-104 duplicate languages in a text are errors', () => {
    const r = checkDerivedScaleContent({ ...base, name: [{ lang: 'de', value: 'a' }, { lang: 'de', value: 'b' }] });
    expect(r).toEqual([{ path: '/name/1/lang', message: 'Name: Sprache "de" ist doppelt' }]);
  });

  it('TC-105 texts of mapping values and mappingsElse are checked', () => {
    const mapping = { ...base.mappings![0], newValue: { value: 1, label: [{ lang: 'de', value: '' }] } };
    const elseValue = { value: 0, description: [{ lang: 'de', value: 'x' }, { lang: 'de', value: 'y' }] };
    expect(paths({ ...base, mappings: [mapping], mappingsElse: elseValue }))
      .toEqual(['/mappings/0/newValue/label/0/value', '/mappingsElse/description/1/lang']);
  });

  it('TC-106 content errors make validateDerivedScale invalid', () => {
    const r = validateDerivedScale({ ...base, id: '' });
    expect(r.valid).toBe(false);
    expect(r.issues[0].message).toBe('ID ist leer');
  });

  it('TC-107 is robust against schema-invalid input', () => {
    expect(checkDerivedScaleContent(null)).toEqual([]);
    expect(checkDerivedScaleContent([])).toEqual([]);
    expect(checkDerivedScaleContent({ id: 3, name: 'x', sources: 'y', mappings: [null, {}] })).toEqual([]);
  });
});
