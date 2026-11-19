import { VALID_BASE_WLE_SCALE } from '../../../testing/fixtures-base';
import { BASE_SCALE_SCHEMA_ID, BASE_SCALE_SCHEMA_VERSION } from './base-scale.model';
import { createEmptyBaseScale } from './base-scale.factory';
import schema from './acp-scale-base.schema.json';
import { checkBaseScaleContent, validateBaseScale, validateBaseScaleSchema } from './base-scale-validation';

describe('validateBaseScale schema (REQ-011)', () => {
  const v = (data: unknown) => validateBaseScaleSchema(data);

  it('TC-160 accepts a valid WLE scale and a minimal scale without name', () => {
    expect(v(VALID_BASE_WLE_SCALE).valid).toBe(true);
    expect(v({ id: 'x', method: 'SCORE_SUM', items: [{ id: 'i1' }] }).valid).toBe(true);
  });

  it('TC-161 requires id, method and at least one item', () => {
    const r = v({});
    expect(r.issues.map((i) => i.message).join('|')).toMatch(/"id".*"method".*"items"/);
    expect(v({ id: 'x', method: 'WLE', items: [] }).valid).toBe(false);
  });

  it('TC-162 checks methodParameters variants', () => {
    const base = { id: 'x', items: [{ id: 'a' }] };
    expect(v({ ...base, method: 'SCORE_RATIO', methodParameters: { maxValue: 10 } }).valid).toBe(true);
    expect(v({ ...base, method: 'CODE_COUNT', methodParameters: { codeValue: 9 } }).valid).toBe(true);
    expect(v({ ...base, method: 'CODE_COUNT', methodParameters: { foo: 1 } }).valid).toBe(false);
    expect(v({ ...base, method: 'CODE_COUNT', methodParameters: { codeValue: '9' } }).valid).toBe(false);
  });

  it('TC-163 rejects unknown methods and parameter keys', () => {
    expect(v({ ...VALID_BASE_WLE_SCALE, method: 'SUM' }).valid).toBe(false);
    const item = { id: 'a', parameters: [{ key: 'LOGIT_X', value: '1' }] };
    expect(v({ ...VALID_BASE_WLE_SCALE, items: [item] }).valid).toBe(false);
  });

  it('TC-164 BASE_SCALE_SCHEMA_ID and _VERSION match the $id of the bundled schema', () => {
    expect(`${BASE_SCALE_SCHEMA_ID}@${BASE_SCALE_SCHEMA_VERSION}`).toBe(schema.$id);
  });
});

describe('checkBaseScaleContent (REQ-011)', () => {
  const paths = (data: unknown) => checkBaseScaleContent(data).map((i) => i.path);

  it('TC-165 no content errors for a correct scale', () => {
    expect(checkBaseScaleContent(VALID_BASE_WLE_SCALE)).toEqual([]);
  });

  it('TC-166 empty id, empty item ids and empty/duplicate texts are errors', () => {
    expect(paths({
      ...VALID_BASE_WLE_SCALE,
      id: ' ',
      name: [{ lang: 'de', value: '' }, { lang: 'de', value: 'x' }],
      items: [{ id: '' }],
    })).toEqual(['/id', '/name/0/value', '/name/1/lang', '/items/0/id']);
  });

  it('TC-167 duplicate item ids are errors', () => {
    const r = checkBaseScaleContent({ ...VALID_BASE_WLE_SCALE, items: [{ id: 'a' }, { id: 'b' }, { id: 'a' }] });
    expect(r).toEqual([{ path: '/items/2/id', message: 'Item-ID "a" ist doppelt' }]);
  });

  it('TC-168 duplicate parameter keys within an item are errors', () => {
    const item = { id: 'a', parameters: [{ key: 'LOGIT_FULL_CREDIT', value: '1' }, { key: 'LOGIT_FULL_CREDIT', value: '2' }] };
    expect(paths({ ...VALID_BASE_WLE_SCALE, items: [item] })).toEqual(['/items/0/parameters/1/key']);
  });

  it('TC-169 new empty base scale is schema-valid but has content errors', () => {
    const empty = createEmptyBaseScale();
    expect(validateBaseScaleSchema(empty).valid).toBe(true);
    expect(validateBaseScale(empty).issues.map((i) => i.path)).toEqual(['/id', '/name/0/value', '/items/0/id']);
  });

  it('TC-170 is robust against schema-invalid input', () => {
    expect(checkBaseScaleContent(null)).toEqual([]);
    expect(checkBaseScaleContent({ id: 1, items: 'x' })).toEqual([]);
    expect(checkBaseScaleContent({ items: [null, { parameters: [null, {}] }] })).toEqual([]);
  });
});
