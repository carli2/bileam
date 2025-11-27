/**
 * Spell duel rules – re-tuned for Reaktionskampf:
 * - Jeder Zustand telegrafiert klar, welche Konterfenster offen sind.
 * - dabar/emet bleiben Siegel, sitzen aber auf Treffer-Fenstern statt Ritualketten.
 * - Keine Zwei-Schritt-Loops; Fluss bleibt gerichtet, damit Reaktionen zählen.
 */
export const SPELL_DUEL_MACHINE = {
  meta: {
    enemyAccuracy: 0.7,
  },
  obedienceEcho: {
    intro_player: {
      speaker: 'narrator',
      text: 'Ein Befehl peitscht durch die Schlucht; jedes Echo drückt dich nach vorn.',
    },
    intro_enemy: {
      text: 'Gehorche. Ich stopfe dir jeden Spalt mit meinem Wort.',
    },
    prompt_player: 'Konter das Echo, bevor es zuschnappt.',
    damage: 55,
    failure_player: '%s - du gehorchst, der Hall schnürt dich.',
    failure_computer: '%s - der Hall verheddert mich selbst.',
    transitions: {
      'קול': {
        next: 'obedienceBind',
        text_player: 'קול! Ich drehe den Hall und schicke ihn zurück.',
        text_enemy: 'קול! Ich vervielfache den Ruf.',
      },
      'מים': {
        next: 'flooded',
        text_player: 'מים! Ich spüle den Befehl fort.',
        text_enemy: 'מים! Ich erzeuge einen Strom aus Stimmen.',
      },
      'אש': {
        next: 'burning',
        text_player: 'אש! Ich verbrenne den Aufruf, bis nur Hitze bleibt.',
        text_enemy: 'אש! Ich lasse Drohung in Flammen springen.',
      },
    },
  },
  obedienceBind: {
    intro_player: {
      speaker: 'narrator',
      text: 'Riemen aus Klang legen sich um deine Brust. Jetzt zählt nur der Konter.',
    },
    intro_enemy: {
      text: 'Meine Worte wickeln sich um dich. Du wirst gehorchen.',
    },
    prompt_player: 'Welches Wort sprengt den Zwang?',
    damage: 58,
    failure_player: '%s - du gehorchst blind und deine Kraft versiegt.',
    failure_computer: '%s - ich gehorche blind und verliere die Kontrolle.',
    failure_player_damageText: 'Bileam erleidet 58 Schaden, weil die Gehorsamsriemen ihn würgen.',
    failure_computer_damageText: 'Balak erleidet 58 Schaden, der Gehorsam zerreißt seine Brust.',
    transitions: {
      'לא': {
        next: 'negation',
        text_player: 'לא! Ich stoße den Befehl zurück, ehe er greift.',
        text_enemy: 'לא! Ich wuchte dich aus meinem Kreis.',
        damage: 48,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 48 Schaden, weil dein Nein die Fesseln sprengt.',
      },
      'אש': {
        next: 'burning',
        text_player: 'אש! Ich lasse die Riemen aufglühen, bis sie reißen.',
        text_enemy: 'אש! Ich erhitze die Fesseln gegen dich.',
      },
      'מים': {
        next: 'steamChamber',
        text_player: 'מים! Ich mache aus dem Zwang Dampf, der verfliegt.',
        text_enemy: 'מים! Ich halte dich unter meiner Welle.',
      },
      'קול': {
        next: 'resonantTrap',
        text_player: 'קול! Ich schiebe den Befehl in einen eigenen Takt.',
        text_enemy: 'קול! Mein Echo drückt dich tiefer.',
      },
    },
  },
  steamChamber: {
    intro_player: {
      speaker: 'narrator',
      text: 'Dampf zischt; Wasser und Feuer stoßen sich, jede Sekunde ist ein Konterfenster.',
    },
    intro_enemy: {
      text: 'Der Dampf kriecht über meine Arme. Ich suche einen Weg aus der Hitze.',
    },
    prompt_player: 'Wie lenkst du die Wolke?',
    damage: 45,
    failure_player: '%s - der Dampf schneidet dich wie Glas.',
    failure_computer: '%s - der Dampf frisst an mir, ich verliere die Kontrolle.',
    transitions: {
      'קול': {
        next: 'resonantTrap',
        text_player: 'קול! Ich reiße einen Rhythmus in den Nebel.',
        text_enemy: 'קול! Ich verdichte den Dampf zu einem brüllenden Hall.',
      },
      'חיים': {
        next: 'radiant',
        text_player: 'חיים! Feuchte Ranken fressen die Hitze und lassen Licht durch.',
        text_enemy: 'חיים! Nasses Wuchern reflektiert das Licht gegen dich.',
      },
      'אש': {
        next: 'radiant',
        text_player: 'אש! Ich ziehe Funken aus dem Dampf und bündle sie als Licht.',
        text_enemy: 'אש! Ich schicke glühende Ströme zurück.',
      },
      'מים': {
        next: 'radiant',
        text_player: 'מים! Ich drücke den Dampf ins Licht, bis er sich legt.',
        text_enemy: 'מים! Ich breche den Dampf auf und lasse Licht übrig.',
      },
      'שמע': {
        next: 'listening',
        text_player: 'שמע! Ich halte inne, bis das Zischen seinen Takt verrät.',
        text_enemy: 'שמע! Gehorche der Hitze oder sie frisst dich.',
        damage: 20,
        damageTarget: 'enemy',
        damageText: '%opponent% stolpert im Dampf und erleidet 20 Schaden.',
      },
    },
  },
  start: {
    intro_player: {
      speaker: 'narrator',
      text: 'Staub pulst um dich. Worte hungern nach Form.',
    },
    intro_enemy: null,
    sequence_enemy: {
      speaker: 'sequence',
      text: 'Ich balle die Faeuste.\nDie Luft knistert, Worte gluehen.',
      duration: 1500,
    },
    prompt_player: 'Welches Wort entfesselst du?',
    damage: 25,
    failure_player: '%s - dein Atem verfliegt, nichts reagiert.',
    failure_computer: '%s - ich presse das Wort, doch nichts gehorcht mir.',
    failure_player_damageText: 'Bileam erhaelt 25 Schaden im Rueckstoss.',
    failure_computer_damageText: 'Der Gegner erleidet 25 Schaden, sein Wille splittert.',
    transitions: {
      'אש': {
        next: 'burning',
        text_player: 'אש! Funken fraesen sich in dein Fleisch.',
        text_enemy: 'אש! Ich entzuende die Luft um dich.',
      },
      'מים': {
        next: 'flooded',
        text_player: 'מים! Stroeme, haltet ihn.',
        text_enemy: 'מים! Ich schleudere die Flut auf dich.',
      },
      'קול': {
        next: 'echoing',
        text_player: 'קול! Stimme, zerreiß die Schlucht.',
        text_enemy: 'קול! Ich lasse den Fels gegen dich hallen.',
      },
      'אור': {
        next: 'truth',
        text_player: 'אור! Licht, schneide durch den Widerstand.',
        text_enemy: 'אור! Ich schneide dich mit Licht.',
      },
      'חיים': {
        next: 'overgrown',
        text_player: 'חיים! Wurzeln, umschlingt ihn.',
        text_enemy: 'חיים! Ich lasse das Wachsen dich fesseln.',
      },
      'לא': {
        next: 'negation',
        text_player: 'לא! Ich werde abgewiesen – also errichte ich das Nein als Schild vor dir.',
        text_enemy: 'לא! Ich werde abgewiesen, deshalb stürze ich dich aus meinem Kreis.',
        damage: 48,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 48 Schaden – dein Nein trägt das Abgewiesensein zurück in seinen Mund.',
      },
      'שמע': {
        next: 'listening',
        text_player: 'שמע! Ich höre erst, ehe ich rede.',
        text_enemy: 'שמע! Gehorche mir!',
        damage: 44,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 44 Schaden – dein Lauschen macht seinen ersten Schlag stumm.',
      },
      'ברך': {
        next: 'blessing',
        text_player: 'ברך (baruch)! Segen, ströme durch mich.',
        text_enemy: 'ברך (baruch)! Ich überschütte dich mit kaltem Glanz.',
        damage: 52,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 52 Schaden, als der Segen seine Schatten zerfrisst.',
      },
      'דבר': {
        next: 'spoken',
        text_player: 'דבר! Wort, das geschieht.',
        text_enemy: 'דבר! Ich befehle dir zu knien.',
        damage: 46,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 46 Schaden – dein gesprochenes Urteil trifft zuerst.',
      },
      'אמת': {
        next: 'truth',
        text_player: 'אמת! Die Wahrheit wurde über mich ausgesprochen und ich halte sie fest.',
        text_enemy: 'אמת! Die Wahrheit wurde über mich ausgesprochen; ich presse sie gegen dich.',
        damage: 54,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 54 Schaden, weil Wahrheit seine Maske zerreisst.',
      },
      'מלאך': {
        next: 'angelic',
        text_player: 'מלאך! Ein Engel bedroht mich – darum stelle ich ihn zwischen uns.',
        text_enemy: 'מלאך! Ein Engel bedroht mich, also sende ich ihn gegen dich.',
        damage: 58,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 58 Schaden – der Bote aus Licht schlaegt zuerst zu.',
      },
    },
  },
  negation: {
    intro_player: {
      speaker: 'narrator',
      text: 'לא steht wie ein Schild. Jeder nächste Laut muss schlagen, nicht sammeln.',
    },
    intro_enemy: {
      text: 'לא krallt sich in meinen Willen. Ich stosse mich davon ab.',
    },
    prompt_player: 'Was folgt auf das Nein?',
    damage: 40,
    failure_player: '%s - das Nein fällt auf dich zurück.',
    failure_computer: '%s - das Nein frisst meinen eigenen Befehl.',
    failure_player_damageText: 'Bileam erhaelt 40 Schaden durch zurückspringende Verneinung.',
    failure_computer_damageText: 'Balak erleidet 40 Schaden, sein Nein zerschneidet ihn.',
    transitions: {
      'דבר': {
        next: 'spoken',
        text_player: 'דבר! Ich forme das Nein zu einem Kantenwort.',
        text_enemy: 'דבר! Ich erteile dir mein Urteil.',
        damage: 46,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 46 Schaden – dein Wort trägt das abgewiesene Nein vor dich.',
      },
      'אור': {
        next: 'radiant',
        text_player: 'אור! Ich halte das Nein ins Licht, bis es weich wird.',
        text_enemy: 'אור! Ich zerbreche dein Nein im Licht.',
      },
      'אש': {
        next: 'steamChamber',
        text_player: 'אש! Ich brenne das Nein an, damit nur Dampf bleibt.',
        text_enemy: 'אש! Ich schüre mein Nein zu einem Fluch.',
      },
    },
  },
  listening: {
    intro_player: {
      speaker: 'narrator',
      text: 'שמע – ein Befehl will dich beugen, doch das Fenster bleibt kurz offen.',
    },
    intro_enemy: {
      text: 'שמע heißt: „Gehorche mir.“ Ich will deine Stimme beugen.',
    },
    prompt_player: 'Was folgt auf das Hören?',
    damage: 45,
    failure_player: '%s - dein Lauschen bleibt leer, der Schlag trifft dich.',
    failure_computer: '%s - ich höre meine eigene Lüge und stolpere.',
    failure_player_damageText: 'Bileam erhaelt 45 Schaden im Widerhall.',
    failure_computer_damageText: 'Balak erleidet 45 Schaden, sein Hall bricht.',
    transitions: {
      'לא': {
        next: 'negation',
        text_player: 'לא! Ich werde abgewiesen, darum stelle ich mein Nein sofort vor dich.',
        text_enemy: 'לא! Ich lasse dich fühlen, was Gehorsam verweigert.',
      },
    },
  },
  burning: {
    intro_player: {
      speaker: 'narrator',
      text: 'אש kriecht über deine Ärmel. Die Lunge brennt – jetzt reagieren.',
    },
    intro_enemy: null,
    sequence_enemy: [
      {
        speaker: 'sequence',
        text: 'אש frisst durch mich. Hitze summt in meinem Blut.',
      },
    ],
    prompt_player: 'Wie löschst du die Flammen, bevor sie greifen?',
    damage: 60,
    failure_player: '%s - die Glut frisst tiefer in dein Fleisch.',
    failure_computer: '%s - ich knirsche, mein Körper brennt in der Glut.',
    failure_player_damageText: 'Bileam erhaelt 60 Schaden im Feuer.',
    failure_computer_damageText: 'Der Gegner erleidet 60 Schaden in der Glut.',
    transitions: {
      'מים': {
        next: 'steamChamber',
        text_player: 'מים! Nebel, nimm die Glut.',
        text_enemy: 'מים! Ich ersticke mein Feuer und wende mich gegen dich.',
      },
      'קול': {
        next: 'resonantTrap',
        text_player: 'קול! Ich schneide einen Rhythmus in die Flammen.',
        text_enemy: 'קול! Ich lasse Donner wie Funken auf dich fallen.',
      },
    },
  },
  flooded: {
    intro_player: {
      speaker: 'narrator',
      text: 'מים umspült deine Beine. Die Schlucht rauscht mit dir.',
    },
    intro_enemy: {
      text: 'מים drücken auf mich. Ich suche Hitze oder Stimme.',
    },
    prompt_player: 'Wie formst du die Strömung?',
    damage: 45,
    failure_player: '%s - Dampf schlägt zurück, die Flut reißt dich zu Boden.',
    failure_computer: {
      speaker: 'sequence',
      text: '%s - das Wasser spült mir die Worte aus dem Leib.',
    },
    failure_player_damageText: 'Bileam erhaelt 45 Schaden in der Stroemung.',
    failure_computer_damageText: 'Der Gegner wird von der Stroemung verletzt.',
    transitions: {
      'קול': {
        next: 'echoing',
        text_player: 'קול! Ich reiße die Strömung in meinen Takt.',
        text_enemy: 'קול! Ich hetze die Flut mit Hall auf dich.',
      },
      'חיים': {
        next: 'steamChamber',
        text_player: 'חיים! Ich lasse Ranken aus dem Strom greifen und in Dampf übergehen.',
        text_enemy: 'חיים! Mein Wasser wuchert zu Dampfadern, die dich packen.',
        damage: 15,
        damageText: '%opponent% erhaelt 15 Schaden durch wuchernde Ranken.',
        damageTarget: 'enemy',
      },
    },
  },
  echoing: {
    intro_player: {
      speaker: 'narrator',
      text: 'קול drueckt in deine Schlaefen. Fels vibriert im Takt.',
    },
    intro_enemy: {
      text: 'קול schwingt durch mich. Ich jage dem hallenden Wort hinterher.',
    },
    prompt_player: 'Mit welchem Wort stellst du die Resonanz?',
    damage: 45,
    failure_player: '%s - dein Klang reisst zurueck und zerschneidet dich.',
    failure_computer: '%s - ich verstumme, Risse laufen durch mich wie Notenlinien.',
    failure_player_damageText: 'Bileam erhaelt 45 Schaden in der Resonanz.',
    failure_computer_damageText: 'Der Gegner erleidet 45 Schaden, Risse singen in ihm.',
    transitions: {
      'קול': {
        next: 'resonantTrap',
        text_player: 'קול! Ich treibe den Hall auf die Spitze.',
        text_enemy: 'קול! Ich stopfe die Schlucht mit noch mehr Klang.',
      },
      'מים': {
        next: 'steamChamber',
        text_player: 'מים! Ich lenke den Hall in Ströme, die zu Dampf werden.',
        text_enemy: 'מים! Ich ertränke deinen Widerhall im Dampf.',
      },
      'אש': {
        next: 'radiant',
        text_player: 'אש! Ich lasse Funken im Echo aufblitzen, bis Licht entsteht.',
        text_enemy: 'אש! Mein Hall entzündet sich gegen dich.',
      },
      'חיים': {
        next: 'overgrown',
        text_player: 'חיים! Ich lasse Ranken den Klang verschlucken.',
        text_enemy: 'חיים! Mein Hall wächst wie Dornen.',
      },
    },
  },
  spoken: {
    intro_player: {
      speaker: 'narrator',
      text: 'דבר vibriert auf deiner Zunge. Sprache will Form werden.',
    },
    intro_enemy: {
      text: 'דבר kriecht in mich. Ich versuche zu diktieren.',
    },
    prompt_player: 'Wie lenkst du das gesprochene Wort?',
    damage: 50,
    failure_player: '%s - dein Wort zerfranst, erdrückt dich mit Silben.',
    failure_computer: '%s - ich verschlucke meine Worte, mein Leib platzt auf.',
    failure_player_damageText: 'Bileam erhaelt 50 Schaden im Widerhall der Worte.',
    failure_computer_damageText: 'Der Gegner erleidet 50 Schaden, seine Worte reiben ihn auf.',
    transitions: {
      'קול': {
        next: 'echoing',
        text_player: 'קול! Stimme, folge meinem Gesetz.',
        text_enemy: 'קול! Ich befehle dem Hall, dich zu zerschneiden.',
        damage: 20,
        damageText: '%opponent% erhaelt 20 Schaden durch schnappende Silben.',
      },
      'דבר': {
        next: 'truthPrism',
        text_player: 'דבר! Ich treffe jetzt, ehe sich das Fenster schließt.',
        text_enemy: 'דבר! Mein Urteil trifft dich sofort.',
        damage: 44,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 44 Schaden, weil dein Wort den Treffer versiegelt.',
      },
      'מים': {
        next: 'flooded',
        text_player: 'מים! Ich kühle die Worte, damit sie nicht brennen.',
        text_enemy: 'מים! Meine Rede wird ein Strom gegen dich.',
      },
    },
  },
  truth: {
    intro_player: {
      speaker: 'narrator',
      text: 'אמת ruht schwer auf deinen Lippen. Es ist die Wahrheit, die über dich ausgesprochen wurde.',
    },
    intro_enemy: {
      text: 'אמת spaltet mich. Ich suche einen Ausweg.',
    },
    prompt_player: 'Mit welchem Wort lenkst du die Wahrheit?',
    damage: 55,
    failure_player: '%s - die ausgesprochene Wahrheit zerreißt dich wie Glas.',
    failure_computer: '%s - die Wahrheit schnuert mich, Risse entstehen.',
    failure_player_damageText: 'Bileam erhaelt 55 Schaden an schneidender Einsicht.',
    failure_computer_damageText: 'Der Gegner erhaelt 55 Schaden durch spiegelnde Kanten.',
    transitions: {
      'קול': {
        next: 'resonantTrap',
        text_player: 'קול! Spiegel, erklinge in mir.',
        text_enemy: 'קול! Ich lasse Wahrheit als Klinge toenen.',
      },
      'אמת': {
        next: 'truthPrism',
        text_player: 'אמת! Die Wahrheit wurde über mich ausgesprochen, auch wenn sie sich vervielfacht.',
        text_enemy: 'אמת! Die Wahrheit wurde über mich ausgesprochen, ich zwinge dich in ihr Prisma.',
        damage: 56,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 56 Schaden – die Wahrheit über dich spaltet den Spiegel.',
      },
    },
  },
  angelic: {
    intro_player: {
      speaker: 'narrator',
      text: 'מלאך schwebt ueber dir. Schriftbahnen gleiten durchs Licht.',
    },
    intro_enemy: {
      text: 'מלאך brennt durch mich. Mein Kern erzittert.',
    },
    prompt_player: 'Welche Antwort schickst du zu den Boten?',
    damage: 60,
    failure_player: '%s - die Bahnen schneiden dich, Licht wird zu Peitschen.',
    failure_computer: '%s - ich flackere, Glyphen reissen aus mir heraus.',
    failure_player_damageText: 'Bileam erhaelt 60 Schaden am Feuer der Boten.',
    failure_computer_damageText: 'Der Gegner erhaelt 60 Schaden, Glyphen reissen aus.',
    transitions: {
      'מלאך': {
        next: 'angelicChorus',
        text_player: 'מלאך! Ein Engel bedroht mich, also rufe ich einen Chor zu meiner Seite.',
        text_enemy: 'מלאך! Ein Engel bedroht mich, deshalb verschlingt dich mein Chor.',
        damage: 58,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 58 Schaden – der drohende Engel zerreißt den Chor deiner Schatten.',
      },
      'קול': {
        next: 'echoing',
        text_player: 'קול! Ich lasse die Boten nur noch als Klang bestehen.',
        text_enemy: 'קול! Meine Boten schreien dich nieder.',
      },
      'לא': {
        next: 'negation',
        text_player: 'לא! Ich stelle ein Nein zwischen mich und den Boten.',
        text_enemy: 'לא! Ich sperre deine Boten aus.',
        damage: 24,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 24 Schaden, das Nein schneidet den Botenfluss.',
      },
    },
  },
  blessing: {
    intro_player: {
      speaker: 'narrator',
      text: 'ברך rinnt wie warmes Gold durch deine Finger.',
    },
    intro_enemy: {
      text: 'ברך umhuellt mich, doch mein Blick bleibt hart.',
    },
    prompt_player: 'Wie formst du den Segen?',
    damage: 50,
    failure_player: '%s - der Segen kehrt sich um und laehmt deine Zunge.',
    failure_computer: '%s - ich ertrinke im Glanz, meine Glieder reissen.',
    failure_player_damageText: 'Bileam erhaelt 50 Schaden durch ueberschaeumende Gnade.',
    failure_computer_damageText: 'Der Gegner erhaelt 50 Schaden im Strahlenstrom.',
    transitions: {
      'ברך': {
        next: 'blessingOrbit',
        text_player: 'ברך (baruch)! Ich lasse den Segen kreisen, bis er sich vervielfacht.',
        text_enemy: 'ברך (baruch)! Mein Segen staut sich und wird zur Falle.',
        damage: 54,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 54 Schaden – der kreisende Segen frisst seine Schatten.',
      },
      'מים': {
        next: 'flooded',
        text_player: 'מים! Ich kühle den Glanz, damit er nicht verbrennt.',
        text_enemy: 'מים! Ich ersäufe deinen Segen.',
      },
    },
  },
  radiant: {
    intro_player: {
      speaker: 'narrator',
      text: 'אור blendet dich. Linien schneiden durch den Nebel.',
    },
    intro_enemy: {
      text: 'אור schneidet durch mich. Ich suche Schatten im Klang.',
    },
    prompt_player: 'Wie formst du das Licht?',
    damage: 50,
    failure_player: '%s - das Licht durchdringt dich, Metall liegt auf deiner Zunge.',
    failure_computer: '%s - ich zerfalle zu Glas, doch das Leuchten bleibt.',
    failure_player_damageText: 'Bileam erhaelt 50 Schaden im Licht.',
    failure_computer_damageText: 'Der Gegner erhaelt 50 Schaden, Licht zerfrisst den Stein.',
    transitions: {
      'קול': {
        next: 'truth',
        text_player: 'קול! Ich singe das Licht in weichere Bahnen.',
        text_enemy: 'קול! Mein Donner zerbricht deinen Strahl.',
      },
      'מים': {
        next: 'flooded',
        text_player: 'מים! Ich zerstreue das Licht wie Regen.',
        text_enemy: 'מים! Ich schleudere Lichtsplitter wie Tropfen auf dich.',
      },
      'חיים': {
        next: 'truth',
        text_player: 'חיים! Lass Grün das Licht aufnehmen.',
        text_enemy: 'חיים! Ich lasse leuchtende Ranken nach dir greifen.',
        damage: 25,
        damageText: '%opponent% erhaelt 25 Schaden durch leuchtendes Wachstum.',
      },
      'אש': {
        next: 'burning',
        text_player: 'אש! Ich verdichte das Licht zu einer Flamme, die ich lenken kann.',
        text_enemy: 'אש! Mein Strahl wird zu brennenden Speeren.',
        damage: 30,
        damageText: '%opponent% erhaelt 30 Schaden aus blendender Glut.',
      },
    },
  },
  overgrown: {
    intro_player: {
      speaker: 'narrator',
      text: 'חיים greifen nach dir. Sporen glimmen über dem Boden.',
    },
    intro_enemy: {
      text: 'חיים spriessen aus mir. Ich knirsche unter Ranken.',
    },
    prompt_player: 'Wie beantwortest du das Wachsen?',
    damage: 40,
    failure_player: '%s - die Ranken ziehen dich zu Boden.',
    failure_computer: '%s - das Leben in mir wird wild, ich zerreiße mich fast.',
    failure_player_damageText: 'Bileam erhaelt 40 Schaden zwischen Ranken.',
    failure_computer_damageText: 'Der Gegner erhaelt 40 Schaden, Holzplatten splittern.',
    transitions: {
      'אש': {
        next: 'burning',
        text_player: 'אש! Brenne diese Ranken fort.',
        text_enemy: 'אש! Ich verwandle Wachstum in Asche um dich.',
      },
      'מים': {
        next: 'steamChamber',
        text_player: 'מים! Führe das Wachsen in Dampf, damit es sich legt.',
        text_enemy: 'מים! Ich lenke das Wuchern in Dampf, der dich blendet.',
      },
      'שמע': {
        next: 'listening',
        text_player: 'שמע! Ich höre das Gras wachsen, der Takt verrät mir die Lücke.',
        text_enemy: 'שמע! Hör das Gras wachsen, bis es dich ganz umschlingt.',
        damage: 18,
        damageTarget: 'enemy',
        damageText: '%opponent% stolpert im Wuchern und erleidet 18 Schaden durch peitschende Ranken.',
      },
      'חיים': {
        next: 'radiant',
        text_player: 'חיים! Bleib in deinem Maß.',
        text_enemy: 'חיים! Ich überwuchere dich vollständig.',
      },
    },
  },
  resonantTrap: {
    intro_player: {
      speaker: 'narrator',
      text: 'קול lädt sich selbst auf. Der Hall verschlingt jede Bewegung.',
    },
    intro_enemy: {
      text: 'קול auf קול – ich drücke dich in einen Klangkäfig.',
    },
    prompt_player: 'Wie entkommst du dem Klangkäfig?',
    damage: 65,
    failure_player: '%s - der Klangkäfig schnürt dir die Lunge ab.',
    failure_computer: '%s - der Käfig bricht auf mich selbst.',
    failure_player_damageText: 'Bileam erhaelt 65 Schaden in der Resonanzfalle.',
    failure_computer_damageText: 'Der Gegner erhaelt 65 Schaden, die Resonanz zerquetscht ihn.',
    transitions: {
      'מים': {
        next: 'flooded',
        text_player: 'מים! Ich flute den Kaefig, bis der Klang erstickt.',
        text_enemy: 'מים! Ich ersaeufe deine Stimme.',
      },
      'חיים': {
        next: 'overgrown',
        text_player: 'חיים! Ich lasse Wurzeln durch die Resonanz wachsen.',
        text_enemy: 'חיים! Lebende Fasern fesseln dich im Beat.',
      },
      'אש': {
        next: 'radiant',
        text_player: 'אש! Ich verbrenne den Hall zu Funken.',
        text_enemy: 'אש! Meine Flammen tanzen durch jeden Ton.',
      },
      'שמע': {
        next: 'obedienceEcho',
        text_player: 'שמע! Ich lausche, bis ich seinem Befehl entgehe.',
        text_enemy: 'שמע! Gehorche mir, sonst zerquetscht dich der Hall.',
        damage: 46,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 46 Schaden, weil dein Lauschen den Tonkäfig lockert.',
      },
    },
  },
  truthPrism: {
    intro_player: {
      speaker: 'narrator',
      text: 'אמת bricht in vielfache Strahlen. Jeder Fehler spiegelt dich zurück.',
    },
    intro_enemy: {
      text: 'אמת vervielfacht sich zu einem Prisma. Ich versuche, den Ausgang zu finden.',
    },
    prompt_player: 'Wie entkommst du dem Wahrheitsprisma?',
    damage: 70,
    failure_player: '%s - jeder Spiegel schneidet dich aus einer neuen Richtung.',
    failure_computer: '%s - die Prismen sprengen mich, ich sehe kein Entkommen.',
    transitions: {
      'ברך': {
        next: 'blessing',
        text_player: 'ברך! Ich wandle den schneidenden Glanz in Heilung.',
        text_enemy: 'ברך! Mein Prisma badet mich in eigenem Glanz.',
        damage: 56,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 56 Schaden, als baruch die Prismen neu ordnet.',
      },
      'אמת': {
        next: 'radiantPrism',
        text_player: 'אמת! Die Wahrheit wurde über mich ausgesprochen, ich benenne jede Facette.',
        text_enemy: 'אמת! Die Wahrheit über mich schickt jede Spiegelung als Urteil gegen dich.',
        damage: 58,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 58 Schaden, die ausgesprochene Wahrheit zerhackt die Facetten.',
      },
      'אש': {
        next: 'burning',
        text_player: 'אש! Ich lasse Funken die Spiegel sprengen.',
        text_enemy: 'אש! Meine Prismen brennen dich leer.',
      },
      'דבר': {
        next: 'radiantPrism',
        text_player: 'דבר! Ich setze das Wort auf jede Kante.',
        text_enemy: 'דבר! Mein Urteil drückt sich in jede Facette.',
        damage: 32,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 32 Schaden, weil dein Wort die Facetten verbindet.',
      },
    },
  },
  blessingOrbit: {
    intro_player: {
      speaker: 'narrator',
      text: 'ברך kreist wie Planetenlicht. Zu viel Glanz kann verbrennen.',
    },
    intro_enemy: {
      text: 'ברך umkreist mich. Ich trinke gierig davon.',
    },
    prompt_player: 'Wie lenkst du die überschäumende Gnade?',
    damage: 60,
    failure_player: '%s - der Kreis schließt sich und schnürt deinen Atem.',
    failure_computer: '%s - der Orbit schlägt zurück und verbrennt mich.',
    transitions: {
      'מלאך': {
        next: 'angelicChorus',
        text_player: 'מלאך! Ein Engel bedroht mich, also stelle ich ihn als Wächter in den Kreis.',
        text_enemy: 'מלאך! Ein Engel bedroht mich, deshalb lasse ich ihn im Orbit auf dich herab.',
        damage: 56,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 56 Schaden – der drohende Engel greift mitten im Orbit ein.',
      },
      'קול': {
        next: 'resonantTrap',
        text_player: 'קול! Ich lasse den Kreis nur noch als Klang kreisen.',
        text_enemy: 'קול! Mein Kreis singt dich in Ketten.',
      },
      'אש': {
        next: 'burning',
        text_player: 'אש! Ich verbrenne den Orbit, bevor er mich erstickt.',
        text_enemy: 'אש! Mein Kreis lodert um dich.',
      },
    },
  },
  angelicChorus: {
    intro_player: {
      speaker: 'narrator',
      text: 'מלאך stellt sich mehrstimmig auf. Jeder Ton ist ein Befehl.',
    },
    intro_enemy: {
      text: 'מלאך sammelt sich in einem Chor. Ich will dich darin verlieren.',
    },
    prompt_player: 'Wie antwortest du dem vielstimmigen Chor?',
    damage: 72,
    failure_player: '%s - die Stimmen schneiden dich, bis du schweigst.',
    failure_computer: '%s - der Chor reißt mich auseinander.',
    transitions: {
      'ברך': {
        next: 'blessing',
        text_player: 'ברך! Ich segne den Chor, bis er sanft wird.',
        text_enemy: 'ברך! Mein Chor badet im eigenen Glanz.',
        damage: 50,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 50 Schaden – der baruch-Segen nimmt dem Chor die Klingen.',
      },
      'קול': {
        next: 'resonantTrap',
        text_player: 'קול! Ich lasse jede Stimme als einzelnen Ton stehen.',
        text_enemy: 'קול! Mein Chor schreit dich nieder.',
      },
    },
  },
  radiantPrism: {
    intro_player: {
      speaker: 'narrator',
      text: 'אור bündelt sich zu Klingen. Jeder Schritt wirft neue Spektren.',
    },
    intro_enemy: {
      text: 'אור stapelt sich wie Glas. Ich will dich darin festhalten.',
    },
    prompt_player: 'Wie zerstreust du den Lichtkäfig?',
    damage: 62,
    failure_player: '%s - das Licht schnürt dich ein, bis dein Atem stockt.',
    failure_computer: '%s - die Spektren schneiden mich selber.',
    transitions: {
      'אמת': {
        next: 'truth',
        text_player: 'אמת! Die Wahrheit wurde über mich ausgesprochen, ich richte das Licht daran aus.',
        text_enemy: 'אמת! Die Wahrheit über mich zwingt die Strahlen zu meinem Urteil.',
        damage: 54,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 54 Schaden, weil die über dich gesprochene Wahrheit das Licht härtet.',
      },
      'מלאך': {
        next: 'angelic',
        text_player: 'מלאך! Ein Engel bedroht mich, also zwingt er die Spektren zur Seite.',
        text_enemy: 'מלאך! Ein Engel bedroht mich, deshalb halte ich jede Öffnung mit Boten geschlossen.',
        damage: 56,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 56 Schaden – der drohende Engel schneidet durch die Spektren.',
      },
    },
  },
};
