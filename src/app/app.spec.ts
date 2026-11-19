import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { VALID_DERIVED_MAP_SCALE } from '../testing/fixtures';
import { VALID_BASE_WLE_SCALE } from '../testing/fixtures-base';
import { makeIndex } from '../testing/fixtures-index';
import { fakeHandle, FileAccessMock, mockFileAccess, provideFileAccessMock } from '../testing/file-access.mock';
import { ScaleDocumentService } from './document/scale-document.service';
import { DerivedScaleStore } from './derived/services/derived-scale-store';
import { ConfirmService } from './shared/services/confirm.service';

describe('App', () => {
  let fa: FileAccessMock;
  let confirmSpy: ReturnType<typeof vi.fn>;

  async function setup(supported = true) {
    fa = mockFileAccess(supported);
    confirmSpy = vi.fn().mockReturnValue(true);
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideFileAccessMock(fa), { provide: ConfirmService, useValue: { confirm: confirmSpy } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    return { fixture, el, app: fixture.componentInstance, doc: TestBed.inject(ScaleDocumentService) };
  }

  const buttonTexts = (el: HTMLElement) => Array.from(el.querySelectorAll('button')).map((b) => b.textContent ?? '');

  it('TC-060 shows the empty state when no scale is open', async () => {
    const { el } = await setup();
    expect(el.querySelector('[data-testid="empty-state"]')).toBeTruthy();
    expect(el.querySelector('app-derived-scale-editor, app-base-scale-editor')).toBeNull();
  });

  it('TC-061 "Neu" menu offers both types and opens the matching editor', async () => {
    const { fixture, el } = await setup();
    (el.querySelector('[data-testid="new-menu"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    (document.querySelector('[data-testid="new-base"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(el.querySelector('app-base-scale-editor')).toBeTruthy();
    expect(el.querySelector('[data-testid="file-name"]')?.textContent).toContain('Basis-Skala: neu');

    (el.querySelector('[data-testid="new-menu"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    (document.querySelector('[data-testid="new-derived"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(el.querySelector('app-derived-scale-editor')).toBeTruthy();
    expect(el.querySelector('app-base-scale-editor')).toBeNull();
  });

  it('TC-062 marks unsaved changes with * in the toolbar', async () => {
    const { fixture, el, doc } = await setup();
    doc.openText(JSON.stringify(VALID_DERIVED_MAP_SCALE), 'a.json', null);
    TestBed.inject(DerivedScaleStore).update((s) => ({ ...s, id: 'changed' }));
    await fixture.whenStable();
    expect(el.querySelector('[data-testid="file-name"]')?.textContent).toContain('Abgeleitete Skala: a.json *');
  });

  it('TC-063 asks before discarding unsaved changes; cancel keeps the scale', async () => {
    const { app, doc } = await setup();
    doc.newScale('derived');
    TestBed.inject(DerivedScaleStore).update((s) => ({ ...s, id: 'x' }));
    confirmSpy.mockReturnValue(false);
    app.newScale('base');
    expect(confirmSpy).toHaveBeenCalledOnce();
    expect(doc.type()).toBe('derived');
  });

  it('TC-127 "Speichern unter…" only shown with API support', async () => {
    const { el } = await setup(true);
    expect(buttonTexts(el).some((t) => t.includes('Speichern unter'))).toBe(true);
    TestBed.resetTestingModule();
    const other = await setup(false);
    expect(buttonTexts(other.el).some((t) => t.includes('Speichern unter'))).toBe(false);
  });

  it('TC-128 opening a base scale via picker shows the base editor', async () => {
    const { fixture, el, app } = await setup(true);
    fa.pickOpen.mockResolvedValue(fakeHandle('b.json', JSON.stringify(VALID_BASE_WLE_SCALE)));
    await app.open(document.createElement('input'));
    await fixture.whenStable();
    expect(el.querySelector('app-base-scale-editor')).toBeTruthy();
    expect(el.querySelector('[data-testid="file-name"]')?.textContent).toContain('Basis-Skala: b.json');
  });

  it('TC-130 without API support "Öffnen" uses the file input', async () => {
    const { app } = await setup(false);
    const input = document.createElement('input');
    const click = vi.spyOn(input, 'click').mockImplementation(() => undefined);
    await app.open(input);
    expect(click).toHaveBeenCalledOnce();
    expect(fa.pickOpen).not.toHaveBeenCalled();
  });
});

describe('App with acp index (REQ-013)', () => {
  it('TC-235 opening an index shows sidebar and hint; selecting a scale shows its editor', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideFileAccessMock(mockFileAccess(true))],
    }).compileComponents();
    const fixture = TestBed.createComponent(App);
    const doc = TestBed.inject(ScaleDocumentService);
    doc.openText(JSON.stringify(makeIndex()), 'idx.json', null);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-index-sidebar')).toBeTruthy();
    expect(el.querySelector('[data-testid="index-hint"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="file-name"]')?.textContent).toContain('Index: idx.json');
    doc.workspace.select({ part: 0, type: 'base', index: 0 });
    await fixture.whenStable();
    expect(el.querySelector('app-base-scale-editor')).toBeTruthy();
  });
});
