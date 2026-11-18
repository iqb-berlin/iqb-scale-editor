import { TestBed } from '@angular/core/testing';
import { makeIndex } from '../../../testing/fixtures-index';
import { VALID_DERIVED_MAP_SCALE } from '../../../testing/fixtures';
import { BaseScaleStore } from '../../base/services/base-scale-store';
import { DerivedScaleStore } from '../../derived/services/derived-scale-store';
import { IndexWorkspaceService } from './index-workspace.service';
import { ScaleIdSuggestionsService } from '../../shared/services/scale-id-suggestions.service';

describe('IndexWorkspaceService (REQ-013)', () => {
  let ws: IndexWorkspaceService;
  let base: BaseScaleStore;
  let derived: DerivedScaleStore;

  beforeEach(() => {
    ws = TestBed.inject(IndexWorkspaceService);
    base = TestBed.inject(BaseScaleStore);
    derived = TestBed.inject(DerivedScaleStore);
    ws.load(makeIndex(), 'index.json', null);
  });

  it('TC-210 lists parts with their base and derived scales and check results', () => {
    const parts = ws.parts();
    expect(parts.map((p) => p.label)).toEqual(['Teil 1', 'Part 2']);
    expect(parts[0].scales.base.map((e) => e.id)).toEqual(['bs2024.ma.9.wle']);
    expect(parts[0].scales.derived.map((e) => e.id)).toEqual(['derived2.comp-level']);
    expect(parts[0].scales.base[0].issueCount).toBe(0);
    expect(parts[1].scales.base).toEqual([]);
    expect(ws.dirty()).toBe(false);
  });

  it('TC-211 selecting a scale loads it into the matching store', () => {
    ws.select({ part: 0, type: 'derived', index: 0 });
    expect(derived.scale()).toEqual(VALID_DERIVED_MAP_SCALE);
    expect(base.scale()).toBeNull();
    ws.select({ part: 0, type: 'base', index: 0 });
    expect(derived.scale()).toBeNull();
    expect(base.scale()?.id).toBe('bs2024.ma.9.wle');
  });

  it('TC-212 edits in the editor are written back into the index and mark it dirty', () => {
    ws.select({ part: 0, type: 'base', index: 0 });
    base.update((s) => ({ ...s, id: 'renamed' }));
    expect(ws.index()!.assessmentParts![0].baseScales![0].id).toBe('renamed');
    expect(ws.parts()[0].scales.base[0].id).toBe('renamed');
    expect(ws.dirty()).toBe(true);
  });

  it('TC-213 everything except the edited scale stays untouched', () => {
    const before = makeIndex();
    ws.select({ part: 0, type: 'base', index: 0 });
    base.update((s) => ({ ...s, id: 'renamed' }));
    const after = JSON.parse(ws.serialize());
    after.assessmentParts[0].baseScales[0].id = before.assessmentParts![0].baseScales![0].id;
    expect(after).toEqual(before);
  });

  it('TC-214 addScale creates the list if missing, appends an empty scale and selects it', () => {
    ws.addScale(1, 'derived');
    expect(ws.index()!.assessmentParts![1].derivedScales).toHaveLength(1);
    expect(ws.selected()).toEqual({ part: 1, type: 'derived', index: 0 });
    expect(derived.scale()?.method).toBe('MAP');
    expect(ws.dirty()).toBe(true);
  });

  it('TC-215 removeScale removes the scale and drops an empty list (minItems 1)', () => {
    ws.removeScale({ part: 0, type: 'base', index: 0 });
    expect('baseScales' in ws.index()!.assessmentParts![0]).toBe(false);
    expect(ws.dirty()).toBe(true);
  });

  it('TC-216 removing the selected scale clears selection; removing an earlier one shifts it', () => {
    ws.addScale(0, 'base');
    expect(ws.selected()).toEqual({ part: 0, type: 'base', index: 1 });
    ws.removeScale({ part: 0, type: 'base', index: 0 });
    expect(ws.selected()).toEqual({ part: 0, type: 'base', index: 0 });
    base.update((s) => ({ ...s, id: 'new' }));
    expect(ws.index()!.assessmentParts![0].baseScales![0].id).toBe('new');
    ws.removeScale({ part: 0, type: 'base', index: 0 });
    expect(ws.selected()).toBeNull();
    expect(base.scale()).toBeNull();
  });

  it('TC-217 mappingElse in derived scales of the index is normalized (DEC-004)', () => {
    const index = makeIndex();
    const d = index.assessmentParts![0].derivedScales![0] as unknown as Record<string, unknown>;
    d['mappingElse'] = d['mappingsElse'];
    delete d['mappingsElse'];
    ws.load(index, null, null);
    expect(ws.index()!.assessmentParts![0].derivedScales![0].mappingsElse).toEqual(VALID_DERIVED_MAP_SCALE.mappingsElse);
  });

  it('TC-218 counts errors over all scales', () => {
    ws.addScale(1, 'base');
    expect(ws.issueCount()).toBe(3);
  });

  it('TC-219 suggested file name: current name, else <packageId>.json', () => {
    expect(ws.suggestedFileName()).toBe('index.json');
    ws.load(makeIndex(), null, null);
    expect(ws.suggestedFileName()).toBe('iqb.ma.9.json');
  });

  it('TC-220 edits in standalone mode (no index) are not written anywhere', () => {
    ws.close();
    base.newScale();
    base.update((s) => ({ ...s, id: 'x' }));
    expect(ws.index()).toBeNull();
  });

  it('TC-221 robust against parts without lists or non-array assessmentParts', () => {
    ws.load({ packageId: 'p', version: '1', name: [] }, null, null);
    expect(ws.parts()).toEqual([]);
    ws.load({ packageId: 'p', version: '1', name: [], assessmentParts: 'x' } as never, null, null);
    expect(ws.parts()).toEqual([]);
  });
});

describe('IndexWorkspaceService warnings and moving (REQ-014, REQ-015)', () => {
  let ws: IndexWorkspaceService;

  beforeEach(() => {
    ws = TestBed.inject(IndexWorkspaceService);
    ws.load(makeIndex(), 'index.json', null);
  });

  it('TC-248 index warnings count in the sidebar and appear in the selected editor', () => {
    // fixture: derived source "base2.wle" is not a scale of the index
    expect(ws.parts()[0].scales.derived[0].warningCount).toBe(1);
    ws.select({ part: 0, type: 'derived', index: 0 });
    const store = TestBed.inject(DerivedScaleStore);
    expect(store.warnings().map((w) => w.path)).toEqual(['/sources/0']);
    store.update((s) => ({ ...s, sources: ['bs2024.ma.9.wle'] }));
    expect(store.warnings()).toEqual([]);
  });

  it('TC-249 index warnings are removed from the store when leaving the index', () => {
    ws.select({ part: 0, type: 'derived', index: 0 });
    ws.close();
    const store = TestBed.inject(DerivedScaleStore);
    store.load(VALID_DERIVED_MAP_SCALE, null);
    expect(store.warnings()).toEqual([]);
  });

  it('TC-250 moveScale reorders within a list', () => {
    ws.addScale(0, 'base'); // index 1, selected
    TestBed.inject(BaseScaleStore).update((s) => ({ ...s, id: 'second' }));
    ws.moveScale({ part: 0, type: 'base', index: 1 }, 0, 0);
    expect(ws.parts()[0].scales.base.map((e) => e.id)).toEqual(['second', 'bs2024.ma.9.wle']);
    expect(ws.selected()).toEqual({ part: 0, type: 'base', index: 0 });
    expect(ws.dirty()).toBe(true);
  });

  it('TC-251 moveScale moves to another part: creates target list, drops empty source list', () => {
    ws.moveScale({ part: 0, type: 'derived', index: 0 }, 1, 0);
    expect('derivedScales' in ws.index()!.assessmentParts![0]).toBe(false);
    expect(ws.index()!.assessmentParts![1].derivedScales!.map((s) => s.id)).toEqual(['derived2.comp-level']);
  });

  it('TC-252 selection follows the moved scale and edits go to the new position', () => {
    ws.select({ part: 0, type: 'base', index: 0 });
    ws.moveScale({ part: 0, type: 'base', index: 0 }, 1, 0);
    expect(ws.selected()).toEqual({ part: 1, type: 'base', index: 0 });
    TestBed.inject(BaseScaleStore).update((s) => ({ ...s, id: 'moved' }));
    expect(ws.index()!.assessmentParts![1].baseScales![0].id).toBe('moved');
  });

  it('TC-253 moveScale with invalid positions does nothing', () => {
    ws.moveScale({ part: 0, type: 'base', index: 5 }, 1, 0);
    ws.moveScale({ part: 0, type: 'base', index: 0 }, 9, 0);
    ws.moveScale({ part: 0, type: 'base', index: 0 }, 0, 0);
    expect(ws.dirty()).toBe(false);
  });
});

describe('IndexWorkspaceService id suggestions (REQ-016)', () => {
  it('TC-268 an open index provides all its scale ids as suggestions, updated on edit', () => {
    const ws = TestBed.inject(IndexWorkspaceService);
    const suggestions = TestBed.inject(ScaleIdSuggestionsService);
    ws.load(makeIndex(), null, null);
    expect(suggestions.all()).toEqual([
      { id: 'bs2024.ma.9.wle', type: 'base', context: 'Teil 1' },
      { id: 'derived2.comp-level', type: 'derived', context: 'Teil 1' },
    ]);
    ws.select({ part: 0, type: 'base', index: 0 });
    TestBed.inject(BaseScaleStore).update((s) => ({ ...s, id: 'a.renamed' }));
    expect(suggestions.all()[0].id).toBe('a.renamed');
    ws.close();
    expect(suggestions.all()).toEqual([]);
  });
});
