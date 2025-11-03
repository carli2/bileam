# Level 2 – מַיִם (*mayim*) – Das Wasser des Lebens

---

## 🏞️ Szene & Ambiente  

**Ort:** Ein schmaler Pfad führt aus der Hütte zu einem breiten Flussbett.  
**Umgebung:**  
- Nebel liegt über dem Wasser; vereinzelte Lichtstrahlen brechen sich in den Tropfen.  
- Der Boden ist feucht, in der Ferne glitzern alte Steine – die Überreste einer Brücke.  
- Auf der linken Seite: Schilf, das sich im Wind wiegt.  
- Rechts: eine halb versunkene Statue mit einer Inschrift in fremden Zeichen.  
- Im Hintergrund hört man das stetige Rauschen des Wassers, das wie ein Atem wirkt.  

> **Ziel:** Spieler wiederholt das Wort **אוֹר** (*aor*, Licht) und lernt das neue Wort **מַיִם** (*mayim*, Wasser).  
> Dabei erlebt er, dass Wörter nicht nur Licht, sondern auch Bewegung und Form hervorrufen können.  

---

## 🔁 Phase I – Erinnerung (Rückgriff auf *אוֹר*)  

**Sprechblasen / Dialog:**  
- **Erzähler:** „Das Licht aus der Hütte folgt dir – doch vor dir liegt Dunkel im Nebel.“  
- **Esel:** „Der Nebel verschluckt das Licht. Vielleicht musst du es rufen, so wie vorhin.“  
- **Bileam:** „Ich erinnere mich … das Wort *AO R*.“  

**Eingabeaufforderung:**  
> *Type:* `aor` → **אוֹר**

**Reaktion:**  
- ✅ *Erfolg:* Das Licht formt eine schimmernde Brücke über den ersten Meter Wasser.  
- ⚠️ *Fehler:* Esel – „Fast – denk daran, das O lang zu ziehen. Aaaor.“  
- ❌ *Mehrfach falsch:* Kurze Rückblende – Bileam steht wieder in der Hütte, wiederholt das Wort, bis die Brücke glüht.  

---

## 🌊 Phase II – Erkenntnis (Neues Wort lernen)  

**Sprechblasen / Dialog:**  
- **Bileam:** „Das Licht reicht nicht weit genug. Der Fluss bleibt wild.“  
- **Esel:** „Dann brauchst du ein neues Wort, Meister. *MA-YIM* – es bedeutet *Wasser*.“  
- **Bileam:** „*Ma… yim…* Wasser.“  
- **Esel:** „Sprich es, und der Fluss hört auf dich.“  

**Eingabeaufforderung:**  
> *Type:* `mayim` → **מַיִם**

**Feedback-Zyklus:**  

| Zustand | Beschreibung |
|----------|---------------|
| ✅ Richtig | Das Wasser beruhigt sich, Nebel hebt sich. Planken steigen aus der Tiefe und fügen sich zur Brücke. |
| ⚠️ Falsch (1×) | **Esel:** „Das *Y* ist wie ein weiches *i* in der Mitte – *ma-yim!*“ |
| ⚠️ Falsch (2×) | **Erzähler:** „Der Fluss bleibt taub. Versuche, dich an den Klang zu erinnern.“ (Buchstaben schimmern kurz über dem Wasser.) |
| ❌ Dreimal falsch | Option: „Zurück zum Ufer“ → Esel wiederholt: „Sprich *MA-YIM* mit dem Atem des Flusses.“ |

---

## 🚶‍♂️ Phase III – Anwendung (Transfer und Bewegung)  

**Szene-Interaktion:**  
- Nach erfolgreicher Eingabe kann der Spieler die Brücke betreten.  
- Beim Gehen schwanken die Planken leicht – jede Bewegung sendet kleine Lichtwellen über die Wasseroberfläche.  
- Ein Abschnitt bricht ein – der Spieler muss das Wort erneut sprechen, um die Lücke zu schließen.  

**Eingabeaufforderung:**  
> *Type:* `mayim` → **מַיִם**  

**Resultat:**  
- ✅ Erfolg: Eine transparente Welle hebt Bileam sanft an und trägt ihn ans andere Ufer.  
- 🌫️ Am Ufer erscheint ein leuchtendes Symbol im Boden – ein Kreis mit Wellenlinien.  
- Der Esel tritt hinzu und schnaubt zufrieden.  

**Dialogabschluss:**  
- **Esel:** „Gut gemacht, Meister. Worte fließen – und wer sie kennt, kann Ströme lenken.“  
- **Bileam:** „Dann ist Sprache wirklich Kraft?“  
- **Esel:** „Vielleicht. Aber vergiss nicht: Zu viel Fluss – und du wirst davongetragen.“  

**Fade Out:** Kamera folgt dem Wasserlauf in die Ferne → nächstes Level lädt.  

---

## 🧩 Didaktische Struktur  

| Phase | Lernziel | Prinzip | Feedback |
|--------|-----------|----------|-----------|
| I – Erinnerung | *AO R* wiederholen, Abruftraining | Wiederholung – stärkt Wortgedächtnis | Sofort-Feedback durch Lichtveränderung |
| II – Erkenntnis | Neues Wort *MAYIM* lernen (Form ↔ Bedeutung) | Multisensorisches Lernen (Sehen, Hören, Tippen) | Dialogische Begleitung + Korrekturhinweise |
| III – Anwendung | Wort in Interaktion anwenden (Brücke reparieren) | Transfer + aktive Problem Lösung | Umwelt reagiert dynamisch auf korrekte Eingabe |

**Merksatz des Esels:**  
> „Licht zeigt den Weg, Wasser trägt dich weiter – doch beides fließt nur, wenn du das Wort findest.“

---

## 🔠 Technische Hinweise (für Engine)  

- **Input:** erkennt `aor` und `mayim`, case-insensitive.  
- **Sound:**  
  - `aor` → aufsteigende Glissando-Harfe + Lichtzischen  
  - `mayim` → tiefes Wasser-Pulsieren + Rauschen  
- **Partikel:**  
  - Lichtpartikel bei aor, Wassertropfen bei mayim  
- **Physik:** temporäre Brückenobjekte auf dem Fluss; bei Fehleingabe sinken sie ab.  
- **Speicherpunkt:** nach Erreichen des Ufers (`progress.level = 2 complete`)

---

**Ende Level 2 – מַיִם (*mayim*) – Das Wasser des Lebens**

