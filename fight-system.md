Das Kampfsystem funktioniert wie folgt:

Die Spieler sind abwechelnd dran:
Runde 1 - Spieler beginnt
Runde 2 - Computer beginnt
Runde 3 - Spieler beginnt
Runde 4 - Computer beginnt
usw

Ablauf einer Runde:
Es wird so lange abwechselnd geantwortet, bis einer einen Fehler macht.

Benötigte Variablen:
 - turn (0=player, 1=comptuer)
 - state (ist am Anfang jeder Runde "start")
 - enemystrength (level 5.5 wird mit enemystrength 0.5 aufgerufen, level 10.5 wird mit enemystrength 0.8 aufgerufen)

Wenn Spieler dran ist:
 - prompt anzeigen
 - statemachine[state].transition[word] ablaufen lassen
 - neuen state setzen
 - turn := 1

Wenn Comptuer dran ist:
 - Wort erwürfeln (wenn random() < enemystrength: ein zufälliges wort aus Object.keys(statemachine[state].transition), sonst: ein zufälliges wort aus Object.keys(statemachine["start"].transition))
 - statemachine[state].transition[word] ablaufen lassen
 - neuen state setzen
 - turn := 0

Wenn ein ungültiges Wort gesagt/erwürfelt wurde:
 - Schadenstexte abspielen
 - Schaden anrechnen
 - Runde beenden - nächste Runde startet
