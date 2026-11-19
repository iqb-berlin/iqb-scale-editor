import { TestBed } from '@angular/core/testing';
import { makeIndex } from '../../../testing/fixtures-index';
import { ConfirmService } from '../../shared/services/confirm.service';
import { IndexWorkspaceService } from '../services/index-workspace.service';
import { IndexSidebar } from './index-sidebar';

describe('IndexSidebar (REQ-013)', () => {
  let ws: IndexWorkspaceService;
  let confirmSpy: ReturnType<typeof vi.fn>;

  async function render() {
    const fixture = TestBed.createComponent(IndexSidebar);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  beforeEach(async () => {
    confirmSpy = vi.fn();
    await TestBed.configureTestingModule({
      imports: [IndexSidebar],
      providers: [{ provide: ConfirmService, useValue: { confirm: confirmSpy } }],
    }).compileComponents();
    ws = TestBed.inject(IndexWorkspaceService);
    ws.load(makeIndex(), 'idx.json', null);
  });

  it('TC-230 shows package, parts and scales', async () => {
    const { el } = await render();
    expect(el.querySelector('[data-testid="index-package"]')?.textContent).toContain('iqb.ma.9');
    expect(el.querySelectorAll('[data-testid="index-part"]')).toHaveLength(2);
    expect(Array.from(el.querySelectorAll('[data-testid="index-scale"]')).map((e) => e.textContent))
      .toEqual([expect.stringContaining('bs2024.ma.9.wle'), expect.stringContaining('derived2.comp-level')]);
  });

  it('TC-231 click selects a scale and highlights it', async () => {
    const { el, fixture } = await render();
    (el.querySelectorAll('[data-testid="index-scale"]')[1] as HTMLElement).click();
    await fixture.whenStable();
    expect(ws.selected()).toEqual({ part: 0, type: 'derived', index: 0 });
    expect(el.querySelectorAll('[data-testid="index-scale"]')[1].classList).toContain('selected');
  });

  it('TC-232 "+" adds a scale to the part', async () => {
    const { el } = await render();
    (el.querySelector('[data-testid="add-base-1"]') as HTMLButtonElement).click();
    expect(ws.parts()[1].scales.base).toHaveLength(1);
  });

  it('TC-233 delete (via menu) asks first; cancel keeps the scale', async () => {
    const { el, fixture } = await render();
    const openMenuAndRemove = async () => {
      (el.querySelector('[aria-label="Aktionen"]') as HTMLButtonElement).click();
      await fixture.whenStable();
      (document.querySelector('[data-testid="remove-scale"]') as HTMLButtonElement).click();
      await fixture.whenStable();
    };
    confirmSpy.mockReturnValue(false);
    await openMenuAndRemove();
    expect(ws.parts()[0].scales.base).toHaveLength(1);
    confirmSpy.mockReturnValue(true);
    await openMenuAndRemove();
    expect(ws.parts()[0].scales.base).toHaveLength(0);
    expect(ws.selected()).toBeNull();
  });

  it('TC-234 index without assessment parts shows a hint', async () => {
    ws.load({ packageId: 'p', version: '1', name: [{ lang: 'de', value: 'x' }] }, null, null);
    const { el } = await render();
    expect(el.querySelector('[data-testid="index-no-parts"]')).toBeTruthy();
  });

  it('TC-246 menu "Nach „Part 2“ verschieben" moves the scale to the other part', async () => {
    const { el, fixture } = await render();
    (el.querySelector('[aria-label="Aktionen"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    (document.querySelector('[data-testid="move-to-part"]') as HTMLButtonElement).click();
    expect(ws.parts()[0].scales.base).toHaveLength(0);
    expect(ws.parts()[1].scales.base.map((e) => e.id)).toEqual(['bs2024.ma.9.wle']);
  });

  it('TC-247 drop handler moves only within the same type', async () => {
    const { fixture } = await render();
    const sidebar = fixture.componentInstance;
    const entry = ws.parts()[0].scales.base[0];
    sidebar.drop({ item: { data: entry }, container: { data: { part: 0, type: 'derived' } }, currentIndex: 0 } as never);
    expect(ws.parts()[0].scales.base).toHaveLength(1);
    sidebar.drop({ item: { data: entry }, container: { data: { part: 1, type: 'base' } }, currentIndex: 0 } as never);
    expect(ws.parts()[1].scales.base).toHaveLength(1);
    expect(sidebar.sameType({ data: entry } as never, { data: { part: 1, type: 'derived' } } as never)).toBe(false);
  });
});
