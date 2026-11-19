# Anforderungen

Spezifikationen (Schemas als Kopie im Repo, aus Branch `main`):
- Abgeleitete Skala: [acp-scale-derived@0.4](https://iqb-specifications.github.io/acp-scale-derived/) – `src/app/derived/model/acp-scale-derived.schema.json`
- Basis-Skala: [acp-scale-base@0.4](https://iqb-specifications.github.io/acp-scale-base/) – `src/app/base/model/acp-scale-base.schema.json`
- Index: [acp-index@0.6](https://iqb-specifications.github.io/acp-index/) – nicht im Repo; das Index-Schema wird nicht geprüft (DEC-026)

REQ-001 bis REQ-009 wurden für abgeleitete Skalen formuliert; Laden/Speichern/Validierung (REQ-001, 004, 005, 009) gelten genauso für Basis-Skalen.

Status: `offen` · `in Arbeit` · `umgesetzt (Basis)` · `umgesetzt` · `verworfen`.
Testfälle: siehe [test-cases.md](test-cases.md). Entscheidungen: siehe [decisions.md](decisions.md).

| ID | Anforderung | Status | Testfälle | Entscheidungen |
|---|---|---|---|---|
| REQ-001 | Skala aus lokaler JSON-Datei laden | umgesetzt (Basis) | TC-020–TC-024 | DEC-004, DEC-005, DEC-017 |
| REQ-002 | Neue Skala erstellen | umgesetzt (Basis) | TC-001, TC-002, TC-051, TC-061 | DEC-008 |
| REQ-003 | Skala bearbeiten (alle Felder der Spec 0.4) | umgesetzt (Basis) | TC-050–TC-054, TC-070–TC-074 | DEC-006 |
| REQ-004 | Skala als JSON-Datei speichern | umgesetzt | TC-040, TC-041, TC-062 | DEC-007, DEC-009, DEC-017 |
| REQ-005 | Validierung gegen das JSON-Schema 0.4 mit Anzeige der Fehler | umgesetzt (Basis) | TC-010–TC-019, TC-072 | DEC-005 |
| REQ-006 | Warnungen für Mapping-Parameter je Bedingung | umgesetzt | TC-090–TC-097 | DEC-013 |
| REQ-007 | Inhaltsprüfung: keine leeren Pflichttexte, keine doppelten Sprachen | umgesetzt | TC-018, TC-100–TC-107 | DEC-014 |
| REQ-009 | Öffnen/Speichern direkt im Dateisystem (File System Access API) mit Download-Fallback | umgesetzt | TC-120–TC-130, TC-M05–TC-M07 | DEC-017 |
| REQ-010 | Zwei Skalentypen (Basis/abgeleitet): Neu je Typ, Typ beim Öffnen automatisch erkennen | umgesetzt | TC-140–TC-153, TC-060–TC-063, TC-128 | DEC-018 |
| REQ-011 | Basis-Skala bearbeiten (alle Felder der Spec acp-scale-base 0.4) inkl. Inhaltsprüfung | umgesetzt | TC-160–TC-170, TC-190–TC-202 | DEC-019, DEC-020, DEC-022 |
| REQ-012 | Warnungen für Basis-Skalen | umgesetzt | TC-180–TC-187, TC-201, TC-203 | DEC-021, DEC-025 |
| REQ-013 | acp-Index als Arbeitsbereich: öffnen, enthaltene Skalen bearbeiten/hinzufügen/entfernen, gesamten Index speichern | umgesetzt | TC-210–TC-235 | DEC-026, DEC-027 |
| REQ-014 | Index-weite Prüfungen (Warnungen) | umgesetzt | TC-240–TC-245, TC-248, TC-249 | DEC-028 |
| REQ-015 | Skalen im Index umsortieren und zwischen Assessment-Teilen verschieben | umgesetzt | TC-246, TC-247, TC-250–TC-253 | DEC-029 |
| REQ-016 | Skalen-ID-Eingabe mit Suche über vorhandene IDs, neue IDs frei eingebbar | umgesetzt | TC-260–TC-269 | DEC-031 |
| REQ-017 | Auslieferung als eine einzige, offline lauffähige HTML-Datei | umgesetzt | TC-M11 | DEC-032 |
| REQ-008 | Mappings/Sonst-Wert nur bei Methode MAP; Entfernen beim Methodenwechsel mit Rückfrage | umgesetzt | TC-110–TC-117 | DEC-015 |

## Details

### REQ-001 Skala laden
- Über „Öffnen“ wird eine `.json`-Datei ausgewählt.
- Kein gültiges JSON bzw. kein JSON-Objekt → Fehlermeldung, aktuelle Skala bleibt erhalten.
- Gültiges JSON-Objekt, das nicht schemakonform ist → wird geladen, Probleme werden angezeigt (DEC-005).
- `mappingElse` (README-Schreibweise) wird beim Laden in `mappingsElse` umbenannt (DEC-004).
- Bei ungespeicherten Änderungen wird vorher nachgefragt (DEC-007).

### REQ-002 Skala erstellen
- „Neu“ legt eine leere Skala an: `id: ""`, `name: [{lang: "de", value: ""}]`, `sources: [""]`, `method: "MAP"`, `mappings: []`.

### REQ-003 Skala bearbeiten
- Allgemein: `id`, `name` (mehrsprachig, min. 1), `description` (optional, mehrsprachig), `method` (SUM/MEAN/MAP), `publicVocabularyUrl` (optional).
- Quellen: Liste von Skalen-IDs (min. 1), manuelle Eingabe (DEC-016).
- Mappings: Regeln hinzufügen, entfernen, umsortieren (Reihenfolge relevant: erste passende Regel gilt); je Regel Bedingung, Parameterliste, neuer Wert.
- Neuer Wert: `value` (Zahl), `label`/`description` (optional, mehrsprachig), `publicVocabularyEntry` (optional).
- Sonst-Wert (`mappingsElse`): optional.
- Änderungen werden im Titel mit `*` markiert.
- JSON-Vorschau der aktuellen Skala.

### REQ-004 Skala speichern
- Gespeichert wird formatiertes JSON (2 Leerzeichen Einrückung). Ablauf je nach Browser siehe REQ-009.
- Dateiname: Name der geladenen Datei, sonst `<id>.json`, sonst `scale.json`.
- Speichern ist auch bei Schemaverletzungen möglich (DEC-009, vorläufig).

### REQ-005 Validierung
- Laufende Prüfung gegen das Schema mit ajv; Fehler mit JSON-Pfad und Meldung.

### REQ-010 Zwei Skalentypen
- Es ist immer genau eine Skala geöffnet (Basis- **oder** abgeleitete Skala).
- „Neu“ ist ein Menü: „Basis-Skala“ / „Abgeleitete Skala“.
- „Öffnen“ erkennt den Typ anhand typischer Eigenschaften:
  - abgeleitet: `sources`, `mappings`, `mappingsElse`/`mappingElse`, `publicVocabularyUrl` oder Methode `SUM`/`MEAN`/`MAP`
  - Basis: `items`, `methodParameters`, `minItemNumber` oder Methode `SCORE_SUM`/`SCORE_RATIO`/`SCORE_MEAN`/`SCORE_MEDIAN`/`WLE`/`CODE_COUNT`
  - Nicht erkennbar oder widersprüchlich → Fehlermeldung, aktuelle Skala bleibt geöffnet.
- Die Toolbar zeigt Typ und Dateiname, z. B. „Basis-Skala: b.json *“.

### REQ-011 Basis-Skala bearbeiten
- Allgemein: `id`, `name` (optional, mehrsprachig), `description` (optional), `method` (Pflicht), `minItemNumber` (optional; leer = Default 0 = unbegrenzt).
- `itemValueType` aus dem Schema wird nicht unterstützt (im Schema nirgends referenziert, DEC-024).
- Methodenparameter abhängig von der Methode (DEC-022):
  - `SCORE_RATIO`: Feld „Maximalwert“ (`maxValue`), optional – leer bedeutet „Anzahl der Items“.
  - `CODE_COUNT`: Feld „Zu zählender Code“ (`codeValue`).
  - Andere Methoden: kein Feld. Leeren des Feldes entfernt `methodParameters`.
  - Methodenwechsel, bei dem vorhandene Methodenparameter nicht mehr passen → Rückfrage; Bestätigen entfernt sie, Abbrechen setzt die Auswahl zurück.
- Items (min. 1, letztes nicht löschbar): `id`, `weight` (optional; leer = Default 1), Parameterliste (`key` aus LOGIT_FULL_CREDIT, LOGIT_PARTIAL_CREDIT_1–3; `value`). Neuer Parameter bekommt den nächsten freien Schlüssel; Entfernen des letzten Parameters entfernt `parameters`.
- Inhaltsprüfung (Fehler, DEC-020): leere `id`, leere Item-IDs, leere Texte, doppelte Sprachen, doppelte Item-IDs, doppelte Parameter-Schlüssel innerhalb eines Items.

### REQ-012 Warnungen für Basis-Skalen
- `CODE_COUNT` ohne `codeValue`.
- `methodParameters` passen nicht zur Methode (z. B. aus geladener Datei).
- Logit-Parameter an Items bei einer anderen Methode als `WLE`.
- Parameterwert fehlt oder ist keine Zahl (JSON-Notation, Punkt als Dezimaltrennzeichen).
- `minItemNumber` ist negativ oder größer als die Anzahl der Items (DEC-025).
- Anzeige inline (Methodenparameter, Item-Parameter) und im Abschnitt „Prüfung“.

### REQ-013 acp-Index als Arbeitsbereich
- „Öffnen“ erkennt einen acp-Index an `packageId` oder `assessmentParts` (vor der Skalen-Erkennung).
- Seitenleiste: `packageId` und Version, darunter je Assessment-Teil (Name de, sonst erste Sprache, sonst `id`) die Gruppen „Basis-Skalen“ und „Abgeleitete Skalen“ mit Skalen-ID und Status-Symbol (Fehler / Warnungen / gültig).
- Klick auf eine Skala öffnet sie im passenden Editor (Basis/abgeleitet); Änderungen werden sofort in den Index übernommen (Titel „Index: <Datei> *“, Seitenleiste aktualisiert sich).
- „+“ je Gruppe legt eine neue leere Skala an (fehlende Liste wird angelegt) und wählt sie aus.
- Aktionsmenü je Skala (⋮): nach oben/unten, in anderen Teil verschieben (REQ-015), entfernen.
- Löschen einer Skala mit Rückfrage; wird eine Liste leer, wird die Eigenschaft entfernt (`minItems: 1`).
- Ohne Assessment-Teile: Hinweis. Bearbeitbar sind nur Skalen; Index-Metadaten und Assessment-Teile sind schreibgeschützt, ein neuer Index kann nicht angelegt werden (DEC-030).
- „Speichern“/„Speichern unter…“ speichern den **gesamten Index** (Vorschlag `<packageId>.json`), wie REQ-009 (direkt in die Datei bzw. Download).
- Alle übrigen Inhalte des Index (Units, Booklets, Instrumente, Metadaten, …) bleiben unverändert erhalten. Hinweis: Die Datei wird neu formatiert (2 Leerzeichen); Zahlen wie `1.0` werden zu `1`.
- `mappingElse` in abgeleiteten Skalen wird beim Öffnen zu `mappingsElse` (DEC-004).
- „Neu“ oder Öffnen einer einzelnen Skalen-Datei schließt den Index (mit Rückfrage bei ungespeicherten Änderungen).

### REQ-014 Index-weite Prüfungen (Warnungen)
- Doppelte Skalen-ID im gesamten Index (über alle Teile und beide Typen) → Warnung an jedem Vorkommen.
- `sources` einer abgeleiteten Skala, die auf keine Skala des Index verweist → Warnung.
- Item-ID einer Basis-Skala, die in den Units des eigenen Assessment-Teils nicht definiert ist → Warnung.
  - Bekannte Item-IDs nach acp-unit@0.5: Präfix (Unit-`id` oder `alias` aus `bookletModules`) + Item-`id`; bei `useUnitAliasAsPrefix: false` nur die Item-`id`.
  - Als Trennzeichen zwischen Präfix und Item-ID werden „“, „_“, „-“, „.“ akzeptiert (Spezifikation legt keins fest, Q-015).
  - Definiert der Teil keine Unit-Items, entfällt diese Prüfung.
- Anzeige: Warnungsanzahl im Status-Symbol der Seitenleiste; im Editor der ausgewählten Skala zusammen mit den übrigen Warnungen (inline z. B. bei Mapping-Parametern nicht, aber im Abschnitt „Prüfung“ mit Pfad).
- Außerhalb eines Index (einzelne Skalen-Datei) entfallen diese Prüfungen.

### REQ-015 Skalen verschieben
- Drag & Drop (Griff ⋮⋮) innerhalb einer Liste und in die gleichartige Liste eines anderen Assessment-Teils; Basis- und abgeleitete Skalen können nicht vertauscht werden.
- Alternativ über das Aktionsmenü: „Nach oben“, „Nach unten“, „Nach „<Teil>“ verschieben“ (ans Ende der Liste).
- Leere Quellliste wird entfernt, fehlende Zielliste angelegt; die Auswahl bleibt auf der verschobenen bzw. ausgewählten Skala.

### REQ-016 Autovervollständigung für Skalen-IDs
- Betroffene Felder: „ID“ der Basis- und der abgeleiteten Skala sowie jede „Quell-Skala“ (`sources`) einer abgeleiteten Skala.
- Beim Fokussieren werden alle bekannten Skalen-IDs angeboten (mit Typ und Assessment-Teil), beim Tippen gefiltert: Groß-/Kleinschreibung egal, Teilstring-Treffer, Treffer am Anfang zuerst.
- Auswahl übernimmt die ID; jede andere (auch nicht existierende) ID kann frei eingegeben werden.
- Bekannte IDs = alle Skalen des geöffneten acp-Index (aktualisiert sich beim Bearbeiten). Bei einer einzelnen Skalen-Datei gibt es keine Vorschläge (Q-016).
- Nicht angeboten werden: der aktuell eingegebene Text selbst; bei Quell-Skalen die eigene ID der Skala.

### REQ-017 Einzelne HTML-Datei
- `npm run build:single` baut die App und erzeugt `dist/iqb-scale-editor/iqb-scale-editor.html` (Skript `scripts/inline-html.mjs`).
- Eingebettet: Skripte, Stylesheets, `url(…)`-Referenzen in CSS (Schriften Roboto und Material Symbols, auch von Google Fonts), Favicon – als Inline-`<script>`/`<style>` bzw. `data:`-URIs.
- Entfernt: `preconnect`-Hinweise, `<noscript>`-Fallbacks und das Angular-Skript zum asynchronen Laden der Styles.
- Die Datei funktioniert ohne Netzwerk und per `file://`. Beim Bauen ist Netzzugriff nötig (Schriften); schlägt ein Abruf fehl, bricht das Skript mit Fehler ab.

### REQ-009 File System Access API mit Fallback
- **Mit API-Unterstützung** (Chromium-Browser: Chrome, Edge):
  - „Öffnen“ nutzt den Datei-Dialog der API; die Skala bleibt mit der Datei verknüpft.
  - „Speichern“ schreibt direkt in die verknüpfte Datei (ohne Rückfrage). Ohne verknüpfte Datei (neue Skala) wie „Speichern unter…“.
  - „Speichern unter…“ (nur hier sichtbar) fragt immer nach einer Zieldatei (Vorschlag: aktueller Dateiname bzw. `<id>.json`) und verknüpft danach die neue Datei.
  - Abbrechen eines Dialogs ändert nichts (Skala bleibt ggf. ungespeichert, Verknüpfung bleibt).
  - Nach erfolgreichem Speichern kurze Bestätigung „Gespeichert: <Datei>“.
- **Ohne API-Unterstützung** (Firefox, Safari): „Öffnen“ über Datei-Auswahl, „Speichern“ als Download (bisheriges Verhalten).
- Fehler beim Öffnen/Schreiben werden als Meldung angezeigt.

### REQ-008 Mappings abhängig von der Methode
- Die Abschnitte „Mappings“ und „Sonst-Wert“ werden nur bei Methode `MAP` angezeigt (auch wenn `method` fehlt, Schema-Default `MAP`).
- Wechsel von `MAP` zu `SUM`/`MEAN`:
  - Sind Regeln oder ein Sonst-Wert vorhanden → Rückfrage. Bestätigen: `mappings` und `mappingsElse` werden entfernt. Abbrechen: Methode und Daten bleiben unverändert, die Auswahl springt zurück.
  - Keine Regeln/kein Sonst-Wert → Wechsel ohne Rückfrage, eine leere `mappings`-Liste wird entfernt.
- Wechsel zurück zu `MAP` → Abschnitte erscheinen wieder (leer).
- Geladene Datei mit `SUM`/`MEAN` **und** Mappings/Sonst-Wert: Abschnitte bleiben sichtbar (Daten werden nicht versteckt), dazu je eine Warnung „… wird bei Methode … nicht verwendet“.

### REQ-007 Inhaltsprüfung (Fehler)
- Zusätzlich zum Schema gelten als **Fehler** (Skala ungültig; Speichern bleibt möglich, DEC-009):
  - leere oder nur aus Leerzeichen bestehende `id`
  - leere Einträge in `sources`
  - leere Texte in allen mehrsprachigen Feldern (`name`, `description`, `label`/`description` von Mapping-Werten und `mappingsElse`)
  - doppelte Sprache innerhalb eines mehrsprachigen Feldes
- Eine neu angelegte Skala ist daher zunächst ungültig, bis ID, Name und Quelle ausgefüllt sind.
- Anzeige gemeinsam mit den Schemafehlern im Abschnitt „Prüfung“.

### REQ-006 Warnungen für Mapping-Parameter
- Zusätzlich zum Schema werden Mapping-Parameter je Bedingung geprüft. Ergebnis sind **Warnungen** (keine Fehler): Die Skala bleibt gültig, Speichern ist möglich.
- `MIN`, `MAX`, `LESS_THAN`, `MORE_THAN`: genau ein Parameter; dieser muss eine Zahl in JSON-Notation sein (Punkt als Dezimaltrennzeichen, z. B. `600`, `-1.5`; nicht `1,5`).
- `EQUALS`: mindestens ein Parameter, keiner leer; Werte dürfen nicht-numerisch sein. Bedeutung mehrerer Parameter: offen (Q-006).
- Anzeige: direkt unter der betroffenen Regel und gesammelt im Abschnitt „Prüfung“ (mit JSON-Pfad).
