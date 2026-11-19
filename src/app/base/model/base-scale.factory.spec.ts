import { createEmptyBaseScale } from './base-scale.factory';

describe('createEmptyBaseScale (REQ-011)', () => {
  it('TC-202 creates id, name (de), method SCORE_SUM and one empty item', () => {
    expect(createEmptyBaseScale()).toEqual({
      id: '',
      name: [{ lang: 'de', value: '' }],
      method: 'SCORE_SUM',
      items: [{ id: '' }],
    });
  });
});
