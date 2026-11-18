# Entscheidungen

Format: ID · Datum · Status (`beschlossen` / `vorläufig` / `offen` / `ersetzt`) · Entscheidung · Begründung.

| ID | Datum | Status | Entscheidung | Begründung |
|---|---|---|---|---|
| DEC-001 | 2026-11-18 | beschlossen | Angular (neueste Version, aktuell 22.x), Standalone-Komponenten, Signals; Angular Material als UI-Bibliothek | Vorgabe; Material liefert Formulare, Dialoge etc. |
| DEC-002 | 2026-11-18 | beschlossen | Vitest als Test-Runner (Angular-CLI-Builder `@angular/build:unit-test`, jsdom) | Vorgabe; Standard der aktuellen Angular-CLI |
| DEC-003 | 2026-11-18 | beschlossen | UI-Sprache Deutsch (Code, Kommentare und Testnamen Englisch) | Vorgabe |
| DEC-004 | 2026-11-18 | vorläufig | Gespeichert wird nach Schema (`mappingsElse`); beim Laden wird die README-Schreibweise `mappingElse` toleriert und umbenannt | Widerspruch README ↔ Schema in Spec 0.4; Schema ist maßgeblich |
| DEC-005 | 2026-11-18 | vorläufig | Jedes JSON-Objekt wird geladen; Schemaverletzungen werden angezeigt statt das Laden abzulehnen | Fehlerhafte Dateien sollen im Editor reparierbar sein |
| DEC-006 | 2026-11-18 | vorläufig | Editor arbeitet modellgetrieben: Signal-Store mit immutablen Updates, Validierung ausschließlich über das JSON-Schema (ajv) statt Angular-Form-Validatoren | Eine Quelle der Wahrheit für Gültigkeit; Schema-Updates wirken ohne Codeänderung |
| DEC-007 | 2026-11-18 | vorläufig | Vor „Neu“/„Öffnen“ mit ungespeicherten Änderungen Rückfrage per Browser-Dialog | Datenverlust vermeiden; später ggf. Material-Dialog |
| DEC-008 | 2026-11-18 | vorläufig | Default-Sprache `de`; neue Skala mit Methode `MAP` (Schema-Default) | IQB-Kontext |
| DEC-009 | 2026-11-18 | vorläufig | Auch ungültige Skalen können gespeichert werden (Art des Speicherns siehe DEC-017) | Zwischenstände sichern |
| DEC-010 | 2026-11-18 | beschlossen | Schema-Datei liegt als Kopie im Repo (`src/app/derived/model/acp-scale-derived.schema.json`) | Offline-fähig, reproduzierbare Tests; bei Spec-Updates manuell aktualisieren |
| DEC-011 | 2026-11-19 | beschlossen | Schema-Kennung im Modell getrennt: `DERIVED_SCALE_SCHEMA_ID = "acp-scale-derived"`, `DERIVED_SCALE_SCHEMA_VERSION = "0.4"` | Version separat auswertbar (z. B. Anzeige, Versionsprüfung, künftige Migrationen) |
| DEC-012 | 2026-11-18 | beschlossen | Vorbereitung auf einen Editor für Basis-Skalen ([acp-scale-base](https://iqb-specifications.github.io/acp-scale-base/)): Typ-spezifischer Code liegt unter `src/app/derived/` mit Präfix `Derived…`/`derived-…` (z. B. `DerivedScaleFileService`, `DerivedScaleStore`, `DerivedScaleEditor`, `validateDerivedScale`); gemeinsamer Code unter `src/app/shared/` (`LanguageTaggedText`, `createSchemaValidator`, `patchObject`, Basisklassen `ScaleFileServiceBase<T>` und `ScaleStoreBase<T>`, Editoren für mehrsprachige Texte und String-Listen) | Spätere Basis-Skalen (`src/app/base/`) erben dieselbe Lade-/Speicher-/Validierungslogik |
| DEC-013 | 2026-11-18 | beschlossen | Q-001: Mapping-Parameter werden je Bedingung geprüft, Ergebnis sind Warnungen (getrennt von Schemafehlern, blockieren nichts). Vergleichsbedingungen: genau eine JSON-Zahl; EQUALS: ≥ 1 nicht leerer Parameter. Warnungen-Mechanismus generisch in `ScaleStoreBase.checkWarnings()` | Schema erlaubt beliebige Strings; Warnungen helfen, ohne Zwischenstände zu blockieren |
| DEC-014 | 2026-11-18 | beschlossen | Q-002: Eigene Inhaltsprüfungen zusätzlich zum Schema als **Fehler**: leere `id`, leere Quellen, leere Texte, doppelte Sprachen. `validateDerivedScale` = Schema (`validateDerivedScaleSchema`) + Inhalt (`checkDerivedScaleContent`); wiederverwendbare Prüfungen in `src/app/shared/model/content-checks.ts` | Schema erlaubt leere Strings, solche Skalen sind aber fachlich unbrauchbar |
| DEC-015 | 2026-11-18 | beschlossen | Q-003: Mappings und Sonst-Wert nur bei Methode MAP anzeigen. Beim Wechsel zu SUM/MEAN mit vorhandenen Daten Rückfrage und Entfernen (Abbrechen = keine Änderung). Ausnahme: geladene Daten bei SUM/MEAN bleiben sichtbar und erzeugen Warnungen. Rückfragen laufen über `ConfirmService` (shared) | Keine Altlasten in gespeicherten Dateien, kein unbemerkter Datenverlust |
| DEC-016 | 2026-11-18 | beschlossen | Q-004: Quellen (`sources`) werden vorerst manuell als Freitext eingegeben, keine Auswahlliste/Vorschläge | Es gibt noch keine Quelle bekannter Skalen; Vorschläge erst, wenn eine solche existiert (z. B. mehrere geladene Dateien oder ein Skalen-Verzeichnis) |
| DEC-017 | 2026-11-18 | beschlossen | Q-005: Öffnen/Speichern über die File System Access API (`FileAccessService`, shared), Skala bleibt mit der Datei verknüpft; „Speichern“ schreibt in place, „Speichern unter…“ wählt neues Ziel. Fallback ohne API: Datei-Input und Download. Logik in `ScaleFileServiceBase` (`openWithPicker`, `save`, `saveAs`), Handle im `ScaleStoreBase` | Komfortables Arbeiten wie in einem Desktop-Editor; Firefox/Safari bleiben nutzbar |
| DEC-018 | 2026-11-18 | vorläufig | Zwei Skalentypen in einer App, immer genau eine geöffnete Skala. `ScaleDocumentService` (`src/app/document/`) leitet Neu/Öffnen/Speichern an Store und Datei-Service des aktiven Typs weiter. Typ beim Öffnen per Merkmal erkannt (`detectScaleType`); nicht erkennbar → Fehler statt Nachfrage | Ein Editor für beide Spezifikationen; Erkennung genügt, da sich die Pflichtfelder (`sources` vs. `items`) unterscheiden |
| DEC-019 | 2026-11-18 | beschlossen | Neue Basis-Skala: Methode `SCORE_SUM`, Name (de) vorbelegt, ein leeres Item | Schema hat keinen Methoden-Default; einfachste Methode |
| DEC-020 | 2026-11-18 | vorläufig | Inhaltsprüfung Basis-Skala analog DEC-014, zusätzlich doppelte Item-IDs und doppelte Parameter-Schlüssel je Item als Fehler | Item-IDs referenzieren eindeutig; doppelte Logits wären widersprüchlich |
| DEC-021 | 2026-11-18 | vorläufig | Warnungen Basis-Skala: CODE_COUNT ohne codeValue, unpassende methodParameters, Logit-Parameter ohne WLE, fehlender/nicht-numerischer Parameterwert | Schema erzwingt diese Zusammenhänge nicht |
| DEC-022 | 2026-11-18 | vorläufig | Methodenparameter-Feld je nach Methode (maxValue/codeValue), leeres Feld entfernt `methodParameters`; Methodenwechsel mit unpassenden Parametern → Rückfrage und Entfernen (analog DEC-015) | Keine Altlasten, kein unbemerkter Datenverlust |
| DEC-023 | 2026-11-18 | beschlossen | Gemeinsame Editor-Bausteine in `shared/editor/`: `OptionalLanguageTextEditor`, `ValidationPanel` (+ `warningsAt`), Layout-Styles `src/styles/_editor.scss`; Zahl-Hilfen in `shared/model/number-utils.ts` | Wiederverwendung zwischen Basis- und abgeleitetem Editor |
| DEC-024 | 2026-11-18 | beschlossen | Q-008: `itemValueType` (FULL_CREDIT/NO_CREDIT/MISSING) aus dem Basis-Schema wird ignoriert | Definition wird im Schema nirgends referenziert |
| DEC-025 | 2026-11-18 | beschlossen | Q-009: `minItemNumber` negativ oder größer als die Anzahl der Items → Warnung | Skala würde nie bzw. unsinnig berichtet; als Warnung, um Zwischenstände nicht zu blockieren |
| DEC-026 | 2026-11-18 | beschlossen | acp-Index wird als Arbeitsbereich geöffnet (Seitenleiste mit allen Skalen aller Assessment-Teile, Bearbeiten in den vorhandenen Editoren, Speichern des gesamten Index). Nur die Skalen werden validiert, nicht der Index selbst (Schema referenziert externe Specs: acp-unit, metadata-values). Übrige Inhalte bleiben unverändert. Umsetzung: `IndexWorkspaceService` (`src/app/index/`), Rückschreiben über `ScaleStoreBase.setChangeListener` | Entscheidung User (Option „Index as workspace“); Editor soll nur Skalen verändern |
| DEC-027 | 2026-11-18 | beschlossen | Speichern (Datei/Download) in `JsonFileService` (shared) zusammengefasst; genutzt von Skalen-Dateien und Index | Gleiches Verhalten für alle Dateiarten |
| DEC-028 | 2026-11-18 | beschlossen | Q-011: Index-weite Prüfungen vorerst nur als Warnungen: doppelte Skalen-IDs, unbekannte `sources`, Basis-Items nicht in den Units des Teils (`checkIndex`, `src/app/index/model/index-checks.ts`). Anzeige im Editor über `ScaleStoreBase.setExtraWarnings` | Entscheidung User; Hinweise ohne Blockade |
| DEC-029 | 2026-11-18 | beschlossen | Q-014: Skalen per Drag & Drop (CDK) und Aktionsmenü umsortieren und zwischen Assessment-Teilen verschieben, nur innerhalb desselben Typs | Entscheidung User |
| DEC-030 | 2026-11-18 | beschlossen | Q-012/Q-013: Im Index sind nur Skalen bearbeitbar (Metadaten/Teile schreibgeschützt); kein Anlegen neuer Indizes | Entscheidung User (vorerst) |
| DEC-031 | 2026-11-19 | beschlossen | Skalen-ID-Felder (eigene ID, `sources`) mit Material-Autocomplete (`ScaleIdInput`, `ScaleIdListEditor` in shared), Freitext erlaubt. Vorschläge über `ScaleIdSuggestionsService` (shared), Quelle: Skalen des geöffneten Index | Wunsch User; Tippfehler bei Verweisen vermeiden |

## Offene Fragen

| ID | Frage |
|---|---|
| ~~Q-001~~ | ~~Mapping-Parameter je Bedingung prüfen?~~ → entschieden in DEC-013 |
| ~~Q-002~~ | ~~Leere Strings als Fehler?~~ → entschieden in DEC-014 |
| ~~Q-003~~ | ~~Mappings nur bei MAP?~~ → entschieden in DEC-015 |
| ~~Q-004~~ | ~~Quellen aus Liste wählen?~~ → vorerst nein, DEC-016; wieder aufgreifen, sobald bekannte Skalen verfügbar sind |
| ~~Q-005~~ | ~~Download oder File System Access API?~~ → entschieden in DEC-017 |
| Q-006 | Bedeutung mehrerer Parameter bei `EQUALS` ("einer davon"?) und ob EQUALS nur Zahlen vergleicht. |
| Q-007 | Basis-Skala: Soll bei `WLE` jedes Item einen `LOGIT_FULL_CREDIT` haben (Warnung/Fehler)? Sind Partial-Credit-Schlüssel nur in Reihenfolge (1 vor 2 vor 3) sinnvoll? |
| ~~Q-008~~ | ~~`itemValueType` ignorieren?~~ → ja, DEC-024 |
| ~~Q-009~~ | ~~`minItemNumber` prüfen?~~ → Warnung, DEC-025 |
| ~~Q-010~~ | ~~Default-Methode neue Basis-Skala?~~ → `SCORE_SUM`, DEC-019 beschlossen |
| ~~Q-011~~ | ~~Index-weite Prüfungen?~~ → Warnungen, DEC-028 |
| ~~Q-012~~ | ~~Index-Metadaten bearbeitbar?~~ → vorerst nur Skalen, DEC-030 |
| ~~Q-013~~ | ~~Neuen Index anlegen?~~ → nein, DEC-030 |
| ~~Q-014~~ | ~~Skalen verschieben?~~ → ja, DEC-029 |
| Q-015 | Wie wird die volle Item-ID aus Unit-Alias und Item-ID gebildet (Trennzeichen)? Aktuell werden „“, „_“, „-“, „.“ akzeptiert (REQ-014). |
| Q-016 | Woher sollen Vorschläge kommen, wenn kein Index geöffnet ist (z. B. zuletzt geöffnete Dateien, Ordner mit Skalen)? Sollen auch Item-IDs der Basis-Skalen aus den Units vorgeschlagen werden? |
