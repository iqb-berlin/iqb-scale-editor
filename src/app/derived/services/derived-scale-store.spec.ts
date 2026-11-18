import { TestBed } from '@angular/core/testing';
import { VALID_DERIVED_MAP_SCALE } from '../../../testing/fixtures';
import { DerivedScaleStore } from './derived-scale-store';

describe('DerivedScaleStore (REQ-003)', () => {
  let store: DerivedScaleStore;

  beforeEach(() => {
    store = TestBed.inject(DerivedScaleStore);
  });

  it('TC-050 starts without a scale', () => {
    expect(store.scale()).toBeNull();
    expect(store.validation()).toBeNull();
  });

  it('TC-051 newScale opens an empty, clean scale', () => {
    store.newScale();
    expect(store.scale()?.id).toBe('');
    expect(store.dirty()).toBe(false);
    expect(store.fileName()).toBeNull();
  });

  it('TC-052 update changes the scale immutably and marks it dirty', () => {
    store.load(VALID_DERIVED_MAP_SCALE, 'a.json');
    const before = store.scale();
    store.update((s) => ({ ...s, id: 'new.id' }));
    expect(store.scale()?.id).toBe('new.id');
    expect(before?.id).toBe('derived2.comp-level');
    expect(store.dirty()).toBe(true);
  });

  it('TC-053 validation follows the current scale', () => {
    store.load(VALID_DERIVED_MAP_SCALE, null);
    expect(store.validation()?.valid).toBe(true);
    store.update((s) => ({ ...s, sources: [] }));
    expect(store.validation()?.valid).toBe(false);
  });

  it('TC-054 markSaved clears the dirty flag and remembers the file name', () => {
    store.load(VALID_DERIVED_MAP_SCALE, null);
    store.update((s) => ({ ...s, id: 'x' }));
    store.markSaved('x.json');
    expect(store.dirty()).toBe(false);
    expect(store.fileName()).toBe('x.json');
  });
});

describe('DerivedScaleStore file handle (REQ-009)', () => {
  it('TC-126 keeps the file handle from load/markSaved and resets it on newScale', () => {
    const store = TestBed.inject(DerivedScaleStore);
    const h = { name: 'a.json' } as FileSystemFileHandle;
    store.load(VALID_DERIVED_MAP_SCALE, 'a.json', h);
    expect(store.fileHandle()).toBe(h);
    store.newScale();
    expect(store.fileHandle()).toBeNull();
    store.markSaved('b.json', h);
    expect(store.fileHandle()).toBe(h);
  });
});
