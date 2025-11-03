# Level 5½ – Der Golem der Worte

---

## ⚖️ Tabelle der Element-Wechselwirkungen

Die Worte interagieren wie Kräfte einer lebendigen Sprache.  
Manche verstärken sich, andere löschen sich aus – manche bilden neue, unvorhersehbare Wirkungen.  
Der Spieler entdeckt diese Kombinationen schrittweise; sie bilden die Grundlage für alle späteren Kämpfe (besonders den Endkampf gegen Balak).

| Wort / Element | Bedeutung | Reaktion mit anderen | Wirkung / Ergebnis |
|-----------------|------------|----------------------|--------------------|
| **אוֹר – aor (Licht)** | Erkenntnis, Offenbarung | <ul><li>+ **מַיִם – mayim (Wasser)** → Nebel / Regenbogen → Heilung, Beruhigung</li><li>+ **קוֹל – qol (Stimme)** → Klangblitz → Betäubung / Schock</li><li>+ **חַיִּים – xayim (Leben)** → Photosynthese → Verstärkung aller Lebewesen</li><li>+ **אֵשׁ – ash (Feuer)** → Blendfeuer → Unkontrollierte Explosion</li></ul> | Erhellt, aktiviert, kann aber überfordern |
| **מַיִם – mayim (Wasser)** | Reinigung, Wandel | <ul><li>+ **אוֹר** → Regenbogen / Reinigung</li><li>+ **אֵשׁ** → Dampf / Neutralisierung</li><li>+ **חַיִּים** → Wachstum / Heilung</li><li>+ **קוֹל** → Wellen / Schallverstärkung</li></ul> | Löscht Feuer, nährt Leben, schwächt Metallwesen |
| **קוֹל – qol (Stimme)** | Klang, Kommunikation | <ul><li>+ **אוֹר** → Klangblitz</li><li>+ **אֵשׁ** → Donner / Schockwelle</li><li>+ **מַיִם** → Schallwellen im Wasser (Echoangriff)</li></ul> | Wirkt auf Distanz, stört Gegner, kann Emotion beeinflussen |
| **חַיִּים – xayim (Leben/Brot)** | Wachstum, Nahrung | <ul><li>+ **מַיִם** → Heilende Welle</li><li>+ **אֵשׁ** → Feuerdämon (Zerstörung beider Seiten)</li><li>+ **אוֹר** → Photosynthese (Buff)</li></ul> | Heilt oder erschafft, kann aber ausufern |
| **אֵשׁ – ash (Feuer)** | Energie, Zerstörung | <ul><li>+ **מַיִם** → Dampf / Auflösung</li><li>+ **אוֹר** → Explosion</li><li>+ **חַיִּים** → Feuerwesen (chaotisch)</li><li>+ **קוֹל** → Donnerstoß</li></ul> | Reinigt oder verbrennt – gefährlich doppeldeutig |

> **Didaktische Note:** Der Spieler soll verstehen, dass kein Element „gut“ oder „böse“ ist – die Bedeutung entsteht durch Kombination und Zeitpunkt der Anwendung.

---

## 🧙‍♂️ Szene & Ambiente

**Ort:** Eine Felsschlucht zwischen der Schmiede (Level 5) und der Stadt (Level 6).  
**Umgebung:**
- Der Boden ist aus dunklem Basalt, durchzogen von leuchtenden Linien.  
- Am Horizont flackert rotes Licht – das Nachglühen der Schmiede.  
- Nebel zieht aus Felsspalten.  
- Aus dem Boden erhebt sich ein **Steingolem**, etwa doppelt so groß wie Bileam.  
  In seiner Brust glimmt das Zeichen **קוֹל** (qol) – die Stimme.  

**Musik:** rhythmisches Trommeln, das sich mit einem Herzschlag mischt.

---

## ⚔️ Phase I – Der Golem erwacht

**Sprechblasen / Dialog:**

- **Erzähler:** „Aus dem Staub der Schlucht formt sich ein Leib aus Stein – schwer, uralt, stumm.“  
- **Esel:** „Ein Wächter. Er prüft, ob du verstanden hast, was Worte bewirken können.“  
- **Bileam:** „Wie besiegt man einen Stein?“  
- **Esel:** „Mit Worten, nicht mit Fäusten. Aber merke: Worte kämpfen nicht – sie *wirken*.“  

> Danach wechselt das Spiel in den **Wortgefechtsmodus**.

---

## 🪶 Phase II – Tutorial-Kampf (Wortgefecht-Regeln)

Während des ersten Rundenkampfs erklärt der Esel Schritt für Schritt die Regeln.  
Die Kamera zoomt nah heran, und jede Eingabe wird mit einer visuellen Rückmeldung gezeigt.

**Esel-Erklärungen (in-game):**
1. „Jedes Wort hat eine Wirkung. Manche löschen sich, manche stärken sich.“  
2. „Wenn du Licht rufst, weicht die Dunkelheit – aber Stein bleibt Stein.“  
3. „Wasser macht weich, aber Feuer bricht den Willen.“  
4. „Und wenn du zwei Worte kombinierst, entstehen neue Kräfte – doch sei vorsichtig!“

**Interface:**

- **Zwei Lebensbalken:**  
  - **Grün:** Lebensenergie (hebräisch: *חַיִּים – xayim*).  
  - **Rot:** Zerstörung / Überhitzung.  
- Unter den Balken erscheinen *Sprechblasen*, die die gesprochenen Worte anzeigen:
  - Beispiel:  
    > **Bileam:** „*ash (אֵשׁ)* – der Stein brennt!“  
    > **Golem:** „*mayim (מַיִם)* – der Golem löscht das Feuer.“  
- **Audiofeedback:** jedes Wort hat einen eigenen Klang; Treffer lösen harmonische oder dissonante Akkorde aus.  
- **Zugreihenfolge:**  
  1. Spieler → Angriff  
  2. Gegner → Verteidigung  
  3. Ergebnisberechnung → Balkenänderung  
  4. ggf. Wechsel der Zugreihenfolge (abhängig von Effekt)  

---

## 🧩 Rundenlogik (Gameplay-Flow)

1. **Zugbeginn**  
   - Aktiver Charakter (Spieler oder Gegner) erhält die Eingabeaufforderung.  
   - Eingabefeld zeigt:  
     ```
     > Sprich dein Wort:
     ```
   - Spieler tippt z. B. `ash`.

2. **Wort wird gesprochen**  
   - Animation: hebräische Buchstaben erscheinen, Partikel reagieren.  
   - Sound: Element-spezifischer Klang.  

3. **Verteidigungsphase**  
   - Gegner erhält Chance zur Reaktion.  
   - Beispiel:  
     ```
     Der Golem murmelt: "mayim (מַיִם)" – der Stein dampft.
     ```
   - HUD zeigt Textblase auf der Gegenseite.

4. **Effektberechnung**  
   - Kombination aus Angriff + Verteidigung wird gegen die Tabelle (siehe unten) geprüft.  
   - Lebensbalken beider Parteien passen sich dynamisch an.  
   - Beispiel:  
     - Angriff: `ash`  
     - Verteidigung: `mayim`  
     → **Dampf neutralisiert Feuer** → beide verlieren 10 % Energie.

5. **Zugwechsel / Folgephase**  
   - Wenn ein Spieler *kritisch trifft* (Kombination vorteilhaft), darf er **noch einmal** handeln.  
   - Wenn beide neutralisieren, wechselt der Zug.  
   - Wenn einer heilt, darf der andere sofort reagieren.

6. **Kampfende**  
   - Sobald ein Lebensbalken ≤ 0 %,  
     > *Erzähler:* „Das Wort verstummt.“  
   - Bei Sieg gegen Golem: dieser zerfällt in Staub → Ende Kampfphase.

---

## ⚔️ Wortkombinations-Tabelle (Angriff & Verteidigung)

| Angriff → / Verteidigung ↓ | **aor (Licht)** | **mayim (Wasser)** | **qol (Stimme)** | **xayim (Leben)** | **ash (Feuer)** |
|-----------------------------|-----------------|---------------------|------------------|--------------------|-----------------|
| **aor (Licht)** | ⚖️ neutral (gleiche Stärke) | 🌈 *Regenbogenheilung* → Angreifer heilt leicht | ⚡ *Klangblitz* → Gegner verliert 20 % | ☀️ *Erweckung* → beide +10 % | 💥 *Explosion* → beide -30 % |
| **mayim (Wasser)** | 🌫️ *Verdunklung* → Gegner verliert 10 % | ⚖️ neutral | 💧 *Resonanzwelle* → beide -10 % | 🌾 *Heilung* → Angreifer +20 % | 💨 *Dampfstoß* → neutralisiert, beide -5 % |
| **qol (Stimme)** | ⚡ *Schalllicht* → Gegner -20 % | 🌊 *Echo im Wasser* → leichter Schaden an Gegner | ⚖️ neutral | 🕊️ *Gesang des Lebens* → heilt Angreifer +10 % | 🔥 *Donnerschlag* → Gegner -25 %, Selbstschaden -10 % |
| **xayim (Leben)** | 🌻 *Photosynthese* → +15 % Heilung | 🌿 *Wachstum* → +20 % Heilung | 💫 *Lebenston* → heilt +10 %, Gegner -10 % | ⚖️ neutral | 👹 *Feuerdämon* → beiderseitiger Schaden -40 % |
| **ash (Feuer)** | 💥 *Explosion* → beide -30 % | 💧 *Wasser löscht Feuer* → Angreifer -25 % | 🔊 *Feuerdröhnen* → Gegner -20 % | 👹 *Feuerdämon* → beide -40 % | ⚖️ neutral |

---

## 🧙‍♀️ Beispielrunde

**Spieler (Bileam) startet:**
> `ash (אֵשׁ)` – „Feuer, erwache!“

**Golem reagiert:**
> „mayim (מַיִם) – der Golem löscht das Feuer.“

**Ergebnis:**
- Feuer wird neutralisiert.  
- Golem +5 % Leben (wegen Wasserelement).  
- Spieler -15 % Energie (verbrannte Hände).  
- Zug wechselt zum Golem.

**Golem-Aktion:**
> „xayim (חַיִּים) – der Golem wird geheilt.“

*(HUD zeigt: Golem heilt um 20 %, danach ist der Spieler wieder am Zug.)*

---

## ❤️‍🔥 Spezialeffekte & Statusveränderungen

| Effekt | Auslöser | Wirkung |
|---------|-----------|----------|
| **Heilung** | Kombination mit *xayim* oder *mayim* | +10 – 25 % Lebenspunkte |
| **Selbstschaden** | *ash* mit *xayim* oder *aor* | -20 – 40 % |
| **Betäubung** | *aor* + *qol* | Gegner verliert nächsten Zug |
| **Überhitzung** | wiederholte Nutzung von *ash* | 10 % Selbstschaden pro Folgezauber |
| **Reinigung** | *mayim* + *aor* | Entfernt negative Statuseffekte |
| **Echoeffekt** | *qol* | Wenn nach Wasser eingesetzt, doppelter Schaden |

---

## 🪶 Esel-Erklärungen (Tutorialdialoge während des Kampfes)

1. „Jeder Zauber trägt Gewicht – du kanns


wenn man verliert, startet das Zwischenlevel von vorn


---

## 🪨 Phase III – Kampf gegen den Golem

**Rundenmechanik (beispielhaft):**

| Runde | Golem-Aktion | Spieler-Wirkung / Reaktion | Ergebnis |
|--------|---------------|-----------------------------|-----------|
| 1 | Golem erzeugt Steinschild | Spieler kann `aor` (Licht) oder `qol` (Stimme) einsetzen | Licht → Blendung; Stimme → Risse im Stein |
| 2 | Golem schlägt mit Faust | Spieler nutzt `mayim` → Boden wird glatt, Angriff verfehlt | Golem fällt, erhitzt sich |
| 3 | Golem absorbiert Umgebung | Spieler experimentiert (z. B. `ash` + `xayim`) | Fehlkombination → kurzer Feuerdämon entsteht, beide Seiten nehmen Schaden |
| 4 | Esel ruft: „Nutze, was du gelernt hast – kombiniere mit Bedacht!“ | Spieler kann `aor` + `mayim` → Regenbogen-Heilung oder `mayim` + `qol` → Wasserstoß | Heilung / Betäubung |
| 5 | Golem schwankt – Brustzeichen flackert | Spieler nutzt `xayim` → Moos wächst über den Golem, er erstarrt friedlich | Sieg |

**Ergebnisbeschreibung:**
- ✅ *Erfolg:* Der Golem zerfällt nicht, sondern verwandelt sich in Erde und Pflanzen.
  Seine Stimme hallt als leises „Danke“ in der Schlucht.
- ⚠️ *Teil-Erfolg:* Der Golem bricht auseinander, aber der Boden wird vernarbt – Bileam erhält eine Warnung über unkontrollierte Magie.
- ❌ *Scheitern:* Falsche Kombination (z. B. `ash` allein) entzündet die Höhle → Rückblende → Neustart.

---

## 🌿 Phase IV – Nachbesinnung

**Dialog nach dem Kampf:**
- **Bileam:** „Ich habe nicht gekämpft, ich habe verstanden.“
- **Esel:** „So ist’s richtig. Worte sind Werkzeuge, keine Waffen.“
- **Erzähler:** „Der Golem sank zurück in die Erde.
  Doch in seiner Brust blieb ein leuchtendes Zeichen –
  Erinnerung an die erste Lektion des Gleichgewichts.“

**Balak (Echo, kaum hörbar):**
> „Mein Schüler wird mächtig. Bald wird er mir dienen…“

---

## 🧩 Didaktische Struktur

| Phase | Lernziel | Prinzip | Feedback |
|--------|-----------|----------|-----------|
| I – Einführung | Erkennen von Ursache-Wirkung zwischen Elementen | Entdeckendes Lernen | Reaktive Umgebung |
| II – Erklärung | Verständnis der Regelmechanik | Verbales Lernen durch Mentorfigur | Dialogische Instruktion |
| III – Anwendung | Experimentieren im Wortgefecht | Exploratives Lernen | Spielerische Konsequenzen |
| IV – Reflexion | Einordnung von Macht und Verantwortung | Transferlernen | Erzählerische Belohnung |

**Merksatz des Esels:**
> „Stein fürchtet Wasser, Wasser fürchtet Feuer,
> Feuer fürchtet Leben, und Leben – fürchtet sich nur vor der Stille.“

---

## 🔠 Technische Hinweise (für Engine)

- **Neue Variable:** `battle_mode = true`
- **Eingaben erkannt:** `aor`, `mayim`, `qol`, `xayim`, `ash`
- **Kombinationserkennung:** Wörter dürfen in einem Zug kombiniert werden (`aor mayim` etc.)
- **Systemlogik:**
  - Elemente erhalten numerische Wechselwirkung (0 = neutral, + = Vorteil, - = Nachteil).
  - Bei Kombination: additive Werte + Sonderereignis.
- **Partikel-Design:**
  - `aor` → Lichtstrahl
  - `mayim` → Wasserwelle
  - `qol` → Schockring
  - `xayim` → Moos, Pflanzen, Blätter
  - `ash` → Funken, Rauch
- **Audio:**
  - Jeder Treffer moduliert Tonhöhe des Golem-Brummens.
  - Bei Sieg: harmonische Auflösung in F-Dur.
- **Speicherpunkt:** nach Golem-Sieg (`progress.level = 5.5 complete`)

---

## 🧙‍♀️ Pädagogischer Kommentar

Dieses Zwischenlevel markiert den Übergang von **passivem Lernen** zu **aktivem Anwenden**.
Der Spieler erlebt erstmals **Kausalität** – Sprache verändert nicht nur Objekte, sondern reagiert auf Gegenelemente.
Das System ist absichtlich nicht binär (kein „x schlägt y“), sondern relational:
- Elemente können sich gegenseitig neutralisieren, verstärken oder gegenseitig vernichten.
- Lernen erfolgt durch Erfahrung, nicht durch Erklärung.

---

**Ende Level 5½ – Der Golem der Worte**


