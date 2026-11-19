# iqb-scale-editor

Angular-Editor (Angular 22, Material, Vitest) für Skalen nach `acp-scale-base@0.4` (Basis-Skalen) und `acp-scale-derived@0.4` (abgeleitete Skalen).

## Konventionen
- UI-Texte Deutsch; Code, Kommentare, Testnamen Englisch.
- Standalone-Komponenten, Signals, `input()`/`output()`, Control Flow (`@if`/`@for`).
- Struktur (DEC-012): `src/app/shared/` = gemeinsamer Code für alle Skalentypen (Typen, Schema-Validator, Basisklassen `ScaleFileServiceBase<T>`/`ScaleStoreBase<T>`, Editor-Bausteine); `src/app/derived/` = abgeleitete Skalen (Präfix `Derived…`/`derived-…`); `src/app/base/` = Basis-Skalen (Präfix `Base…`/`base-…`); `src/app/index/` = acp-Index als Arbeitsbereich (`IndexWorkspaceService`, Seitenleiste); `src/app/document/` = `ScaleDocumentService` (Skalen-Datei oder Index; Neu/Öffnen/Speichern). Typ-spezifische Namen nie generisch benennen (`DerivedScaleFileService`, nicht `ScaleFileService`).
- Zustand der geöffneten Skala nur über den Store des Typs (`BaseScaleStore`/`DerivedScaleStore`) mit immutablen Updates; App-Ebene nur über `ScaleDocumentService`.
- Test-Fixtures/Mocks in `src/testing/` (nicht Teil des App-Builds).
- Validierung ausschließlich über das JSON-Schema (`createSchemaValidator`).
- Einzel-HTML: `npm run build:single` (→ `scripts/inline-html.mjs`); bei Lazy-Loading/Chunks müsste das Skript erweitert werden.
- Tests: `npx ng test --watch=false`; Testnamen beginnen mit ihrer Testfall-ID (`TC-xxx`).

## Feature-Tracking (Pflicht)
Features werden schrittweise mit dem User besprochen. Bei jeder Änderung/Entscheidung aktualisieren:
- `docs/requirements.md` – Anforderungen `REQ-xxx` mit Status und Testfällen
- `docs/test-cases.md` – Testfälle `TC-xxx` (auto/manuell) mit REQ-Bezug und Datei
- `docs/decisions.md` – Entscheidungen `DEC-xxx` (mit Datum, Status) und offene Fragen `Q-xxx`
