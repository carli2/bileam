# Zwischenboss – Der Steinwächter

---

## ⚖️ Konzept der Element-Wechselwirkungen

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
  - **Spieler:** Links unten
  - **Gegner:** Rechts oben
- die Sprechblasen erscheinen jeweils über der Spielerfigur und der Gegner-Figur:
  - Beispiel:  
    > **Bileam:** „*ash (אֵשׁ)* – der Stein brennt!“  
    > **Golem:** „*mayim (מַיִם)* – der Golem löscht das Feuer.“  
- **Audiofeedback:** jedes Wort hat einen eigenen Klang; Treffer lösen harmonische oder dissonante Akkorde aus.  

---

## 🧩 Rundenlogik (Gameplay-Flow)

  1. Angriff (state="start") (Spieler: Eingabe eines Wortes, Computer: Zufällige Auswahl eines Wortes und Sprechblase) -> man betritt die State Machine
  2. Gegenangriff -> der Gegenüber wählt ein Wort (Spieler: Eingabe eines Wortes, Computer: Zufällige Auswahl eines Wortes und Sprechblase)
  3. Ist der Gegenangriff in der State Machine enthalten (also hat eine Transition): neuen State setzen, der Gegenüber ist wieder dran, es geht mit 2. weiter
  3. Ist der Gegenangriff nicht als Transition im aktuellen State enthalten, wird der Schaden angerechnet und der success-Text ausgegeben, danach ist der Verlierer am Zug und beginnt wieder mit 1.
  4. Spielende ist erreicht, wenn ein Spieler kein Leben mehr hat
 
Aufbau des JSON:
{
	"start": [STATE_DESCRIPTION],
	"on_fire: [STATE_DESCRIPTION],
	"drowning: [STATE_DESCRIPTION],
	...
}

Aufbau einer STATE_DESCRIPTION Beispiel state "start":
{
	"intro_player": "Du darfst einen Angriff machen:",
	"intro_computer": "Der Golem greift an",
	"transitions": {
		"אש": "on_fire",
		"מים": "drowning"
	},
	"damage": 0,
	"failure_player": "%s - Dein Wort verweht im Wind. Dein Zauber hat nichts bewirkt",
	"failure_computer": "%s - Der Golem spricht den Spruch, aber nichts passiert"
}

Aufbau einer STATE_DESCRIPTION Beispiel state "on_fire":
{
	"intro_player": "Du brennst lichterloh",
	"intro_computer": "Der Golem brennt",
	"transitions": {
		"קול": "on_fire",
		"מים": "start"
	},
	"damage": 25,
	"failure_player": "%s - Dein Wort verweht im Wind. Du verbrennst.",
	"failure_computer": "%s - Der Golem spricht den Spruch, aber nichts passiert. Er verbrennt jämmerlich"
}

der Ablauf ist immer gleich:
zuerst state="start" setzen, danach intro_X ausgeben, danach user prompten oder Golem: Reaktion würfeln + Anzeigen welches Wort er gewählt hat, danach nachfolgezustand setzen, dann wechseln die Rollen des Angreifers/Verteidigers. Wenn die Transition ungültig war, wird damage angewendet und failure_X ausgegeben

---


## 🌿 Nachbesinnung

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

## 🧙‍♀️ Pädagogischer Kommentar

Dieses Zwischenlevel markiert den Übergang von **passivem Lernen** zu **aktivem Anwenden**.
Der Spieler erlebt erstmals **Kausalität** – Sprache verändert nicht nur Objekte, sondern reagiert auf Gegenelemente.
Das System ist absichtlich nicht binär (kein „x schlägt y“), sondern relational:
- Elemente können sich gegenseitig neutralisieren, verstärken oder gegenseitig vernichten.
- Lernen erfolgt durch Erfahrung, nicht durch Erklärung.

---

**Ende Level 5½ – Der Golem der Worte**


