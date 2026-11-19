import { TestBed } from '@angular/core/testing';
import { VALID_DERIVED_MAP_SCALE } from '../../../testing/fixtures';
import { DerivedScaleFileService } from './derived-scale-file.service';

describe('DerivedScaleFileService', () => {
  let service: DerivedScaleFileService;

  beforeEach(() => {
    service = TestBed.inject(DerivedScaleFileService);
  });

  describe('parse (REQ-001)', () => {
    it('TC-020 loads a valid scale file', () => {
      const r = service.parse(JSON.stringify(VALID_DERIVED_MAP_SCALE));
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.scale).toEqual(VALID_DERIVED_MAP_SCALE);
        expect(r.validation.valid).toBe(true);
      }
    });

    it('TC-021 rejects invalid JSON with an error message', () => {
      const r = service.parse('{ not json');
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toContain('kein gültiges JSON');
    });

    it('TC-022 rejects JSON that is not an object', () => {
      expect(service.parse('[]').ok).toBe(false);
      expect(service.parse('42').ok).toBe(false);
    });

    it('TC-023 loads schema-invalid objects but reports issues (DEC-005)', () => {
      const r = service.parse('{"id":"x"}');
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.validation.valid).toBe(false);
    });

    it('TC-024 accepts the README variant mappingElse (DEC-004)', () => {
      const { mappingsElse, ...rest } = VALID_DERIVED_MAP_SCALE;
      const r = service.parse(JSON.stringify({ ...rest, mappingElse: mappingsElse }));
      expect(r.ok && r.validation.valid).toBe(true);
    });
  });

  describe('serialize / fileNameFor (REQ-004)', () => {
    it('TC-040 serializes and re-parses to the same scale (round trip)', () => {
      const r = service.parse(service.serialize(VALID_DERIVED_MAP_SCALE));
      expect(r.ok && r.scale).toEqual(VALID_DERIVED_MAP_SCALE);
    });

    it('TC-041 derives the file name from the id unless a name is known', () => {
      expect(service.fileNameFor(VALID_DERIVED_MAP_SCALE)).toBe('derived2.comp-level.json');
      expect(service.fileNameFor(VALID_DERIVED_MAP_SCALE, 'mine.json')).toBe('mine.json');
      expect(service.fileNameFor({ ...VALID_DERIVED_MAP_SCALE, id: '' })).toBe('scale.json');
      expect(service.fileNameFor({ ...VALID_DERIVED_MAP_SCALE, id: 'a b/c' })).toBe('a_b_c.json');
    });
  });
});
