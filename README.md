# Bileam – Lehrling des Wortes

Bileam ist ein 320×200-Pixel-Browserspiel, das sich wie ein alter Mode-13h-DOS-Titel anfühlt. Jeder Frame entsteht in einem `Uint8Array`-Framebuffer, jeder Farbwert ist ein Palettenindex der originalen VGA-256-Farben. Die Szene wird per nearest-neighbour auf den Bildschirm skaliert – keine DOM-Widgets, keine Shader, nur harte Pixel.

## Idee und Stimmung

- **Minimalismus:** Canvas als einziger Ausgabekanal, Sprite-Daten aus ASCII-Kunst, Musiklosigkeit wird durch Text und Farben ersetzt.
- **Story:** Der junge Bileam und sein Esel reisen durch eine veraltete Science-Fiction-Welt, lernen zehn hebräische Zauberworte (siehe `levels.md`) und kämpfen mit der Macht gesprochener Worte.
- **Retro-Mechanik:** Spieler tippen Phonetik (z. B. `aor`) und sehen live die hebräische Umsetzung (`אור`). Fehler rufen Hinweise oder Flashbacks hervor.

## Projektstruktur

```
index.html        # Minimaler Host, lädt ES-Module
retroBlitter.js   # Framebuffer, Palette, Sprite-Blitting
vgaPalette.js     # 256er Palette (RGBA) aus VGA Mode 13h
graphics.js       # Zeichenfunktionen, Speech-Bubbles, Text-Renderer
game.helpers.js   # ASCII→Hebraeer-Transliteration
game.main.js      # Spiel-Loop, Levelskripte, promptBubble
levels.md         # Didaktische Struktur und Wortliste
README.md         # Dieses Dokument
```

### Framebuffer-Pipeline

1. `RetroBuffer.pixels` ist ein `Uint8Array` (320×200). Jeder Wert ist ein Palettenindex.
2. `RetroPalette.colors` hält 256 RGBA-Vierereintraege.
3. `blitSprite` kopiert Sprite-Indices direkt in den Framebuffer.
4. `buffer.toImageData(ctx)` baut ein `ImageData` und `ctx.putImageData` zeichnet es ohne zusätzliche Filter.

## Eingabe und Sprechblasen

- `promptBubble(xQuest, yQuest, questText, xInput, yInput)` öffnet zwei Bubbles: eine mit Questtext (links nach rechts), eine live mit hebräischer Vorschau deiner Eingabe (rechts nach links). Die Funktion wartet auf RETURN und liefert den eingegebenen ASCII-String zurück.
- Der Cursor blinkt als `|`, auch wenn noch kein Zeichen getippt wurde.
- Die Hebraeer-Transliteration folgt den Regeln in `levels.md` (Alef-Carrier, Endformen). Beispiel: `aor` → `אור`, `mayim` → `מים`.
- Levelskripte prüfen selbst, ob ein Wort korrekt war, und rufen bei Bedarf `await say(...)` für Hinweise.

## Levelskripting

```js
async function runLevelOne() {
  await say(() => wizard.x - 16, () => wizard.y - 34, 'Es ist finster in dieser Huette...');
  let solved = false;
  while (!solved) {
    const input = await promptBubble(
      () => wizard.x - 30,
      () => wizard.y - 55,
      'Sprich das Wort אור (aor)',
      () => wizard.x - 20,
      () => wizard.y - 20
    );
    if (input.trim().toLowerCase() === 'aor') {
      solved = true;
      await say(() => wizard.x - 18, () => wizard.y - 42, 'אור (aor)!');
    } else {
      await say(() => donkey.x - 18, () => donkey.y - 38, 'Esel: Vielleicht faengt es mit Alef an.');
    }
  }
}
```

- Jeder Level ist eine async Funktion (`runLevelX`) und ruft `promptBubble` / `say` / `paletteFader` nach Bedarf.
- Typischer Aufbau: `Review → Learn → Apply`, wie in `levels.md` beschrieben.
- Fehlerlogik (Hinweise, Flashbacks, Meditation) wird im Levelskript abgebildet (z. B. `let attempts = 0;` und unterschiedliche `say`-Zeilen).

## Ausprobieren

1. Repository klonen.
2. Einen lokalen Webserver starten (`npx http-server` oder `python -m http.server`).
3. `http://localhost:8080/index.html` öffnen.
4. Level 1 testen: Questtext untersuchen, `aor` eingeben, Hinweisstrom ausprobieren.

## Ausblick

- Weitere Worte (`mayim`, `qol`, `xayim`, `aw`, `dabar`, `emet`, `malak`, `arur`, `beraka`) wie in `levels.md` skripten.
- Hebraeer Glyphentruppe erweitern (`levels.md` listet alle Zielwoerter).
- Speicherstand (z. B. `localStorage`) und Optionsmenue fuer erneute Uebungen.

Viel Spass beim Tuefteln - und vergiss nicht: אור (aor) ist erst der Anfang.
