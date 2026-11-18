import { makeIndex } from '../../../testing/fixtures-index';
import { AcpIndex, AssessmentPart } from './acp-index.model';
import { checkIndex, knownItemIds } from './index-checks';

/** Index with units/items matching the base scale fixture (items M001, M002). */
function indexWithUnits(): AcpIndex {
  const index = makeIndex();
  const part = index.assessmentParts![0];
  part['units'] = [{ id: 'M', items: [{ id: '001', sourceVariable: 'v1' }, { id: 'M002', sourceVariable: 'v2', useUnitAliasAsPrefix: false }] }];
  part['bookletModules'] = [{ id: 'B1', units: [{ id: 'M', alias: 'MA' }] }];
  // derived scale sources must refer to a scale of the index
  part.derivedScales![0].sources = ['bs2024.ma.9.wle'];
  return index;
}

describe('checkIndex (REQ-014)', () => {
  it('TC-240 no warnings for a consistent index', () => {
    expect(checkIndex(indexWithUnits())).toEqual([]);
  });

  it('TC-241 duplicate scale ids across parts and types warn on each occurrence', () => {
    const index = indexWithUnits();
    index.assessmentParts![1].derivedScales = [{ ...index.assessmentParts![0].derivedScales![0], id: 'bs2024.ma.9.wle' }];
    const w = checkIndex(index).filter((x) => x.path === '/id');
    expect(w.map((x) => [x.part, x.type])).toEqual([[0, 'base'], [1, 'derived']]);
    expect(w[0].message).toContain('2-mal');
  });

  it('TC-242 unknown sources of derived scales warn', () => {
    const index = indexWithUnits();
    index.assessmentParts![0].derivedScales![0].sources = ['bs2024.ma.9.wle', 'nope'];
    expect(checkIndex(index)).toEqual([
      { part: 0, type: 'derived', index: 0, path: '/sources/1', message: 'Quelle "nope" ist keine Skala dieses Index' },
    ]);
  });

  it('TC-243 base scale items not defined in the units of the part warn', () => {
    const index = indexWithUnits();
    index.assessmentParts![0].baseScales![0].items.push({ id: 'X99' });
    expect(checkIndex(index).map((w) => w.path)).toEqual(['/items/2/id']);
  });

  it('TC-244 item ids: unit id or booklet alias as prefix with "", "_", "-", "." (Q-015), or plain if useUnitAliasAsPrefix=false', () => {
    const ids = knownItemIds(indexWithUnits().assessmentParts![0] as AssessmentPart)!;
    for (const id of ['M001', 'M_001', 'MA001', 'MA.001', 'MA-001', 'M002']) expect(ids.has(id)).toBe(true);
    expect(ids.has('001')).toBe(false);
    expect(ids.has('MM002')).toBe(false);
  });

  it('TC-245 item check is skipped if the part defines no unit items; robust against junk', () => {
    expect(knownItemIds({ id: 'p', name: [], units: [{ id: 'U' }] } as AssessmentPart)).toBeNull();
    expect(checkIndex(makeIndex()).some((w) => w.path.startsWith('/items'))).toBe(false);
    expect(checkIndex(null)).toEqual([]);
    expect(checkIndex({ assessmentParts: [null, { baseScales: 'x' }] } as never)).toEqual([]);
  });
});
