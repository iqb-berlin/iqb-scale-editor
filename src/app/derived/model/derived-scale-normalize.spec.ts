import { normalizeDerivedScaleInput } from './derived-scale-normalize';

describe('normalizeDerivedScaleInput (DEC-004)', () => {
  it('TC-030 renames mappingElse to mappingsElse', () => {
    expect(normalizeDerivedScaleInput({ id: 'x', mappingElse: { value: 1 } })).toEqual({
      id: 'x',
      mappingsElse: { value: 1 },
    });
  });

  it('TC-031 keeps mappingsElse if both are present', () => {
    const input = { mappingElse: { value: 1 }, mappingsElse: { value: 2 } };
    expect(normalizeDerivedScaleInput(input)).toEqual(input);
  });

  it('TC-032 passes through non-objects unchanged', () => {
    expect(normalizeDerivedScaleInput([1])).toEqual([1]);
    expect(normalizeDerivedScaleInput(null)).toBeNull();
  });
});
