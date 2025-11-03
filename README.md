# Bileam – Lehrling des Wortes

Ein minimalistisches Browser-Spiel im Stil eines 320×200-Pixel-Framebuffers (Mode 13h). Du steuerst den jungen Bileam und seinen Esel durch eine Side-Scroller-Erzählung, in der hebräische Zauberwörter gelernt, erinnert und angewendet werden. Jeder Frame wird in einem `Uint8Array`-Framebuffer beschrieben, der über eine 256-Farben-Palette gerendert wird – keine DOM-Widgets, keine Canvas-Filter: echte Retro-Pixel, nearest-neighbour skaliert.

## Leitidee

- **Reduktion:** 320×200 Pixel, feste Palette, ASCII-zu-Hebräisch-Eingabe, keine UI-Frameworks.
- **Retro Visuals:** Sprites sind handpikselig, Farben kommen aus der originalen VGA-Palette.
- **Erzählung:** Zehn Level (siehe `levels.md`) bilden eine Lernreise – jeder Zauber (אוֹר, מַיִם, קוֹל, …) wird gelernt, geübt und angewendet.
- **Begleiter:** Der Esel gibt Hinweise, kommentiert Fehler und setzt humorvolle Akzente.

## Architektur auf einen Blick

```
index.html           – Stellt Canvas bereit, lädt das modulare Spiel.
game.js              – Einstiegspunkt, importiert Helpers und Hauptspiel.
game.main.js         – Spiel-Loop, Level-Logik, Sprites, prompt-Bubbles.
game.helpers.js      – ASCII → Hebräisch Transliteration für Texteingaben.
graphics.js          – Paletten-Logik, Sprite-Utilities, Speech-Bubbles.
retroBlitter.js      – Framebuffer, Palette-Klasse, Blitting-Routinen.
vgaPalette.js        – 256-Eintragiges RGBA-Array aus VGA-Mode-13h.
levels.md            – Didaktische Struktur aller Level & Wortlisten.
```

### Framebuffer

- `RetroBuffer.pixels` ist ein `Uint8Array` (Breite × Höhe). Jeder Eintrag ist ein Paletten-Index.
- Die Palette (`RetroPalette.colors`) ist ein Array mit 256 RGBA-Vierern.
- `blitSprite` kopiert Sprite-Pixel (ebenfalls Index-basiert) direkt in den Buffer.

### Speech & Input

- `beginSpeech` / `renderSpeechBubble` zeichnen Text im Retro-Stil.
- `promptBubble(x1, y1, questText, x2, y2)` erzeugt zwei Bubbles: eine fixe Quest, eine dynamische Eingabe. Die Eingabe (ASCII) wird live nach Hebräisch transliteriert, aber `promptBubble` selbst validiert nicht – es gibt einfach den eingegebenen String zurück.
- Level-Skripte kümmern sich um Validierung, Hinweise, Flashbacks etc. (`promptBubble` liefert `Promise<string>`; Enter beendet, Escape bricht ab).

## Level-Scripting (kurzanleitung)

Eine Level-Datei implementiert `async function runLevelX(ctx)` (z. B. derzeit `runLevelOne` in `game.main.js`). Ein typisches Muster:

```js
await say(() => wizard.x - 16, () => wizard.y - 34, 'Intro-Text');
let solved = false;
while (!solved) {
  const input = await promptBubble(...);
  if (input.trim().toLowerCase() === 'aor') {
    solved = true;
  } else {
    await say(..., 'Hinweis');
  }
}
```

- Mit `await paletteFader.fadeToBase(ms)` oder `fadeToBlack` lassen sich harte Übergänge vermeiden.
- Hebräische Preview entsteht automatisch – zur Prüfung steht `transliterateToHebrew(ascii)` zur Verfügung.
- Für Folgelevel die Phasen-Regel aus `levels.md` beibehalten: `Review → Learn → Apply` und Fehlversuche zählen.

## Entwickeln & Testen

1. Repository mit einem lokalen Webserver starten (z. B. `npx http-server`).
2. `http://localhost:8080/index.html` im Browser öffnen.
3. Der erste Level ist implementiert: Tippe `aor`, um die Hütte zu erhellen. Fehler erzeugen Esel-Hinweise.
4. Weitere Levels gemäß `levels.md` hinzufügen (je Level eine async-Funktion, die der Reihe nach aufgerufen wird).

## Weitere Arbeiten

- Hebräische Glyphen-Satz erweitern (momentan nur אותיות für Level 1–2).
- Level 2–10 skripten (inkl. Fallback-Logik, Cutscenes, Gameplay-Trigger).
- Spielfortschritt speichern (z. B. mittels `localStorage`).

Viel Spaß beim Basteln und „Schalom“ im Retro-Pixellicht!
