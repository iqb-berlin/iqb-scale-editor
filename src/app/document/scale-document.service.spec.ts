import { TestBed } from '@angular/core/testing';
import { VALID_DERIVED_MAP_SCALE } from '../../testing/fixtures';
import { VALID_BASE_WLE_SCALE } from '../../testing/fixtures-base';
import { fakeHandle, FileAccessMock, mockFileAccess, provideFileAccessMock } from '../../testing/file-access.mock';
import { BaseScaleStore } from '../base/services/base-scale-store';
import { DerivedScaleStore } from '../derived/services/derived-scale-store';
import { ScaleDocumentService } from './scale-document.service';
import { makeIndex } from '../../testing/fixtures-index';

describe('ScaleDocumentService (REQ-010)', () => {
  let doc: ScaleDocumentService;
  let fa: FileAccessMock;

  beforeEach(() => {
    fa = mockFileAccess(true);
    TestBed.configureTestingModule({ providers: [provideFileAccessMock(fa)] });
    doc = TestBed.inject(ScaleDocumentService);
  });

  it('TC-140 starts without a document', () => {
    expect(doc.type()).toBeNull();
    expect(doc.hasScale()).toBe(false);
  });

  it('TC-141 newScale activates the type and closes the other one', () => {
    doc.newScale('derived');
    expect(doc.type()).toBe('derived');
    doc.newScale('base');
    expect(doc.type()).toBe('base');
    expect(doc.typeLabel()).toBe('Basis-Skala');
    expect(TestBed.inject(DerivedScaleStore).scale()).toBeNull();
    expect(TestBed.inject(BaseScaleStore).scale()?.method).toBe('SCORE_SUM');
  });

  it('TC-142 openText detects a base scale', () => {
    const r = doc.openText(JSON.stringify(VALID_BASE_WLE_SCALE), 'b.json', null);
    expect(r).toEqual({ status: 'opened', kind: 'base', issueCount: 0 });
    expect(TestBed.inject(BaseScaleStore).scale()).toEqual(VALID_BASE_WLE_SCALE);
    expect(doc.fileName()).toBe('b.json');
  });

  it('TC-143 openText detects a derived scale (incl. mappingElse variant)', () => {
    const { mappingsElse, ...rest } = VALID_DERIVED_MAP_SCALE;
    const r = doc.openText(JSON.stringify({ ...rest, mappingElse: mappingsElse }), 'd.json', null);
    expect(r).toEqual({ status: 'opened', kind: 'derived', issueCount: 0 });
    expect(TestBed.inject(DerivedScaleStore).scale()).toEqual(VALID_DERIVED_MAP_SCALE);
  });

  it('TC-144 undetectable type, invalid JSON and non-objects are errors and keep the current document', () => {
    doc.newScale('base');
    for (const text of ['{"id":"x"}', '{"items":[],"sources":[]}', '{ nope', '[]']) {
      expect(doc.openText(text, 'x.json', null).status).toBe('error');
    }
    expect(doc.type()).toBe('base');
    expect(doc.hasScale()).toBe(true);
  });

  it('TC-145 schema-invalid but detectable files are opened with issue count (DEC-005)', () => {
    const r = doc.openText('{"items":[{"id":""}]}', 'x.json', null);
    expect(r.status).toBe('opened');
    expect(r.status === 'opened' && r.issueCount).toBeGreaterThan(0);
  });

  it('TC-146 openWithPicker opens and links the chosen file; cancel changes nothing', async () => {
    const h = fakeHandle('b.json', JSON.stringify(VALID_BASE_WLE_SCALE));
    fa.pickOpen.mockResolvedValueOnce(h).mockResolvedValueOnce(null);
    expect((await doc.openWithPicker()).status).toBe('opened');
    expect(TestBed.inject(BaseScaleStore).fileHandle()).toBe(h);
    expect(await doc.openWithPicker()).toEqual({ status: 'cancelled' });
    expect(doc.fileName()).toBe('b.json');
  });

  it('TC-147 save writes the active scale into its linked file and clears dirty', async () => {
    const h = fakeHandle('b.json', JSON.stringify(VALID_BASE_WLE_SCALE));
    fa.pickOpen.mockResolvedValue(h);
    await doc.openWithPicker();
    TestBed.inject(BaseScaleStore).update((s) => ({ ...s, id: 'changed' }));
    expect(doc.dirty()).toBe(true);
    await doc.save();
    expect(JSON.parse(h.written[0]).id).toBe('changed');
    expect(doc.dirty()).toBe(false);
  });

  it('TC-148 cancelled saveAs keeps dirty and link', async () => {
    doc.openText(JSON.stringify(VALID_BASE_WLE_SCALE), 'b.json', null);
    TestBed.inject(BaseScaleStore).update((s) => ({ ...s, id: 'changed' }));
    fa.pickSave.mockResolvedValue(null);
    expect(await doc.saveAs()).toBeNull();
    expect(doc.dirty()).toBe(true);
  });
});

describe('ScaleDocumentService with acp index (REQ-013)', () => {
  let doc: ScaleDocumentService;
  let fa: FileAccessMock;

  beforeEach(() => {
    fa = mockFileAccess(true);
    TestBed.configureTestingModule({ providers: [provideFileAccessMock(fa)] });
    doc = TestBed.inject(ScaleDocumentService);
  });

  it('TC-222 opens an index file as workspace (detected by packageId/assessmentParts)', () => {
    const r = doc.openText(JSON.stringify(makeIndex()), 'idx.json', null);
    expect(r).toEqual({ status: 'opened', kind: 'index', issueCount: 0 });
    expect(doc.isIndex()).toBe(true);
    expect(doc.hasScale()).toBe(false);
    expect(doc.hasDocument()).toBe(true);
    expect(doc.fileName()).toBe('idx.json');
  });

  it('TC-223 type/hasScale follow the selected scale', () => {
    doc.openText(JSON.stringify(makeIndex()), 'idx.json', null);
    doc.workspace.select({ part: 0, type: 'derived', index: 0 });
    expect(doc.type()).toBe('derived');
    expect(doc.hasScale()).toBe(true);
  });

  it('TC-224 save writes the whole index into the linked file', async () => {
    const h = fakeHandle('idx.json', JSON.stringify(makeIndex()));
    fa.pickOpen.mockResolvedValue(h);
    await doc.openWithPicker();
    doc.workspace.select({ part: 0, type: 'base', index: 0 });
    TestBed.inject(BaseScaleStore).update((s) => ({ ...s, id: 'renamed' }));
    expect(doc.dirty()).toBe(true);
    await doc.save();
    const saved = JSON.parse(h.written[0]);
    expect(saved.assessmentParts[0].baseScales[0].id).toBe('renamed');
    expect(saved.assessmentParts[0].units).toEqual(makeIndex().assessmentParts![0]['units']);
    expect(doc.dirty()).toBe(false);
  });

  it('TC-225 saveAs proposes <packageId>.json for a new target', async () => {
    doc.openText(JSON.stringify(makeIndex()), 'idx.json', null);
    fa.pickSave.mockResolvedValue(null);
    await doc.saveAs();
    expect(fa.pickSave).toHaveBeenCalledWith('idx.json');
  });

  it('TC-226 "Neu" for a standalone scale closes the index', () => {
    doc.openText(JSON.stringify(makeIndex()), 'idx.json', null);
    doc.newScale('base');
    expect(doc.isIndex()).toBe(false);
    expect(doc.type()).toBe('base');
  });

  it('TC-227 opening a standalone scale closes the index', () => {
    doc.openText(JSON.stringify(makeIndex()), 'idx.json', null);
    doc.openText(JSON.stringify(VALID_BASE_WLE_SCALE), 'b.json', null);
    expect(doc.isIndex()).toBe(false);
    expect(doc.fileName()).toBe('b.json');
  });
});
