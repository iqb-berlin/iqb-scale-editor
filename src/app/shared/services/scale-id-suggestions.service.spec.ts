import { TestBed } from '@angular/core/testing';
import { filterScaleIds, ScaleIdSuggestion, ScaleIdSuggestionsService } from './scale-id-suggestions.service';

const S = (id: string, type: 'base' | 'derived' = 'base'): ScaleIdSuggestion => ({ id, type });

describe('ScaleIdSuggestionsService (REQ-016)', () => {
  it('TC-260 without source there are no suggestions', () => {
    expect(TestBed.inject(ScaleIdSuggestionsService).all()).toEqual([]);
  });

  it('TC-261 suggestions are unique, non-empty and sorted', () => {
    const svc = TestBed.inject(ScaleIdSuggestionsService);
    svc.setSource(() => [S('b'), S(''), S('a', 'derived'), S('b', 'derived')]);
    expect(svc.all()).toEqual([S('a', 'derived'), S('b')]);
    svc.setSource(null);
    expect(svc.all()).toEqual([]);
  });
});

describe('filterScaleIds (REQ-016)', () => {
  const all = [S('ma.global'), S('ma.wle'), S('de.reading'), S('xma')];

  it('TC-262 empty text lists everything', () => {
    expect(filterScaleIds(all, '')).toEqual(all);
  });

  it('TC-263 case-insensitive substring match, prefix matches first', () => {
    expect(filterScaleIds(all, 'MA').map((s) => s.id)).toEqual(['ma.global', 'ma.wle', 'xma']);
  });

  it('TC-264 excludes given ids and the exact current text', () => {
    expect(filterScaleIds(all, 'ma.wle').map((s) => s.id)).toEqual([]);
    expect(filterScaleIds(all, '', ['xma', 'de.reading']).map((s) => s.id)).toEqual(['ma.global', 'ma.wle']);
  });
});
