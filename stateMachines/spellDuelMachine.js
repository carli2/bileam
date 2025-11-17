/**
 * Spell duel consistency rules
 * ---------------------------
 * - Elements follow a loose dominance chain instead of full symmetry; not
 *   every state exposes every known word, so Fehler sind möglich und gewollt.
 * - Wasser besiegt Feuer, Feuer verbrennt Leben, Leben durchdringt Licht usw.
 *   Beim Rückweg sind Kombinationen bewusst eingeschränkt, damit Lernende
 *   Muster erkennen statt jede Eingabe zu erraten.
 * - Echo-Schleifen dürfen sich zuspitzen: wiederholtes קול führt in eine
 *   Resonanzfalle mit höherem Grundschaden, aus der קול nicht mehr herausführt.
 */
export const SPELL_DUEL_MACHINE = {
  meta: {
    enemyAccuracy: 0.7,
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
        next: 'radiant',
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
        text_player: 'לא! Kein Schritt weiter, Balak.',
        text_enemy: 'לא! Ich verneine deine Hoffnung.',
        damage: 48,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 48 Schaden – dein Nein schneidet seine Worte entzwei.',
      },
      'שמע': {
        next: 'listening',
        text_player: 'שמע! Ich hoere, bevor ich spreche.',
        text_enemy: 'שמע! Hoer mich, Lehrling.',
        damage: 44,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 44 Schaden – dein Lauschen macht seinen ersten Schlag stumm.',
      },
      'ברך': {
        next: 'blessing',
        text_player: 'ברכה! Segen, stroeme durch mich.',
        text_enemy: 'ברכה! Ich ueberschuette dich mit Glanz.',
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
        text_player: 'אמת! Spiegel, enthuelle ihn.',
        text_enemy: 'אמת! Ich zwinge dich in mein Gesetz.',
        damage: 54,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 54 Schaden, weil Wahrheit seine Maske zerreisst.',
      },
      'מלאך': {
        next: 'angelic',
        text_player: 'מלאך! Bote, steige nieder.',
        text_enemy: 'מלאך! Ich rufe Boten, die dich bannen.',
        damage: 58,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 58 Schaden – der Bote aus Licht schlaegt zuerst zu.',
      },
    },
  },
  negation: {
    intro_player: {
      speaker: 'narrator',
      text: 'לא steht wie ein Schild vor dir. Der Atem wird langsam.',
    },
    intro_enemy: {
      text: 'לא krallt sich in meinen Willen. Ich stosse mich davon ab.',
    },
    prompt_player: 'Was folgt auf das Nein?',
    damage: 40,
    failure_player: '%s - das Nein faellt auf dich zurueck.',
    failure_computer: '%s - das Nein frisst meinen eigenen Befehl.',
    failure_player_damageText: 'Bileam erhaelt 40 Schaden durch zurueckspringende Verneinung.',
    failure_computer_damageText: 'Balak erleidet 40 Schaden, sein Nein zerschneidet ihn.',
    transitions: {
      'שמע': {
        next: 'listening',
        text_player: 'שמע! Ich hoere, was bleibt.',
        text_enemy: 'שמע! Hoer auf meine Befehle!',
      },
      'דבר': {
        next: 'spoken',
        text_player: 'דבר! Forme das Nein zu Sprache.',
        text_enemy: 'דבר! Ich erteile dir mein Urteil.',
      },
      'אמת': {
        next: 'truth',
        text_player: 'אמת! Nein ohne Wahrheit ist leer.',
        text_enemy: 'אמת! Ich fuelle das Nein mit meinem Gesetz.',
      },
      'ברך': {
        next: 'blessing',
        text_player: 'ברכה! Aus dem Nein wird Segen.',
        text_enemy: 'ברכה! Ich zwinge das Nein zum Segen.',
      },
      'מלאך': {
        next: 'angelic',
        text_player: 'מלאך! Bote, trage das Nein.',
        text_enemy: 'מלאך! Ich sende Boten, die dein Nein brechen.',
      },
    },
  },
  listening: {
    intro_player: {
      speaker: 'narrator',
      text: 'שמע – alles verstummt, damit das Wort Gestalt annehmen kann.',
    },
    intro_enemy: {
      text: 'שמע zwingt mich zu lauschen. Ich suche den naechsten Schlag.',
    },
    prompt_player: 'Was folgt auf das Hoeren?',
    damage: 45,
    failure_player: '%s - dein Lauschen bleibt leer, der Schlag trifft dich.',
    failure_computer: '%s - ich hoere meine eigene Luege und stolpere.',
    failure_player_damageText: 'Bileam erhaelt 45 Schaden im Widerhall.',
    failure_computer_damageText: 'Balak erleidet 45 Schaden, sein Hall bricht.',
    transitions: {
      'דבר': {
        next: 'spoken',
        text_player: 'דבר! Ich forme das Gehörte zu einer klaren Zusage.',
        text_enemy: 'דבר! Ich hämmere das Lauschen in Befehl.',
      },
      'אמת': {
        next: 'truth',
        text_player: 'אמת! Ich lausche, bis die Wahrheit durchscheint.',
        text_enemy: 'אמת! Meine Wahrheit soll dein Ohr verzehren.',
      },
      'ברך': {
        next: 'blessing',
        text_player: 'ברכה! Das Gehörte wird zu heilender Antwort.',
        text_enemy: 'ברכה! Ich zwinge den Klang, mich zu krönen.',
      },
      'מלאך': {
        next: 'angelic',
        text_player: 'מלאך! Bote, trage diese Stimme zu den Höhen.',
        text_enemy: 'מלאך! Die Boten folgen meinem Ruf, nicht deinem.',
      },
    },
  },
  burning: {
    intro_player: {
      speaker: 'narrator',
      text: 'אש kriecht ueber deine Aermel. Hitze summt in der Luft.',
    },
    intro_enemy: null,
    sequence_enemy: [
      {
        speaker: 'sequence',
        text: 'אש frisst durch mich. Hitze summt in meinem Blut.',
      },
    ],
    prompt_player: 'Wie loeschst du die Flammen?',
    damage: 60,
    failure_player: '%s - die Glut frisst tiefer in dein Fleisch.',
    failure_computer: '%s - ich knirsche, mein Koerper brennt in der Glut.',
    failure_player_damageText: 'Bileam erhaelt 60 Schaden im Feuer.',
    failure_computer_damageText: 'Der Gegner erleidet 60 Schaden in der Glut.',
    transitions: {
      'מים': {
        next: 'start',
        text_player: 'מים! Nebel, nimm die Glut.',
        text_enemy: 'מים! Ich ersticke mein Feuer und wende mich gegen dich.',
      },
      // Entfernt: קול kontert אש nicht mehr direkt,
      'שמע': {
        next: 'listening',
        text_player: 'שמע! Ich hoere selbst in den Flammen.',
        text_enemy: 'שמע! Hoer wie das Feuer dich frisst.',
        damage: 46,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 46 Schaden – dein Lauschen nimmt der Glut den Atem.',
      },
      'לא': {
        next: 'negation',
        text_player: 'לא! Flammen, gehorcht meinem Verbot.',
        text_enemy: 'לא! Ich verbiete dir, die Glut zu halten.',
        damage: 52,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 52 Schaden, als dein Nein das Feuer erstickt.',
      },
      'דבר': {
        next: 'spoken',
        text_player: 'דבר! Ich spreche dem Feuer eine Grenze.',
        text_enemy: 'דבר! Ich befehle der Flamme, dich zu fressen.',
        damage: 45,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 45 Schaden durch das gebundene Feuerwort.',
      },
    },
  },
  flooded: {
    intro_player: {
      speaker: 'narrator',
      text: 'מים umspuelt deine Beine. Die Schlucht rauscht mit dir.',
    },
    intro_enemy: {
      text: 'מים druecken auf mich. Ich suche Hitze oder Stimme.',
    },
    prompt_player: 'Wie formst du die Stroemung?',
    damage: 45,
    failure_player: '%s - Dampf schlaegt zurueck, die Flut reisst dich zu Boden.',
    failure_computer: {
      speaker: 'sequence',
      text: '%s - das Wasser spuelt mir die Worte aus dem Leib.',
    },
    failure_player_damageText: 'Bileam erhaelt 45 Schaden in der Stroemung.',
    failure_computer_damageText: 'Der Gegner wird von der Stroemung verletzt.',
    transitions: {
      'קול': {
        next: 'echoing',
        text_player: 'קול! Ich singe dem Wasser einen ruhigeren Rhythmus.',
        text_enemy: 'קול! Ich hetze die Flut mit Hall auf dich.',
      },
      'דבר': {
        next: 'spoken',
        text_player: 'דבר! Ich spreche dem Wasser einen Lauf vor.',
        text_enemy: 'דבר! Ich falte die Flut zu einem Speer.',
        damage: 44,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 44 Schaden durch gesprochenes Wasserrecht.',
      },
      'ברך': {
        next: 'blessing',
        text_player: 'ברכה! Ich segne die Stroemung, damit sie sich beruhigt.',
        text_enemy: 'ברכה! Ich lasse den Strom mich verklären.',
        damage: 53,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 53 Schaden, als der Segen die Fluten umkehrt.',
      },
      'לא': {
        next: 'negation',
        text_player: 'לא! Der Strom gehorcht meinem Verbot.',
        text_enemy: 'לא! Ich lasse dein Wasser gefrieren.',
        damage: 50,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 50 Schaden – dein Nein schockfriert sein Blut.',
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
      'דבר': {
        next: 'spoken',
        text_player: 'דבר! Worte, binde den Klang.',
        text_enemy: 'דבר! Ich befehle dem Echo.',
        damage: 46,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 46 Schaden – dein Wort zwingt den Hall zum Stillstand.',
      },
      'שמע': {
        next: 'listening',
        text_player: 'שמע! Ich hoere, was der Hall verschweigt.',
        text_enemy: 'שמע! Ich zwinge dich, meinem Hall zu lauschen.',
        damage: 44,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 44 Schaden, weil dein Lauschen seine Resonanz bricht.',
      },
      'לא': {
        next: 'negation',
        text_player: 'לא! Der Hall verstummt.',
        text_enemy: 'לא! Ich lasse deinen Klang kollabieren.',
        damage: 50,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 50 Schaden – dein Nein zersplittert den Klangkaefig.',
      },
      'אמת': {
        next: 'truth',
        text_player: 'אמת! Wahrheit ordnet den Klang.',
        text_enemy: 'אמת! Ich mache den Hall zu meinem Spiegel.',
        damage: 52,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 52 Schaden, als Wahrheit jede Luege im Echo zerreisst.',
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
    failure_player: '%s - dein Wort zerfranst, erdrueckt dich mit Silben.',
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
      'אמת': {
        next: 'truth',
        text_player: 'אמת! Wahrheit, durchdringe die Luege.',
        text_enemy: 'אמת! Ich zeige dir mein Gesetz als Spiegel.',
      },
      'שמע': {
        next: 'listening',
        text_player: 'שמע! Ich halte inne und lausche, bevor das Wort weiter rollt.',
        text_enemy: 'שמע! Du wirst hören, was ich diktiere.',
      },
      'ברך': {
        next: 'blessing',
        text_player: 'ברכה! Ich segne das Wort, damit es heilt statt zu schneiden.',
        text_enemy: 'ברכה! Meine Rede krönt mich selbst.',
      },
    },
  },
  truth: {
    intro_player: {
      speaker: 'narrator',
      text: 'אמת ruht schwer auf deinen Lippen. Der Atem wird klar.',
    },
    intro_enemy: {
      text: 'אמת spaltet mich. Ich suche einen Ausweg.',
    },
    prompt_player: 'Mit welchem Wort lenkst du die Wahrheit?',
    damage: 55,
    failure_player: '%s - der Spiegel zerspringt, Splitter schneiden dich.',
    failure_computer: '%s - die Wahrheit schnuert mich, Risse entstehen.',
    failure_player_damageText: 'Bileam erhaelt 55 Schaden an schneidender Einsicht.',
    failure_computer_damageText: 'Der Gegner erhaelt 55 Schaden durch spiegelnde Kanten.',
    transitions: {
      'דבר': {
        next: 'spoken',
        text_player: 'דבר! Forme die Wahrheit mit Sprache.',
        text_enemy: 'דבר! Ich fasse die Wahrheit in Befehl.',
      },
      'קול': {
        next: 'echoing',
        text_player: 'קול! Spiegel, erklinge in mir.',
        text_enemy: 'קול! Ich lasse Wahrheit als Klinge toenen.',
      },
      'מלאך': {
        next: 'angelic',
        text_player: 'מלאך! Bote, trage diese Wahrheit ohne Furcht.',
        text_enemy: 'מלאך! Meine Boten sollen dich blenden.',
      },
      'ברך': {
        next: 'blessing',
        text_player: 'ברכה! Ich lasse die Wahrheit als Heilung fallen.',
        text_enemy: 'ברכה! Mein Segen übertönt deine Spiegel.',
      },
      'שמע': {
        next: 'listening',
        text_player: 'שמע! Ich lausche, bis die Wahrheit leiser wird.',
        text_enemy: 'שמע! Höre, wie meine Wahrheit alles erstickt.',
      },
      'אמת': {
        next: 'truthPrism',
        text_player: 'אמת! Ich halte die Wahrheit fest, auch wenn sie sich vervielfacht.',
        text_enemy: 'אמת! Ich verdichte den Spiegel zu einem Prisma um dich.',
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
      'אמת': {
        next: 'truth',
        text_player: 'אמת! Halte die Boten im Gleichgewicht.',
        text_enemy: 'אמת! Ich lenke die Boten als Spiegel.',
      },
      'ברך': {
        next: 'blessing',
        text_player: 'ברכה! Ich lasse die Boten Segen tragen.',
        text_enemy: 'ברכה! Ihr Glanz gehört mir.',
      },
      'שמע': {
        next: 'listening',
        text_player: 'שמע! Ich lausche auf jede Spur im Chor der Boten.',
        text_enemy: 'שמע! Höre das Sirren meiner Heerschar.',
      },
      'מלאך': {
        next: 'angelicChorus',
        text_player: 'מלאך! Ich schicke mehrere Boten, bis sich die Bahnen öffnen.',
        text_enemy: 'מלאך! Mein Chor verschlingt dich.',
      },
    },
  },
  blessing: {
    intro_player: {
      speaker: 'narrator',
      text: 'ברכה rinnt wie warmes Gold durch deine Finger.',
    },
    intro_enemy: {
      text: 'ברכה umhuellt mich, doch mein Blick bleibt hart.',
    },
    prompt_player: 'Wie formst du den Segen?',
    damage: 50,
    failure_player: '%s - der Segen kehrt sich um und laehmt deine Zunge.',
    failure_computer: '%s - ich ertrinke im Glanz, meine Glieder reissen.',
    failure_player_damageText: 'Bileam erhaelt 50 Schaden durch ueberschaeumende Gnade.',
    failure_computer_damageText: 'Der Gegner erhaelt 50 Schaden im Strahlenstrom.',
    transitions: {
      'מלאך': {
        next: 'angelic',
        text_player: 'מלאך! Bote, verteile diesen Segen.',
        text_enemy: 'מלאך! Die Boten fesseln dich mit Licht.',
      },
      'שמע': {
        next: 'listening',
        text_player: 'שמע! Ich lausche, ob der Segen angenommen wird.',
        text_enemy: 'שמע! Hör zu, wie mein Glanz dich übertönt.',
      },
      'אמת': {
        next: 'truth',
        text_player: 'אמת! Ich prüfe den Segen im Spiegel der Wahrheit.',
        text_enemy: 'אמת! Ich zwinge den Glanz in mein Gesetz.',
      },
      'ברך': {
        next: 'blessingOrbit',
        text_player: 'ברך! Ich lasse den Segen kreisen, bis er sich vervielfacht.',
        text_enemy: 'ברך! Mein Segen staut sich und wird zur Falle.',
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
        next: 'echoing',
        text_player: 'קול! Ich singe das Licht in weichere Bahnen.',
        text_enemy: 'קול! Mein Donner zerbricht deinen Strahl.',
      },
      'מים': {
        next: 'flooded',
        text_player: 'מים! Ich zerstreue das Licht wie Regen.',
        text_enemy: 'מים! Ich schleudere Lichtsplitter wie Tropfen auf dich.',
      },
      'חיים': {
        next: 'overgrown',
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
      'שמע': {
        next: 'listening',
        text_player: 'שמע! Ich lausche, bis der Strahl seinen Weg zeigt.',
        text_enemy: 'שמע! Hör das Flirren, das dich zerschneidet.',
        damage: 45,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 45 Schaden – dein Lauschen kuppelt das Licht aus.',
      },
      'אמת': {
        next: 'truth',
        text_player: 'אמת! Ich richte das Licht an der Wahrheit aus.',
        text_enemy: 'אמת! Ich beuge den Strahl meinem Urteil.',
        damage: 54,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 54 Schaden – Wahrheit spaltet seinen Lichtmantel.',
      },
      'מלאך': {
        next: 'angelic',
        text_player: 'מלאך! Bote, gleite durch den Strahl.',
        text_enemy: 'מלאך! Meine Boten weben Lichtketten um dich.',
        damage: 58,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 58 Schaden durch den absteigenden Boten.',
      },
      'ברך': {
        next: 'blessing',
        text_player: 'ברכה! Ich verwandle das harte Licht in heilenden Glanz.',
        text_enemy: 'ברכה! Mein Licht erhebt nur mich.',
        damage: 40,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 40 Schaden, als der Segen seine Schatten vertreibt.',
      },
      'אור': {
        next: 'radiantPrism',
        text_player: 'אור! Ich halte das Licht, bis es sich bricht.',
        text_enemy: 'אור! Ich schließe dich in eine Klinge aus purem Strahl.',
      },
    },
  },
  overgrown: {
    intro_player: {
      speaker: 'narrator',
      text: 'חיים greifen nach dir. Sporen glimmen ueber dem Boden.',
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
        next: 'flooded',
        text_player: 'מים! Fuehr das Leben zum Fluss.',
        text_enemy: 'מים! Ich lenke das Wachsen in Stroeme, die dich treffen.',
      },
      'קול': {
        next: 'echoing',
        text_player: 'קול! Ruhe, Leben.',
        text_enemy: 'קול! Ich befehle dem Wuchern, mich zu hoeren und dich zu schlagen.',
        damage: 15,
        damageText: '%opponent% erhaelt 15 Schaden durch peitschende Triebe.',
      },
      'חיים': {
        next: 'overgrown',
        text_player: 'חיים! Bleib in deinem Mass.',
        text_enemy: 'חיים! Ich ueberwuchere dich vollstaendig.',
      },
      'לא': {
        next: 'negation',
        text_player: 'לא! Ich schneide das Wuchern ab.',
        text_enemy: 'לא! Ich verweigere dir das Wachstum.',
        damage: 48,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 48 Schaden – dein Nein trennt jede Ranke an seiner Quelle.',
      },
      'שמע': {
        next: 'listening',
        text_player: 'שמע! Ich hoere, was das Leben fluestert.',
        text_enemy: 'שמע! Hoer wie das Gruen dich umarmt.',
        damage: 44,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 44 Schaden, weil dein Lauschen die Ranken umlenkt.',
      },
      'ברך': {
        next: 'blessing',
        text_player: 'ברכה! Segne das Leben, damit es dich schuetzt.',
        text_enemy: 'ברכה! Ich lasse das Gruen mich erheben.',
        damage: 53,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 53 Schaden – der Segen zwingt das Leben, ihn loszulassen.',
      },
    },
  },
  resonantTrap: {
    intro_player: {
      speaker: 'narrator',
      text: 'קול laedt sich selbst auf. Der Hall verschlingt jede Bewegung.',
    },
    intro_enemy: {
      text: 'קול auf קול – ich druecke dich in einen Klangkaefig.',
    },
    prompt_player: 'Wie entkommst du dem Klangkaefig?',
    damage: 65,
    failure_player: '%s - der Klangkaefig schnuert dir die Lunge ab.',
    failure_computer: '%s - der Kaefig bricht auf mich selbst.',
    failure_player_damageText: 'Bileam erhaelt 65 Schaden in der Resonanzfalle.',
    failure_computer_damageText: 'Der Gegner erhaelt 65 Schaden, die Resonanz zerquetscht ihn.',
    transitions: {
      'מים': {
        next: 'flooded',
        text_player: 'מים! Ich flute den Kaefig, bis der Klang erstickt.',
        text_enemy: 'מים! Ich ersaeufe deine Stimme.',
      },
      'אש': {
        next: 'burning',
        text_player: 'אש! Ich verbrenne den Hall zu Funken.',
        text_enemy: 'אש! Meine Flammen tanzen durch jeden Ton.',
      },
      'חיים': {
        next: 'overgrown',
        text_player: 'חיים! Ich lasse Wurzeln durch die Resonanz wachsen.',
        text_enemy: 'חיים! Lebende Fasern fesseln dich im Beat.',
      },
      'אמת': {
        next: 'truth',
        text_player: 'אמת! Wahrheit zerschneidet die Flut aus Tönen.',
        text_enemy: 'אמת! Ich baue meinen Kaefig mit Spiegeln.',
        damage: 54,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 54 Schaden – Wahrheit zerreisst den Klangkaefig.',
      },
      'שמע': {
        next: 'listening',
        text_player: 'שמע! Ich hoere, bis der Kaefig zu Staub zerfaellt.',
        text_enemy: 'שמע! Hoer wie ich dich im Kaefig erdruecke.',
        damage: 46,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 46 Schaden, weil dein Lauschen den Tonkäfig lockert.',
      },
      'לא': {
        next: 'negation',
        text_player: 'לא! Kein weiterer Klang.',
        text_enemy: 'לא! Ich verbiete dir, dich zu bewegen.',
        damage: 52,
        damageTarget: 'enemy',
      damageText: '%opponent% erleidet 52 Schaden – dein Nein verbietet dem Echo zu bestehen.',
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
      'דבר': {
        next: 'spoken',
        text_player: 'דבר! Ich benenne jeden Strahl, bis er weich wird.',
        text_enemy: 'דבר! Ich lasse jedes Prisma meine Worte vervielfachen.',
      },
      'ברך': {
        next: 'blessing',
        text_player: 'ברכה! Ich wandle den schneidenden Glanz in Heilung.',
        text_enemy: 'ברכה! Mein Prisma badet mich in eigenem Glanz.',
      },
      'מלאך': {
        next: 'angelic',
        text_player: 'מלאך! Bote, führe mich zwischen den Spiegeln hindurch.',
        text_enemy: 'מלאך! Meine Boten halten jede Fläche geschlossen.',
      },
      'שמע': {
        next: 'listening',
        text_player: 'שמע! Ich lausche, bis ich die eine wahre Stimme erkenne.',
        text_enemy: 'שמע! Höre nur mich, nicht die tausend Reflexionen.',
      },
    },
  },
  blessingOrbit: {
    intro_player: {
      speaker: 'narrator',
      text: 'ברכה kreist wie Planetenlicht. Zu viel Glanz kann verbrennen.',
    },
    intro_enemy: {
      text: 'ברכה umkreist mich. Ich trinke gierig davon.',
    },
    prompt_player: 'Wie lenkst du die überschäumende Gnade?',
    damage: 60,
    failure_player: '%s - der Kreis schliesst sich und schnürt deinen Atem.',
    failure_computer: '%s - der Orbit schlägt zurück und verbrennt mich.',
    transitions: {
      'מלאך': {
        next: 'angelic',
        text_player: 'מלאך! Bote, trage den Segen weg, bevor er explodiert.',
        text_enemy: 'מלאך! Der Kreis folgt nur mir.',
      },
      'שמע': {
        next: 'listening',
        text_player: 'שמע! Ich lausche, bis die Umlaufbahn ihren Rhythmus verliert.',
        text_enemy: 'שמע! Höre, wie der Kreis dich einschnürt.',
      },
      'אמת': {
        next: 'truth',
        text_player: 'אמת! Ich prüfe, welcher Teil des Segens bleiben darf.',
        text_enemy: 'אמת! Meine Wahrheit macht den Orbit hart wie Stein.',
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
      'אמת': {
        next: 'truth',
        text_player: 'אמת! Ich stelle jede Stimme vor den Spiegel.',
        text_enemy: 'אמת! Ich lasse die Wahrheit nur meinen Ton tragen.',
      },
      'ברך': {
        next: 'blessing',
        text_player: 'ברכה! Ich segne den Chor, bis er sanft wird.',
        text_enemy: 'ברכה! Mein Chor badet im eigenen Glanz.',
      },
      'שמע': {
        next: 'listening',
        text_player: 'שמע! Ich unterscheide jede Stimme, bis Stille bleibt.',
        text_enemy: 'שמע! Höre nur auf meinen Befehl.',
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
        text_player: 'אמת! Ich richte das Licht am Spiegel der Wahrheit aus.',
        text_enemy: 'אמת! Ich zwinge die Strahlen zu meinem Urteil.',
      },
      'מלאך': {
        next: 'angelic',
        text_player: 'מלאך! Bote, führe mich zwischen den Spektren hindurch.',
        text_enemy: 'מלאך! Meine Boten halten jede Öffnung geschlossen.',
      },
      'שמע': {
        next: 'listening',
        text_player: 'שמע! Ich lausche, bis ich die schwächste Stelle finde.',
        text_enemy: 'שמע! Höre nur das Klingen, das dich fesselt.',
      },
    },
  },
  },
};
