import { TestBed } from '@angular/core/testing';
import { VALID_DERIVED_MAP_SCALE } from '../../../testing/fixtures';
import { DerivedScaleStore } from '../services/derived-scale-store';
import { DerivedScaleEditor } from './derived-scale-editor';
import { ConfirmService } from '../../shared/services/confirm.service';
import { ScaleIdSuggestionsService } from '../../shared/services/scale-id-suggestions.service';

describe('DerivedScaleEditor (REQ-003)', () => {
  let store: DerivedScaleStore;

  async function render() {
    const fixture = TestBed.createComponent(DerivedScaleEditor);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DerivedScaleEditor] }).compileComponents();
    store = TestBed.inject(DerivedScaleStore);
    store.load(VALID_DERIVED_MAP_SCALE, 'a.json');
  });

  it('TC-070 shows the scale id and reports validity', async () => {
    const { el } = await render();
    expect((el.querySelector('[data-testid="scale-id"]') as HTMLInputElement).value).toBe('derived2.comp-level');
    expect(el.querySelector('[data-testid="validation-ok"]')).toBeTruthy();
  });

  it('TC-071 typing into the id field updates the store', async () => {
    const { el } = await render();
    const input = el.querySelector('[data-testid="scale-id"]') as HTMLInputElement;
    input.value = 'new.id';
    input.dispatchEvent(new Event('input'));
    expect(store.scale()?.id).toBe('new.id');
    expect(store.dirty()).toBe(true);
  });

  it('TC-072 shows validation issues for an invalid scale', async () => {
    store.update((s) => ({ ...s, sources: [] }));
    const { el } = await render();
    expect(el.querySelector('[data-testid="validation-issues"]')?.textContent).toContain('/sources');
  });

  it('TC-073 adds, moves and removes mappings', async () => {
    const { fixture } = await render();
    const editor = fixture.componentInstance;
    editor.addMapping();
    expect(store.scale()?.mappings).toHaveLength(2);
    editor.moveMapping(1, -1);
    expect(store.scale()?.mappings?.[0].method).toBe('EQUALS');
    editor.removeMapping(0);
    expect(store.scale()?.mappings).toHaveLength(1);
    expect(store.scale()?.mappings?.[0].method).toBe('MIN');
  });

  it('TC-074 removing optional fields deletes the property', async () => {
    const { fixture } = await render();
    fixture.componentInstance.setMappingsElse(undefined);
    expect('mappingsElse' in store.scale()!).toBe(false);
    fixture.componentInstance.patch({ publicVocabularyUrl: undefined });
    expect('publicVocabularyUrl' in store.scale()!).toBe(false);
  });
});

describe('DerivedScaleEditor warnings (REQ-006)', () => {
  it('TC-097 shows parameter warnings inline and in the check section without invalidating', async () => {
    await TestBed.configureTestingModule({ imports: [DerivedScaleEditor] }).compileComponents();
    const store = TestBed.inject(DerivedScaleStore);
    store.load(VALID_DERIVED_MAP_SCALE, null);
    store.update((s) => ({ ...s, mappings: [{ ...s.mappings![0], parameters: ['abc'] }] }));
    const fixture = TestBed.createComponent(DerivedScaleEditor);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="mapping-warning"]')?.textContent).toContain('keine Zahl');
    expect(el.querySelector('[data-testid="validation-warnings"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="validation-ok"]')).toBeTruthy();
  });
});

describe('DerivedScaleEditor method change (REQ-008)', () => {
  let store: DerivedScaleStore;
  let confirmSpy: ReturnType<typeof vi.fn>;

  async function render() {
    const fixture = TestBed.createComponent(DerivedScaleEditor);
    await fixture.whenStable();
    return fixture;
  }

  /** Simulates a selection in the method select. */
  function selectMethod(editor: DerivedScaleEditor, value: string) {
    const source = { value };
    editor.changeMethod({ value, source } as never);
    return source;
  }

  beforeEach(async () => {
    confirmSpy = vi.fn();
    await TestBed.configureTestingModule({
      imports: [DerivedScaleEditor],
      providers: [{ provide: ConfirmService, useValue: { confirm: confirmSpy } }],
    }).compileComponents();
    store = TestBed.inject(DerivedScaleStore);
  });

  it('TC-110 shows mapping sections for MAP', async () => {
    store.load(VALID_DERIVED_MAP_SCALE, null);
    const el = (await render()).nativeElement as HTMLElement;
    expect(el.textContent).toContain('Mappings');
    expect(el.textContent).toContain('Sonst-Wert');
  });

  it('TC-111 hides mapping sections for SUM/MEAN without mapping data', async () => {
    store.load({ id: 'x', name: [{ lang: 'de', value: 'X' }], sources: ['a'], method: 'SUM' }, null);
    const el = (await render()).nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('Mappings');
    expect(el.textContent).not.toContain('Sonst-Wert');
  });

  it('TC-112 leaving MAP with mappings asks and removes mappings + mappingsElse on confirm', async () => {
    store.load(VALID_DERIVED_MAP_SCALE, null);
    confirmSpy.mockReturnValue(true);
    selectMethod((await render()).componentInstance, 'MEAN');
    expect(confirmSpy).toHaveBeenCalledOnce();
    const s = store.scale()!;
    expect(s.method).toBe('MEAN');
    expect('mappings' in s).toBe(false);
    expect('mappingsElse' in s).toBe(false);
  });

  it('TC-113 cancel keeps everything and reverts the selection', async () => {
    store.load(VALID_DERIVED_MAP_SCALE, null);
    confirmSpy.mockReturnValue(false);
    const source = selectMethod((await render()).componentInstance, 'SUM');
    expect(store.scale()).toEqual(VALID_DERIVED_MAP_SCALE);
    expect(store.dirty()).toBe(false);
    expect(source.value).toBe('MAP');
  });

  it('TC-114 leaving MAP without mapping data does not ask and drops an empty mappings list', async () => {
    store.newScale();
    selectMethod((await render()).componentInstance, 'SUM');
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(store.scale()!.method).toBe('SUM');
    expect('mappings' in store.scale()!).toBe(false);
  });

  it('TC-115 switching back to MAP shows the (empty) mapping sections again', async () => {
    store.load({ id: 'x', name: [{ lang: 'de', value: 'X' }], sources: ['a'], method: 'SUM' }, null);
    const fixture = await render();
    selectMethod(fixture.componentInstance, 'MAP');
    await fixture.whenStable();
    expect(store.scale()!.method).toBe('MAP');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Mappings');
  });

  it('TC-116 loaded SUM scale with mappings keeps sections visible and warns', async () => {
    store.load({ ...VALID_DERIVED_MAP_SCALE, method: 'SUM' }, null);
    const el = (await render()).nativeElement as HTMLElement;
    expect(el.textContent).toContain('Mappings');
    expect(store.warnings().map((w) => w.path)).toEqual(['/mappings', '/mappingsElse']);
  });
});

describe('DerivedScaleEditor id autocomplete (REQ-016)', () => {
  it('TC-269 sources offer known ids but not the own id', async () => {
    await TestBed.configureTestingModule({ imports: [DerivedScaleEditor] }).compileComponents();
    TestBed.inject(ScaleIdSuggestionsService).setSource(() => [
      { id: 'derived2.comp-level', type: 'derived' },
      { id: 'base2.wle', type: 'base' },
      { id: 'other.base', type: 'base' },
    ]);
    TestBed.inject(DerivedScaleStore).load({ ...VALID_DERIVED_MAP_SCALE, sources: [''] }, null);
    const fixture = TestBed.createComponent(DerivedScaleEditor);
    await fixture.whenStable();
    const input = (fixture.nativeElement as HTMLElement).querySelector('[data-testid="scale-id-list-0"]') as HTMLInputElement;
    input.dispatchEvent(new Event('focusin'));
    await fixture.whenStable();
    const texts = Array.from(document.querySelectorAll('mat-option')).map((o) => o.textContent ?? '');
    expect(texts.some((t) => t.includes('other.base'))).toBe(true);
    expect(texts.some((t) => t.includes('derived2.comp-level'))).toBe(false);
  });
});
