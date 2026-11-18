import { VALID_DERIVED_MAP_SCALE } from '../../../testing/fixtures';
import { VALID_BASE_WLE_SCALE } from '../../../testing/fixtures-base';
import { detectScaleType, parseJsonObject } from './scale-type';

describe('detectScaleType (REQ-010)', () => {
  it('TC-150 detects complete scales', () => {
    expect(detectScaleType(VALID_BASE_WLE_SCALE)).toBe('base');
    expect(detectScaleType(VALID_DERIVED_MAP_SCALE)).toBe('derived');
  });

  it('TC-151 detects by single characteristic properties or method', () => {
    expect(detectScaleType({ items: [] })).toBe('base');
    expect(detectScaleType({ minItemNumber: 0 })).toBe('base');
    expect(detectScaleType({ method: 'CODE_COUNT' })).toBe('base');
    expect(detectScaleType({ sources: [] })).toBe('derived');
    expect(detectScaleType({ mappingElse: {} })).toBe('derived');
    expect(detectScaleType({ method: 'MAP' })).toBe('derived');
  });

  it('TC-152 returns null for undetectable or ambiguous data', () => {
    expect(detectScaleType({ id: 'x', name: [] })).toBeNull();
    expect(detectScaleType({ items: [], sources: [] })).toBeNull();
    expect(detectScaleType({ method: 'SUM', items: [] })).toBeNull();
    expect(detectScaleType(null)).toBeNull();
    expect(detectScaleType([])).toBeNull();
  });

  it('TC-153 parseJsonObject accepts objects only', () => {
    expect(parseJsonObject('{"a":1}')).toEqual({ ok: true, data: { a: 1 } });
    expect(parseJsonObject('[1]').ok).toBe(false);
    expect(parseJsonObject('{').ok).toBe(false);
  });
});
