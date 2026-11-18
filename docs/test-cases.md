# Testfälle

Automatisierte Tests laufen mit Vitest: `npm test` (bzw. `npx ng test --watch=false`).
Die Test-ID steht jeweils am Anfang des Testnamens im `*.spec.ts`.

| ID | REQ | Beschreibung | Art | Datei |
|---|---|---|---|---|
| TC-001 | REQ-002 | Leere Skala hat Default-Sprache, Methode MAP, eine leere Quelle | auto | `src/app/derived/model/derived-scale.factory.spec.ts` |
| TC-002 | REQ-002 | Leere Skalen sind unabhängige Instanzen | auto | `src/app/derived/model/derived-scale.factory.spec.ts` |
| TC-010 | REQ-005 | Gültige MAP-Skala (README-Beispiel) wird akzeptiert | auto | `src/app/derived/model/derived-scale-validation.spec.ts` |
| TC-011 | REQ-005 | Minimale Skala (id, name, sources) ist gültig | auto | `src/app/derived/model/derived-scale-validation.spec.ts` |
| TC-012 | REQ-005 | Fehlende Pflichtfelder werden gemeldet | auto | `src/app/derived/model/derived-scale-validation.spec.ts` |
| TC-013 | REQ-005 | Leere `sources` sind ungültig | auto | `src/app/derived/model/derived-scale-validation.spec.ts` |
| TC-014 | REQ-005 | Sprachcode muss `^[a-z]{2}$` entsprechen | auto | `src/app/derived/model/derived-scale-validation.spec.ts` |
| TC-015 | REQ-005 | Unbekannte Eigenschaften werden gemeldet | auto | `src/app/derived/model/derived-scale-validation.spec.ts` |
| TC-016 | REQ-005 | Unbekannte Skalen-/Mapping-Methoden sind ungültig | auto | `src/app/derived/model/derived-scale-validation.spec.ts` |
| TC-017 | REQ-005 | `newValue.value` muss eine Zahl sein | auto | `src/app/derived/model/derived-scale-validation.spec.ts` |
| TC-018 | REQ-005/007 | Neue leere Skala ist schemakonform, aber inhaltlich ungültig (id, Name, Quelle) | auto | `src/app/derived/model/derived-scale-validation.spec.ts` |
| TC-019 | REQ-005 | `DERIVED_SCALE_SCHEMA_ID` + `DERIVED_SCALE_SCHEMA_VERSION` entsprechen der `$id` des Schemas | auto | `src/app/derived/model/derived-scale-validation.spec.ts` |
| TC-020 | REQ-001 | Gültige Skalendatei wird geladen | auto | `src/app/derived/services/derived-scale-file.service.spec.ts` |
| TC-021 | REQ-001 | Ungültiges JSON → Fehlermeldung | auto | `src/app/derived/services/derived-scale-file.service.spec.ts` |
| TC-022 | REQ-001 | JSON ohne Objekt → Fehler | auto | `src/app/derived/services/derived-scale-file.service.spec.ts` |
| TC-023 | REQ-001 | Nicht schemakonformes Objekt wird mit Problemen geladen | auto | `src/app/derived/services/derived-scale-file.service.spec.ts` |
| TC-024 | REQ-001 | README-Variante `mappingElse` wird akzeptiert | auto | `src/app/derived/services/derived-scale-file.service.spec.ts` |
| TC-030 | REQ-001 | `mappingElse` → `mappingsElse` | auto | `src/app/derived/model/derived-scale-normalize.spec.ts` |
| TC-031 | REQ-001 | Bei beiden Varianten bleibt `mappingsElse` maßgeblich | auto | `src/app/derived/model/derived-scale-normalize.spec.ts` |
| TC-032 | REQ-001 | Nicht-Objekte bleiben unverändert | auto | `src/app/derived/model/derived-scale-normalize.spec.ts` |
| TC-040 | REQ-004 | Serialisieren + Laden ergibt dieselbe Skala | auto | `src/app/derived/services/derived-scale-file.service.spec.ts` |
| TC-041 | REQ-004 | Dateiname aus Dateiname/ID/Fallback | auto | `src/app/derived/services/derived-scale-file.service.spec.ts` |
| TC-050 | REQ-003 | Store startet ohne Skala | auto | `src/app/derived/services/derived-scale-store.spec.ts` |
| TC-051 | REQ-002 | „Neu“ öffnet leere, unveränderte Skala | auto | `src/app/derived/services/derived-scale-store.spec.ts` |
| TC-052 | REQ-003 | Änderungen sind immutabel und setzen dirty | auto | `src/app/derived/services/derived-scale-store.spec.ts` |
| TC-053 | REQ-005 | Validierung folgt der aktuellen Skala | auto | `src/app/derived/services/derived-scale-store.spec.ts` |
| TC-054 | REQ-004 | Speichern setzt dirty zurück, merkt Dateinamen | auto | `src/app/derived/services/derived-scale-store.spec.ts` |
| TC-060 | REQ-002 | Leerzustand ohne geöffnete Skala | auto | `src/app/app.spec.ts` |
| TC-061 | REQ-002/010 | „Neu“-Menü bietet beide Typen und zeigt den passenden Editor | auto | `src/app/app.spec.ts` |
| TC-062 | REQ-003 | Ungespeicherte Änderungen mit `*` markiert (inkl. Typ) | auto | `src/app/app.spec.ts` |
| TC-063 | REQ-010 | Rückfrage vor Verwerfen; Abbrechen behält Skala | auto | `src/app/app.spec.ts` |
| TC-070 | REQ-003 | Editor zeigt ID und Gültigkeit | auto | `src/app/derived/editor/derived-scale-editor.spec.ts` |
| TC-071 | REQ-003 | Eingabe in ID-Feld aktualisiert den Store | auto | `src/app/derived/editor/derived-scale-editor.spec.ts` |
| TC-072 | REQ-005 | Validierungsfehler werden angezeigt | auto | `src/app/derived/editor/derived-scale-editor.spec.ts` |
| TC-073 | REQ-003 | Mappings hinzufügen, verschieben, entfernen | auto | `src/app/derived/editor/derived-scale-editor.spec.ts` |
| TC-074 | REQ-003 | Entfernen optionaler Felder löscht die Eigenschaft | auto | `src/app/derived/editor/derived-scale-editor.spec.ts` |
| TC-080 | – | `patchObject` mischt und entfernt `undefined`-Eigenschaften (gemeinsame Hilfsfunktion) | auto | `src/app/shared/model/object-utils.spec.ts` |
| TC-090 | REQ-006 | Keine Warnungen bei korrekter Skala | auto | `src/app/derived/model/derived-scale-warnings.spec.ts` |
| TC-091 | REQ-006 | MIN/MAX/LESS_THAN/MORE_THAN mit einer Zahl → keine Warnung | auto | `src/app/derived/model/derived-scale-warnings.spec.ts` |
| TC-092 | REQ-006 | Vergleichsbedingungen: falsche Parameteranzahl → Warnung | auto | `src/app/derived/model/derived-scale-warnings.spec.ts` |
| TC-093 | REQ-006 | Vergleichsbedingungen: nicht-numerischer Parameter (auch `1,5`, leer) → Warnung | auto | `src/app/derived/model/derived-scale-warnings.spec.ts` |
| TC-094 | REQ-006 | EQUALS: mind. ein, nicht leerer Parameter; nicht-numerisch erlaubt | auto | `src/app/derived/model/derived-scale-warnings.spec.ts` |
| TC-095 | REQ-006 | Robust bei schemawidrigen Daten | auto | `src/app/derived/model/derived-scale-warnings.spec.ts` |
| TC-096 | REQ-006 | Zahlerkennung nur JSON-Zahlen | auto | `src/app/derived/model/derived-scale-warnings.spec.ts` |
| TC-097 | REQ-006 | Warnungen inline und in „Prüfung“, Skala bleibt gültig | auto | `src/app/derived/editor/derived-scale-editor.spec.ts` |
| TC-100 | REQ-007 | Keine Inhaltsfehler bei korrekter Skala | auto | `src/app/derived/model/derived-scale-validation.spec.ts` |
| TC-101 | REQ-007 | Leere/Leerzeichen-`id` → Fehler | auto | `src/app/derived/model/derived-scale-validation.spec.ts` |
| TC-102 | REQ-007 | Leere Quellen → Fehler | auto | `src/app/derived/model/derived-scale-validation.spec.ts` |
| TC-103 | REQ-007 | Leere Texte in Name/Beschreibung → Fehler | auto | `src/app/derived/model/derived-scale-validation.spec.ts` |
| TC-104 | REQ-007 | Doppelte Sprache → Fehler | auto | `src/app/derived/model/derived-scale-validation.spec.ts` |
| TC-105 | REQ-007 | Texte in Mapping-Werten und `mappingsElse` werden geprüft | auto | `src/app/derived/model/derived-scale-validation.spec.ts` |
| TC-106 | REQ-007 | Inhaltsfehler machen die Skala ungültig | auto | `src/app/derived/model/derived-scale-validation.spec.ts` |
| TC-107 | REQ-007 | Robust bei schemawidrigen Daten | auto | `src/app/derived/model/derived-scale-validation.spec.ts` |
| TC-110 | REQ-008 | Bei MAP sind Mappings und Sonst-Wert sichtbar | auto | `src/app/derived/editor/derived-scale-editor.spec.ts` |
| TC-111 | REQ-008 | Bei SUM/MEAN ohne Mapping-Daten ausgeblendet | auto | `src/app/derived/editor/derived-scale-editor.spec.ts` |
| TC-112 | REQ-008 | Wechsel weg von MAP mit Daten: Rückfrage, bei Bestätigung entfernt | auto | `src/app/derived/editor/derived-scale-editor.spec.ts` |
| TC-113 | REQ-008 | Abbrechen: nichts geändert, Auswahl zurückgesetzt | auto | `src/app/derived/editor/derived-scale-editor.spec.ts` |
| TC-114 | REQ-008 | Wechsel ohne Mapping-Daten: keine Rückfrage, leere Liste entfernt | auto | `src/app/derived/editor/derived-scale-editor.spec.ts` |
| TC-115 | REQ-008 | Zurück zu MAP zeigt Abschnitte wieder | auto | `src/app/derived/editor/derived-scale-editor.spec.ts` |
| TC-116 | REQ-008 | Geladene SUM-Skala mit Mappings: sichtbar + Warnungen | auto | `src/app/derived/editor/derived-scale-editor.spec.ts` |
| TC-117 | REQ-008 | Warnung bei Mappings/Sonst-Wert mit SUM/MEAN | auto | `src/app/derived/model/derived-scale-warnings.spec.ts` |
| TC-M04 | REQ-008 | Manuell: Methode MAP→SUM mit Regeln, Rückfrage abbrechen → Auswahl zeigt wieder MAP | manuell | – |
| TC-122 | REQ-009 | Speichern mit Handle schreibt ohne Rückfrage in die Datei | auto | `src/app/derived/services/derived-scale-file.service.save.spec.ts` |
| TC-123 | REQ-009 | Speichern ohne Handle fragt nach Ziel (Vorschlag aus ID) | auto | `src/app/derived/services/derived-scale-file.service.save.spec.ts` |
| TC-124 | REQ-009 | „Speichern unter…“ fragt immer; Abbrechen schreibt nichts | auto | `src/app/derived/services/derived-scale-file.service.save.spec.ts` |
| TC-125 | REQ-009 | Ohne API: Download-Fallback | auto | `src/app/derived/services/derived-scale-file.service.save.spec.ts` |
| TC-126 | REQ-009 | Store hält Datei-Handle, „Neu“ setzt es zurück | auto | `src/app/derived/services/derived-scale-store.spec.ts` |
| TC-127 | REQ-009 | „Speichern unter…“ nur mit API-Unterstützung sichtbar | auto | `src/app/app.spec.ts` |
| TC-128 | REQ-010 | Öffnen einer Basis-Skala per Picker zeigt den Basis-Editor | auto | `src/app/app.spec.ts` |
| TC-130 | REQ-009 | Ohne API: „Öffnen“ nutzt Datei-Input | auto | `src/app/app.spec.ts` |
| TC-M05 | REQ-009 | Manuell (Chrome/Edge): Datei öffnen, ändern, „Speichern“ → Datei auf der Platte geändert, kein Dialog | manuell | – |
| TC-M06 | REQ-009 | Manuell (Chrome/Edge): „Speichern unter…“ → neue Datei, Titel zeigt neuen Namen, weiteres „Speichern“ schreibt in die neue Datei | manuell | – |
| TC-M07 | REQ-009 | Manuell (Firefox): „Speichern“ lädt Datei herunter, kein „Speichern unter…“-Button | manuell | – |
| TC-140 | REQ-010 | Startet ohne Dokument | auto | `src/app/document/scale-document.service.spec.ts` |
| TC-141 | REQ-010 | Neu aktiviert Typ, schließt anderen | auto | `src/app/document/scale-document.service.spec.ts` |
| TC-142 | REQ-010 | Basis-Skala wird erkannt und geladen | auto | `src/app/document/scale-document.service.spec.ts` |
| TC-143 | REQ-010 | Abgeleitete Skala (auch `mappingElse`) wird erkannt | auto | `src/app/document/scale-document.service.spec.ts` |
| TC-144 | REQ-010 | Nicht erkennbar/ungültiges JSON → Fehler, aktuelle Skala bleibt | auto | `src/app/document/scale-document.service.spec.ts` |
| TC-145 | REQ-010 | Schemawidrige, erkennbare Datei wird mit Problemanzahl geöffnet | auto | `src/app/document/scale-document.service.spec.ts` |
| TC-146 | REQ-009/010 | Öffnen per Picker verknüpft Datei; Abbrechen ändert nichts | auto | `src/app/document/scale-document.service.spec.ts` |
| TC-147 | REQ-009 | Speichern schreibt in verknüpfte Datei, dirty zurückgesetzt | auto | `src/app/document/scale-document.service.spec.ts` |
| TC-148 | REQ-009 | Abgebrochenes „Speichern unter…“ bleibt dirty | auto | `src/app/document/scale-document.service.spec.ts` |
| TC-150 | REQ-010 | Typerkennung vollständiger Skalen | auto | `src/app/shared/model/scale-type.spec.ts` |
| TC-151 | REQ-010 | Typerkennung über einzelne Merkmale/Methode | auto | `src/app/shared/model/scale-type.spec.ts` |
| TC-152 | REQ-010 | Nicht erkennbar/widersprüchlich → null | auto | `src/app/shared/model/scale-type.spec.ts` |
| TC-153 | REQ-010 | `parseJsonObject` akzeptiert nur Objekte | auto | `src/app/shared/model/scale-type.spec.ts` |
| TC-160 | REQ-011 | Schema: gültige WLE-Skala, minimale Skala ohne Name | auto | `src/app/base/model/base-scale-validation.spec.ts` |
| TC-161 | REQ-011 | Schema: id, method, mind. ein Item Pflicht | auto | `src/app/base/model/base-scale-validation.spec.ts` |
| TC-162 | REQ-011 | Schema: Varianten von methodParameters | auto | `src/app/base/model/base-scale-validation.spec.ts` |
| TC-163 | REQ-011 | Schema: unbekannte Methode/Parameter-Schlüssel | auto | `src/app/base/model/base-scale-validation.spec.ts` |
| TC-164 | REQ-011 | Schema-ID/Version passen zu `$id` | auto | `src/app/base/model/base-scale-validation.spec.ts` |
| TC-165 | REQ-011 | Keine Inhaltsfehler bei korrekter Skala | auto | `src/app/base/model/base-scale-validation.spec.ts` |
| TC-166 | REQ-011 | Leere id/Item-IDs/Texte, doppelte Sprachen → Fehler | auto | `src/app/base/model/base-scale-validation.spec.ts` |
| TC-167 | REQ-011 | Doppelte Item-IDs → Fehler | auto | `src/app/base/model/base-scale-validation.spec.ts` |
| TC-168 | REQ-011 | Doppelte Parameter-Schlüssel → Fehler | auto | `src/app/base/model/base-scale-validation.spec.ts` |
| TC-169 | REQ-011 | Neue leere Basis-Skala: schemakonform, Inhaltsfehler | auto | `src/app/base/model/base-scale-validation.spec.ts` |
| TC-170 | REQ-011 | Inhaltsprüfung robust bei schemawidrigen Daten | auto | `src/app/base/model/base-scale-validation.spec.ts` |
| TC-180 | REQ-012 | Keine Warnungen bei korrekter WLE-Skala | auto | `src/app/base/model/base-scale-warnings.spec.ts` |
| TC-181 | REQ-012 | CODE_COUNT ohne codeValue → Warnung | auto | `src/app/base/model/base-scale-warnings.spec.ts` |
| TC-182 | REQ-012 | SCORE_RATIO ohne maxValue → keine Warnung | auto | `src/app/base/model/base-scale-warnings.spec.ts` |
| TC-183 | REQ-012 | Unpassende methodParameters → Warnung | auto | `src/app/base/model/base-scale-warnings.spec.ts` |
| TC-184 | REQ-012 | Logit-Parameter ohne WLE → Warnung | auto | `src/app/base/model/base-scale-warnings.spec.ts` |
| TC-185 | REQ-012 | Fehlender/nicht-numerischer Parameterwert → Warnung | auto | `src/app/base/model/base-scale-warnings.spec.ts` |
| TC-186 | REQ-012 | Warnungen robust bei schemawidrigen Daten | auto | `src/app/base/model/base-scale-warnings.spec.ts` |
| TC-187 | REQ-012 | `minItemNumber` negativ oder > Anzahl Items → Warnung | auto | `src/app/base/model/base-scale-warnings.spec.ts` |
| TC-203 | REQ-012 | `minItemNumber`-Warnung inline | auto | `src/app/base/editor/base-scale-editor.spec.ts` |
| TC-190 | REQ-011 | Editor zeigt ID, Items, Gültigkeit | auto | `src/app/base/editor/base-scale-editor.spec.ts` |
| TC-191 | REQ-011 | Eingabe ID aktualisiert Store | auto | `src/app/base/editor/base-scale-editor.spec.ts` |
| TC-192 | REQ-011 | maxValue nur bei SCORE_RATIO, codeValue nur bei CODE_COUNT | auto | `src/app/base/editor/base-scale-editor.spec.ts` |
| TC-193 | REQ-011 | Methodenparameter setzen/leeren | auto | `src/app/base/editor/base-scale-editor.spec.ts` |
| TC-194 | REQ-011 | Methodenwechsel mit unpassenden Parametern: Rückfrage, Entfernen | auto | `src/app/base/editor/base-scale-editor.spec.ts` |
| TC-195 | REQ-011 | Abbrechen: nichts geändert, Auswahl zurück | auto | `src/app/base/editor/base-scale-editor.spec.ts` |
| TC-196 | REQ-011 | Methodenwechsel ohne Parameter: keine Rückfrage | auto | `src/app/base/editor/base-scale-editor.spec.ts` |
| TC-197 | REQ-011 | Items hinzufügen/entfernen, letztes nicht löschbar | auto | `src/app/base/editor/base-scale-editor.spec.ts` |
| TC-198 | REQ-011 | Gewicht leer entfernt Eigenschaft | auto | `src/app/base/editor/base-scale-editor.spec.ts` |
| TC-199 | REQ-011 | Item-Parameter hinzufügen/ändern/entfernen | auto | `src/app/base/editor/base-scale-editor.spec.ts` |
| TC-200 | REQ-011 | Name optional entfernbar | auto | `src/app/base/editor/base-scale-editor.spec.ts` |
| TC-201 | REQ-012 | Item-Parameter-Warnungen inline | auto | `src/app/base/editor/base-scale-editor.spec.ts` |
| TC-202 | REQ-011 | Leere Basis-Skala: id, Name (de), SCORE_SUM, ein leeres Item | auto | `src/app/base/model/base-scale.factory.spec.ts` |
| TC-M08 | REQ-010 | Manuell: Basis-Skala neu anlegen, speichern, wieder öffnen → Basis-Editor mit identischem Inhalt | manuell | – |
| TC-210 | REQ-013 | Teile mit Basis-/abgeleiteten Skalen und Prüfergebnis | auto | `src/app/index/services/index-workspace.service.spec.ts` |
| TC-211 | REQ-013 | Auswahl lädt Skala in passenden Store | auto | `src/app/index/services/index-workspace.service.spec.ts` |
| TC-212 | REQ-013 | Änderungen werden in den Index zurückgeschrieben, dirty | auto | `src/app/index/services/index-workspace.service.spec.ts` |
| TC-213 | REQ-013 | Alles außer der bearbeiteten Skala bleibt unverändert | auto | `src/app/index/services/index-workspace.service.spec.ts` |
| TC-214 | REQ-013 | Neue Skala: Liste anlegen, anhängen, auswählen | auto | `src/app/index/services/index-workspace.service.spec.ts` |
| TC-215 | REQ-013 | Entfernen; leere Liste wird entfernt | auto | `src/app/index/services/index-workspace.service.spec.ts` |
| TC-216 | REQ-013 | Auswahl nach Entfernen korrekt (gelöscht/verschoben) | auto | `src/app/index/services/index-workspace.service.spec.ts` |
| TC-217 | REQ-013 | `mappingElse` im Index normalisiert | auto | `src/app/index/services/index-workspace.service.spec.ts` |
| TC-218 | REQ-013 | Fehleranzahl über alle Skalen | auto | `src/app/index/services/index-workspace.service.spec.ts` |
| TC-219 | REQ-013 | Dateinamen-Vorschlag | auto | `src/app/index/services/index-workspace.service.spec.ts` |
| TC-220 | REQ-013 | Ohne Index werden Änderungen nirgends zurückgeschrieben | auto | `src/app/index/services/index-workspace.service.spec.ts` |
| TC-221 | REQ-013 | Robust bei fehlenden Listen/ungültigen Teilen | auto | `src/app/index/services/index-workspace.service.spec.ts` |
| TC-222 | REQ-013 | Index-Datei wird erkannt und geöffnet | auto | `src/app/document/scale-document.service.spec.ts` |
| TC-223 | REQ-013 | Typ/hasScale folgen der Auswahl | auto | `src/app/document/scale-document.service.spec.ts` |
| TC-224 | REQ-013 | Speichern schreibt gesamten Index, übrige Inhalte erhalten | auto | `src/app/document/scale-document.service.spec.ts` |
| TC-225 | REQ-013 | „Speichern unter…“ schlägt Dateinamen vor | auto | `src/app/document/scale-document.service.spec.ts` |
| TC-226 | REQ-013 | „Neu“ schließt den Index | auto | `src/app/document/scale-document.service.spec.ts` |
| TC-227 | REQ-013 | Öffnen einer Skalen-Datei schließt den Index | auto | `src/app/document/scale-document.service.spec.ts` |
| TC-230 | REQ-013 | Seitenleiste zeigt Paket, Teile, Skalen | auto | `src/app/index/sidebar/index-sidebar.spec.ts` |
| TC-231 | REQ-013 | Klick wählt Skala, Hervorhebung | auto | `src/app/index/sidebar/index-sidebar.spec.ts` |
| TC-232 | REQ-013 | „+“ fügt Skala hinzu | auto | `src/app/index/sidebar/index-sidebar.spec.ts` |
| TC-233 | REQ-013 | Löschen (über Menü) mit Rückfrage | auto | `src/app/index/sidebar/index-sidebar.spec.ts` |
| TC-234 | REQ-013 | Hinweis ohne Assessment-Teile | auto | `src/app/index/sidebar/index-sidebar.spec.ts` |
| TC-235 | REQ-013 | App: Index öffnen zeigt Seitenleiste/Hinweis, Auswahl zeigt Editor | auto | `src/app/app.spec.ts` |
| TC-M09 | REQ-013 | Manuell: echten acp-Index öffnen, Skala ändern, speichern → Diff zeigt nur die geänderte Skala (abgesehen von Formatierung) | manuell | – |
| TC-240 | REQ-014 | Konsistenter Index ohne Warnungen | auto | `src/app/index/model/index-checks.spec.ts` |
| TC-241 | REQ-014 | Doppelte Skalen-IDs → Warnung je Vorkommen | auto | `src/app/index/model/index-checks.spec.ts` |
| TC-242 | REQ-014 | Unbekannte `sources` → Warnung | auto | `src/app/index/model/index-checks.spec.ts` |
| TC-243 | REQ-014 | Item nicht in Units → Warnung | auto | `src/app/index/model/index-checks.spec.ts` |
| TC-244 | REQ-014 | Item-ID-Bildung (Präfix/Alias/Trennzeichen, ohne Präfix) | auto | `src/app/index/model/index-checks.spec.ts` |
| TC-245 | REQ-014 | Item-Prüfung entfällt ohne Unit-Items; robust | auto | `src/app/index/model/index-checks.spec.ts` |
| TC-246 | REQ-015 | Menü: in anderen Teil verschieben | auto | `src/app/index/sidebar/index-sidebar.spec.ts` |
| TC-247 | REQ-015 | Drag & Drop nur bei gleichem Typ | auto | `src/app/index/sidebar/index-sidebar.spec.ts` |
| TC-248 | REQ-014 | Index-Warnungen in Seitenleiste und Editor, reaktiv | auto | `src/app/index/services/index-workspace.service.spec.ts` |
| TC-249 | REQ-014 | Index-Warnungen nach Schließen entfernt | auto | `src/app/index/services/index-workspace.service.spec.ts` |
| TC-250 | REQ-015 | Umsortieren innerhalb der Liste, Auswahl folgt | auto | `src/app/index/services/index-workspace.service.spec.ts` |
| TC-251 | REQ-015 | Verschieben in anderen Teil: Listen anlegen/entfernen | auto | `src/app/index/services/index-workspace.service.spec.ts` |
| TC-252 | REQ-015 | Auswahl folgt, Änderungen landen an neuer Position | auto | `src/app/index/services/index-workspace.service.spec.ts` |
| TC-253 | REQ-015 | Ungültige Positionen ändern nichts | auto | `src/app/index/services/index-workspace.service.spec.ts` |
| TC-M10 | REQ-015 | Manuell: Skala per Drag & Drop in anderen Teil ziehen; abgeleitete Skala lässt sich nicht in Basis-Liste ziehen | manuell | – |
| TC-260 | REQ-016 | Ohne Quelle keine Vorschläge | auto | `src/app/shared/services/scale-id-suggestions.service.spec.ts` |
| TC-261 | REQ-016 | Vorschläge eindeutig, nicht leer, sortiert | auto | `src/app/shared/services/scale-id-suggestions.service.spec.ts` |
| TC-262 | REQ-016 | Leerer Text listet alles | auto | `src/app/shared/services/scale-id-suggestions.service.spec.ts` |
| TC-263 | REQ-016 | Filter: Teilstring, case-insensitiv, Präfix zuerst | auto | `src/app/shared/services/scale-id-suggestions.service.spec.ts` |
| TC-264 | REQ-016 | Ausschluss eigener IDs/exakter Treffer | auto | `src/app/shared/services/scale-id-suggestions.service.spec.ts` |
| TC-265 | REQ-016 | Fokus zeigt IDs mit Typ und Teil | auto | `src/app/shared/editor/scale-id-input.spec.ts` |
| TC-266 | REQ-016 | Tippen filtert, Auswahl übernimmt | auto | `src/app/shared/editor/scale-id-input.spec.ts` |
| TC-267 | REQ-016 | Neue, nicht existierende ID frei eingebbar | auto | `src/app/shared/editor/scale-id-input.spec.ts` |
| TC-268 | REQ-016 | Geöffneter Index liefert seine IDs, aktualisiert beim Bearbeiten | auto | `src/app/index/services/index-workspace.service.spec.ts` |
| TC-269 | REQ-016 | Quell-Skalen: Vorschläge ohne eigene ID | auto | `src/app/derived/editor/derived-scale-editor.spec.ts` |
| TC-M01 | REQ-001/004 | Manuell: Neue Skala anlegen, speichern, Datei wieder öffnen → identischer Inhalt | manuell | – |
| TC-M02 | REQ-001 | Manuell: Datei mit kaputtem JSON öffnen → Snackbar-Fehler, Editor unverändert | manuell | – |
| TC-M03 | REQ-001 | Manuell: Bei ungespeicherten Änderungen „Öffnen“/„Neu“ → Rückfrage | manuell | – |
