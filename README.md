# iqb-scale-editor

Stand-alone-Editor für Skalen nach den Spezifikationen
[acp-scale-base@0.4](https://iqb-specifications.github.io/acp-scale-base/) (Basis-Skalen) und
[acp-scale-derived@0.4](https://iqb-specifications.github.io/acp-scale-derived/) (abgeleitete Skalen),
einzeln oder innerhalb eines [acp-Index](https://iqb-specifications.github.io/acp-index/).

## Entwicklung

```bash
npm install
npm start          # Dev-Server auf http://localhost:4200
npm test           # Unit-Tests (Vitest)
npm run build      # Produktions-Build nach dist/
npm run build:single  # Build + alles in eine HTML-Datei: dist/iqb-scale-editor/iqb-scale-editor.html
```

## Einzelne HTML-Datei

`npm run build:single` erzeugt `dist/iqb-scale-editor/iqb-scale-editor.html`, in die JavaScript, CSS,
Schriften (Roboto, Material Symbols – werden beim Build von Google Fonts geladen) und Favicon eingebettet sind.
Die Datei läuft offline und direkt per Doppelklick (`file://`). Das Skript `scripts/inline-html.mjs`
kann auch einzeln aufgerufen werden: `node scripts/inline-html.mjs [browser-Verzeichnis] [Zieldatei]`.

## Dokumentation

- [Anforderungen](docs/requirements.md)
- [Testfälle](docs/test-cases.md)
- [Entscheidungen & offene Fragen](docs/decisions.md)
