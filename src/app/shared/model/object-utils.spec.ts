import { patchObject } from './object-utils';

describe('patchObject', () => {
  it('TC-080 merges a patch and removes properties set to undefined', () => {
    const before: { a: number; b?: string; c?: string } = { a: 1, b: 'x' };
    expect(patchObject(before, { a: 2, b: undefined, c: 'y' })).toEqual({ a: 2, c: 'y' });
    expect(before).toEqual({ a: 1, b: 'x' });
  });
});
