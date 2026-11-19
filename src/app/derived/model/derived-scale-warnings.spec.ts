import { VALID_DERIVED_MAP_SCALE } from '../../../testing/fixtures';
import { Mapping } from './derived-scale.model';
import { checkDerivedScaleWarnings, isNumericParameter } from './derived-scale-warnings';

function withMapping(method: string, parameters: string[]) {
  const mapping = { method, parameters, newValue: { value: 1 } } as Mapping;
  return { ...VALID_DERIVED_MAP_SCALE, mappings: [mapping] };
}

describe('checkDerivedScaleWarnings (REQ-006)', () => {
  it('TC-090 no warnings for a correct scale', () => {
    expect(checkDerivedScaleWarnings(VALID_DERIVED_MAP_SCALE)).toEqual([]);
  });

  it.each(['MIN', 'MAX', 'LESS_THAN', 'MORE_THAN'])('TC-091 %s with one number is fine', (m) => {
    expect(checkDerivedScaleWarnings(withMapping(m, ['-1.5']))).toEqual([]);
  });

  it.each(['MIN', 'MAX', 'LESS_THAN', 'MORE_THAN'])('TC-092 %s warns on wrong parameter count', (m) => {
    expect(checkDerivedScaleWarnings(withMapping(m, []))[0].path).toBe('/mappings/0/parameters');
    expect(checkDerivedScaleWarnings(withMapping(m, ['1', '2']))[0].message).toContain('genau einen');
  });

  it('TC-093 comparison methods warn on non-numeric parameters (incl. comma, empty)', () => {
    for (const p of ['abc', '1,5', '', ' ']) {
      const w = checkDerivedScaleWarnings(withMapping('MIN', [p]));
      expect(w).toHaveLength(1);
      expect(w[0].path).toBe('/mappings/0/parameters/0');
    }
  });

  it('TC-094 EQUALS needs at least one non-empty parameter, values may be non-numeric', () => {
    expect(checkDerivedScaleWarnings(withMapping('EQUALS', ['a', '2']))).toEqual([]);
    expect(checkDerivedScaleWarnings(withMapping('EQUALS', []))[0].message).toContain('mindestens einen');
    expect(checkDerivedScaleWarnings(withMapping('EQUALS', ['']))[0].path).toBe('/mappings/0/parameters/0');
  });

  it('TC-095 is robust against schema-invalid input', () => {
    expect(checkDerivedScaleWarnings(null)).toEqual([]);
    expect(checkDerivedScaleWarnings({ mappings: 'x' })).toEqual([]);
    expect(checkDerivedScaleWarnings({ mappings: [null, { method: 'MIN' }] })).toEqual([]);
  });

  it('TC-096 isNumericParameter accepts JSON numbers only', () => {
    expect(['0', '600', '-1.5', '1e3', ' 2 '].every(isNumericParameter)).toBe(true);
    expect(['', 'x', '1,5', 'NaN', 'Infinity'].some(isNumericParameter)).toBe(false);
  });
});

describe('checkDerivedScaleWarnings unused mappings (REQ-008)', () => {
  it('TC-117 warns about mappings/mappingsElse with SUM or MEAN, not with MAP', () => {
    expect(checkDerivedScaleWarnings({ ...VALID_DERIVED_MAP_SCALE, method: 'MEAN' }).map((w) => w.path))
      .toEqual(['/mappings', '/mappingsElse']);
    expect(checkDerivedScaleWarnings({ ...VALID_DERIVED_MAP_SCALE, method: 'SUM', mappings: [], mappingsElse: undefined }))
      .toEqual([]);
  });
});
