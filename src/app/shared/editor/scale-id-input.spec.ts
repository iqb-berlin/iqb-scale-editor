import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ScaleIdSuggestionsService } from '../services/scale-id-suggestions.service';
import { ScaleIdInput } from './scale-id-input';

@Component({
  imports: [ScaleIdInput],
  template: `<app-scale-id-input testId="x" [value]="value()" [exclude]="['own']" (valueChange)="value.set($event)" />`,
})
class Host {
  readonly value = signal('');
}

describe('ScaleIdInput (REQ-016)', () => {
  async function render() {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    TestBed.inject(ScaleIdSuggestionsService).setSource(() => [
      { id: 'ma.global', type: 'base', context: 'Teil 1' },
      { id: 'ma.level', type: 'derived', context: 'Teil 1' },
      { id: 'own', type: 'base' },
    ]);
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const input = (fixture.nativeElement as HTMLElement).querySelector('[data-testid="x"]') as HTMLInputElement;
    return { fixture, input };
  }

  const optionTexts = () => Array.from(document.querySelectorAll('mat-option')).map((o) => o.textContent?.trim());

  it('TC-265 focusing shows all known ids with type and context (excluding given ids)', async () => {
    const { fixture, input } = await render();
    input.dispatchEvent(new Event('focusin'));
    await fixture.whenStable();
    expect(optionTexts()).toEqual([
      expect.stringMatching(/ma\.global\s*Basis-Skala · Teil 1/),
      expect.stringMatching(/ma\.level\s*Abgeleitete Skala · Teil 1/),
    ]);
  });

  it('TC-266 typing filters; selecting an option sets the value', async () => {
    const { fixture, input } = await render();
    input.dispatchEvent(new Event('focusin'));
    input.value = 'lev';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(optionTexts()).toEqual([expect.stringContaining('ma.level')]);
    (document.querySelector('mat-option') as HTMLElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('ma.level');
  });

  it('TC-267 a new id that does not exist can be entered freely', async () => {
    const { fixture, input } = await render();
    input.value = 'brand.new.id';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('brand.new.id');
  });
});
