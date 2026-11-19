import { DEFAULT_LANGUAGE } from '../../shared/model/language-tagged-text';
import { createEmptyDerivedScale } from './derived-scale.factory';

describe('createEmptyDerivedScale (REQ-002)', () => {
  it('TC-001 creates a scale with default language, method MAP and one empty source', () => {
    const s = createEmptyDerivedScale();
    expect(s.id).toBe('');
    expect(s.name).toEqual([{ lang: DEFAULT_LANGUAGE, value: '' }]);
    expect(s.method).toBe('MAP');
    expect(s.sources).toEqual(['']);
    expect(s.mappings).toEqual([]);
  });

  it('TC-002 returns independent instances', () => {
    const a = createEmptyDerivedScale();
    a.name[0].value = 'changed';
    expect(createEmptyDerivedScale().name[0].value).toBe('');
  });
});
