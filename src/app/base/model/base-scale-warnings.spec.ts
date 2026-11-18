import { VALID_BASE_WLE_SCALE } from '../../../testing/fixtures-base';
import { checkBaseScaleWarnings } from './base-scale-warnings';

describe('checkBaseScaleWarnings (REQ-012)', () => {
  const paths = (data: unknown) => checkBaseScaleWarnings(data).map((w) => w.path);
  const plain = { id: 'x', items: [{ id: 'a' }] };

  it('TC-180 no warnings for a correct WLE scale', () => {
    expect(checkBaseScaleWarnings(VALID_BASE_WLE_SCALE)).toEqual([]);
  });

  it('TC-181 CODE_COUNT without codeValue warns', () => {
    expect(paths({ ...plain, method: 'CODE_COUNT' })).toEqual(['/methodParameters']);
    expect(paths({ ...plain, method: 'CODE_COUNT', methodParameters: { codeValue: 9 } })).toEqual([]);
  });

  it('TC-182 SCORE_RATIO without maxValue is fine (number of items is used)', () => {
    expect(paths({ ...plain, method: 'SCORE_RATIO' })).toEqual([]);
  });

  it('TC-183 methodParameters not matching the method warn', () => {
    expect(paths({ ...plain, method: 'SCORE_SUM', methodParameters: { maxValue: 3 } })).toEqual(['/methodParameters']);
    expect(paths({ ...plain, method: 'SCORE_RATIO', methodParameters: { codeValue: 3 } })).toEqual(['/methodParameters']);
  });

  it('TC-184 logit parameters with a method other than WLE warn', () => {
    expect(paths({ ...VALID_BASE_WLE_SCALE, method: 'SCORE_SUM' })).toEqual(['/items/0/parameters', '/items/1/parameters']);
  });

  it('TC-185 missing or non-numeric parameter values warn', () => {
    const item = { id: 'a', parameters: [{ key: 'LOGIT_FULL_CREDIT' }, { key: 'LOGIT_PARTIAL_CREDIT_1', value: '0,5' }] };
    const w = checkBaseScaleWarnings({ ...VALID_BASE_WLE_SCALE, items: [item] });
    expect(w.map((x) => x.path)).toEqual(['/items/0/parameters/0/value', '/items/0/parameters/1/value']);
    expect(w[0].message).toBe('Wert fehlt');
    expect(w[1].message).toContain('keine Zahl');
  });

  it('TC-186 is robust against schema-invalid input', () => {
    expect(checkBaseScaleWarnings(null)).toEqual([]);
    expect(checkBaseScaleWarnings({ items: [null, { parameters: [null] }], method: 'WLE' }).length).toBe(1);
  });

  it('TC-187 minItemNumber larger than the number of items or negative warns', () => {
    expect(paths({ ...VALID_BASE_WLE_SCALE, minItemNumber: 2 })).toEqual([]);
    expect(paths({ ...VALID_BASE_WLE_SCALE, minItemNumber: 0 })).toEqual([]);
    expect(checkBaseScaleWarnings({ ...VALID_BASE_WLE_SCALE, minItemNumber: 3 })[0].message)
      .toBe('Mindestanzahl Items (3) ist größer als die Anzahl der Items (2)');
    expect(checkBaseScaleWarnings({ ...VALID_BASE_WLE_SCALE, minItemNumber: -1 })[0].message)
      .toBe('Mindestanzahl Items ist negativ');
  });
});
