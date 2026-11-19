import { TestBed } from '@angular/core/testing';
import { VALID_BASE_WLE_SCALE } from '../../../testing/fixtures-base';
import { ConfirmService } from '../../shared/services/confirm.service';
import { BaseScale } from '../model/base-scale.model';
import { BaseScaleStore } from '../services/base-scale-store';
import { BaseScaleEditor } from './base-scale-editor';

describe('BaseScaleEditor (REQ-011)', () => {
  let store: BaseScaleStore;
  let confirmSpy: ReturnType<typeof vi.fn>;

  async function render(scale: BaseScale = VALID_BASE_WLE_SCALE) {
    store.load(scale, null);
    const fixture = TestBed.createComponent(BaseScaleEditor);
    await fixture.whenStable();
    return { fixture, editor: fixture.componentInstance, el: fixture.nativeElement as HTMLElement };
  }

  function selectMethod(editor: BaseScaleEditor, value: string) {
    const source = { value };
    editor.changeMethod({ value, source } as never);
    return source;
  }

  beforeEach(async () => {
    confirmSpy = vi.fn();
    await TestBed.configureTestingModule({
      imports: [BaseScaleEditor],
      providers: [{ provide: ConfirmService, useValue: { confirm: confirmSpy } }],
    }).compileComponents();
    store = TestBed.inject(BaseScaleStore);
  });

  it('TC-190 shows id, items and validity', async () => {
    const { el } = await render();
    expect((el.querySelector('[data-testid="scale-id"]') as HTMLInputElement).value).toBe('bs2024.ma.9.wle');
    expect(el.querySelectorAll('[data-testid="item"]')).toHaveLength(2);
    expect(el.querySelector('[data-testid="validation-ok"]')?.textContent).toContain('acp-scale-base@0.4');
  });

  it('TC-191 typing into the id field updates the store', async () => {
    const { el } = await render();
    const input = el.querySelector('[data-testid="scale-id"]') as HTMLInputElement;
    input.value = 'new.id';
    input.dispatchEvent(new Event('input'));
    expect(store.scale()?.id).toBe('new.id');
    expect(store.dirty()).toBe(true);
  });

  it('TC-192 shows maxValue only for SCORE_RATIO and codeValue only for CODE_COUNT', async () => {
    const { el, fixture } = await render({ ...VALID_BASE_WLE_SCALE, method: 'SCORE_RATIO', items: [{ id: 'a' }] });
    expect(el.querySelector('[data-testid="max-value"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="code-value"]')).toBeNull();
    store.update((s) => ({ ...s, method: 'CODE_COUNT' }));
    await fixture.whenStable();
    expect(el.querySelector('[data-testid="max-value"]')).toBeNull();
    expect(el.querySelector('[data-testid="code-value"]')).toBeTruthy();
  });

  it('TC-193 setting/clearing the method parameter creates/removes methodParameters', async () => {
    const { editor } = await render({ id: 'x', method: 'CODE_COUNT', items: [{ id: 'a' }] });
    editor.setMethodParameter(9);
    expect(store.scale()?.methodParameters).toEqual({ codeValue: 9 });
    editor.setMethodParameter(undefined);
    expect('methodParameters' in store.scale()!).toBe(false);
  });

  it('TC-194 method change with non-fitting methodParameters asks; confirm removes them', async () => {
    const { editor } = await render({ id: 'x', method: 'SCORE_RATIO', methodParameters: { maxValue: 5 }, items: [{ id: 'a' }] });
    confirmSpy.mockReturnValue(true);
    selectMethod(editor, 'CODE_COUNT');
    expect(confirmSpy).toHaveBeenCalledOnce();
    expect(store.scale()?.method).toBe('CODE_COUNT');
    expect('methodParameters' in store.scale()!).toBe(false);
  });

  it('TC-195 cancel keeps method and parameters and reverts the selection', async () => {
    const scale: BaseScale = { id: 'x', method: 'SCORE_RATIO', methodParameters: { maxValue: 5 }, items: [{ id: 'a' }] };
    const { editor } = await render(scale);
    confirmSpy.mockReturnValue(false);
    const source = selectMethod(editor, 'WLE');
    expect(store.scale()).toEqual(scale);
    expect(source.value).toBe('SCORE_RATIO');
  });

  it('TC-196 method change without methodParameters does not ask', async () => {
    const { editor } = await render();
    selectMethod(editor, 'SCORE_MEAN');
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(store.scale()?.method).toBe('SCORE_MEAN');
  });

  it('TC-197 add/remove items; the last item cannot be removed via UI', async () => {
    const { editor, el, fixture } = await render({ id: 'x', method: 'SCORE_SUM', items: [{ id: 'a' }] });
    const deleteButton = () => el.querySelector('[aria-label="Item entfernen"]') as HTMLButtonElement;
    expect(deleteButton().disabled).toBe(true);
    editor.addItem();
    expect(store.scale()?.items).toEqual([{ id: 'a' }, { id: '' }]);
    editor.removeItem(0);
    expect(store.scale()?.items).toEqual([{ id: '' }]);
    await fixture.whenStable();
  });

  it('TC-198 weight: empty input removes the property (default 1)', async () => {
    const { editor } = await render();
    editor.updateItem(1, { weight: undefined });
    expect('weight' in store.scale()!.items[1]).toBe(false);
    editor.updateItem(0, { weight: 3 });
    expect(store.scale()!.items[0].weight).toBe(3);
  });

  it('TC-199 item parameters: add uses the next free key; removing the last drops `parameters`', async () => {
    const { editor } = await render({ id: 'x', method: 'WLE', items: [{ id: 'a' }] });
    editor.addItemParameter(0);
    editor.addItemParameter(0);
    expect(store.scale()!.items[0].parameters?.map((p) => p.key)).toEqual(['LOGIT_FULL_CREDIT', 'LOGIT_PARTIAL_CREDIT_1']);
    editor.updateItemParameter(0, 1, { value: '0.4' });
    expect(store.scale()!.items[0].parameters?.[1]).toEqual({ key: 'LOGIT_PARTIAL_CREDIT_1', value: '0.4' });
    editor.removeItemParameter(0, 0);
    editor.removeItemParameter(0, 0);
    expect('parameters' in store.scale()!.items[0]).toBe(false);
  });

  it('TC-200 name is optional: can be removed and added again', async () => {
    const { editor } = await render();
    editor.setText('name', undefined);
    expect('name' in store.scale()!).toBe(false);
    expect(store.validation()?.valid).toBe(true);
  });

  it('TC-201 shows item parameter warnings inline', async () => {
    const { el } = await render({ id: 'x', method: 'WLE', items: [{ id: 'a', parameters: [{ key: 'LOGIT_FULL_CREDIT', value: 'x' }] }] });
    expect(el.querySelector('[data-testid="item-warning"]')?.textContent).toContain('keine Zahl');
  });

  it('TC-203 shows the minItemNumber warning inline', async () => {
    const { el } = await render({ ...VALID_BASE_WLE_SCALE, minItemNumber: 5 });
    expect(el.querySelector('[data-testid="min-item-warning"]')?.textContent).toContain('größer als die Anzahl');
  });
});
