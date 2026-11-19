import { TestBed } from '@angular/core/testing';
import { VALID_DERIVED_MAP_SCALE } from '../../../testing/fixtures';
import {
  fakeHandle,
  FileAccessMock,
  mockFileAccess,
  provideFileAccessMock,
} from '../../../testing/file-access.mock';
import { JsonFileService } from '../../shared/services/json-file.service';
import { DerivedScaleFileService } from './derived-scale-file.service';

function setup(supported: boolean): { service: DerivedScaleFileService; fa: FileAccessMock } {
  const fa = mockFileAccess(supported);
  TestBed.configureTestingModule({ providers: [provideFileAccessMock(fa)] });
  return { service: TestBed.inject(DerivedScaleFileService), fa };
}

describe('DerivedScaleFileService with File System Access API (REQ-009)', () => {
  it('TC-122 save with a handle writes into that file without asking', async () => {
    const { service, fa } = setup(true);
    const h = fakeHandle('a.json');
    const target = await service.save(VALID_DERIVED_MAP_SCALE, h as never, 'a.json');
    expect(fa.pickSave).not.toHaveBeenCalled();
    expect(h.written).toEqual([service.serialize(VALID_DERIVED_MAP_SCALE)]);
    expect(target).toEqual({ fileName: 'a.json', handle: h });
  });

  it('TC-123 save without a handle asks for a target (suggested name from id)', async () => {
    const { service, fa } = setup(true);
    const h = fakeHandle('chosen.json');
    fa.pickSave.mockResolvedValue(h);
    const target = await service.save(VALID_DERIVED_MAP_SCALE, null, null);
    expect(fa.pickSave).toHaveBeenCalledWith('derived2.comp-level.json');
    expect(h.written).toHaveLength(1);
    expect(target).toEqual({ fileName: 'chosen.json', handle: h });
  });

  it('TC-124 saveAs always asks, even with a linked file; cancel returns null and writes nothing', async () => {
    const { service, fa } = setup(true);
    fa.pickSave.mockResolvedValue(null);
    expect(await service.saveAs(VALID_DERIVED_MAP_SCALE, 'a.json')).toBeNull();
    expect(fa.pickSave).toHaveBeenCalledWith('a.json');
    expect(fa.write).not.toHaveBeenCalled();
  });

  it('TC-125 without API support save/saveAs fall back to download', async () => {
    const { service, fa } = setup(false);
    const download = vi.spyOn(TestBed.inject(JsonFileService), 'download').mockImplementation(() => undefined);
    expect(service.canWriteFiles).toBe(false);
    const target = await service.save(VALID_DERIVED_MAP_SCALE, null, null);
    expect(download).toHaveBeenCalledWith(service.serialize(VALID_DERIVED_MAP_SCALE), 'derived2.comp-level.json');
    expect(target).toEqual({ fileName: 'derived2.comp-level.json', handle: null });
    expect(fa.pickSave).not.toHaveBeenCalled();
  });
});
