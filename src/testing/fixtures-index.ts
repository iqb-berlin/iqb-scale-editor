import { AcpIndex } from '../app/index/model/acp-index.model';
import { VALID_DERIVED_MAP_SCALE } from './fixtures';
import { VALID_BASE_WLE_SCALE } from './fixtures-base';

/** acp index with two parts; contains content the editor must keep untouched. */
export function makeIndex(): AcpIndex {
  return {
    packageId: 'iqb.ma.9',
    version: '1.2.0',
    name: [{ lang: 'de', value: 'Mathematik 9' }],
    status: 'IN_DEVELOPMENT',
    codingParameters: { itemValues: [{ type: 'FULL_CREDIT', value: 1 }] },
    assessmentParts: [
      {
        id: 'part1',
        name: [{ lang: 'de', value: 'Teil 1' }],
        units: [{ id: 'U1', any: { nested: [1, 2, 3] } }],
        bookletModules: [{ id: 'M1', units: [{ id: 'U1' }] }],
        instruments: [{ id: 'I1', name: [{ lang: 'de', value: 'I' }], testcenterBooklet: [] }],
        baseScales: [structuredClone(VALID_BASE_WLE_SCALE)],
        derivedScales: [structuredClone(VALID_DERIVED_MAP_SCALE)],
      },
      {
        id: 'part2',
        name: [{ lang: 'en', value: 'Part 2' }],
        units: [],
        bookletModules: [],
        instruments: [],
      },
    ],
  };
}
