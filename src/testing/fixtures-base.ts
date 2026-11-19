import { BaseScale } from '../app/base/model/base-scale.model';

/** Valid WLE base scale with item logits. */
export const VALID_BASE_WLE_SCALE: BaseScale = {
  id: 'bs2024.ma.9.wle',
  name: [{ lang: 'de', value: 'Mathematik global' }],
  method: 'WLE',
  items: [
    { id: 'M001', parameters: [{ key: 'LOGIT_FULL_CREDIT', value: '-0.52' }] },
    {
      id: 'M002',
      weight: 2,
      parameters: [
        { key: 'LOGIT_FULL_CREDIT', value: '1.1' },
        { key: 'LOGIT_PARTIAL_CREDIT_1', value: '0.3' },
      ],
    },
  ],
  minItemNumber: 1,
};
