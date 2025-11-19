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
  obedienceEcho: {
    intro_player: {
      speaker: 'narrator',
      text: 'Gehorche! Der Befehl hallt zwischen Felsen, jeder Ton will dich lenken.',
    },
    intro_enemy: {
      text: 'Ich ertränke dich in Wiederholungen, bis du gehorchst.',
    },
    prompt_player: 'Wie entkommst du diesem Gehorsams-Hall?',
    damage: 55,
    failure_player: '%s - du gehorchst und der Hall verschlingt dich.',
    failure_computer: '%s - der Hall verheddert mich selbst.',
    transitions: {
      'קול': {
        next: 'obedienceBind',
        text_player: 'קול! Ich lenke den Befehl tiefer in meinen eigenen Klang.',
        text_enemy: 'קול! Ich schicke dir Befehl auf Befehl, bis nur noch Gehorchen bleibt.',
      },
      'מים': {
        next: 'flooded',
        text_player: 'מים! Ich lasse die Wiederholung davonspülen.',
        text_enemy: 'מים! Ich erzeuge einen Strom von Befehlen.',
      },
      'אש': {
        next: 'burning',
        text_player: 'אש! Ich verbrenne den Hall, bis nur Hitze bleibt.',
        text_enemy: 'אש! Ich lasse meine Drohung in Flammen springen.',
      },
    },
  },
  obedienceBind: {
    intro_player: {
      speaker: 'narrator',
      text: 'Der Befehl legt sich wie Riemen um deine Brust. Jeder Impuls verlangt Gehorsam.',
    },
    intro_enemy: {
      text: 'Meine Worte wickeln sich um dich. Du wirst gehorchen.',
    },
    prompt_player: 'Wie beantwortest du das gebundene Gehorchen?',
    damage: 58,
    failure_player: '%s - du gehorchst blind und deine Kraft versiegt.',
    failure_computer: '%s - ich gehorche blind und verliere die Kontrolle.',
    failure_player_damageText: 'Bileam erleidet 58 Schaden, weil die Gehorsamsriemen ihn würgen.',
    failure_computer_damageText: 'Balak erleidet 58 Schaden, der Gehorsam zerreißt seine Brust.',
    transitions: {
      'לא': {
        next: 'negation',
        text_player: 'לא! Ich werde abgewiesen, also stoße ich diesen Befehl zurück.',
        text_enemy: 'לא! Ich werde abgewiesen und wuchte dich hinaus.',
        damage: 48,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 48 Schaden, weil dein Nein das Gehorchen zerreißt.',
      },
      'אש': {
        next: 'burning',
        text_player: 'אש! Ich lasse die Fesseln im Feuer verglühen.',
        text_enemy: 'אש! Ich lasse das gebotene Feuer dich bedrängen.',
      },
      'מים': {
        next: 'flooded',
        text_player: 'מים! Ich verwandle die Fesseln in Fluss und schwimme frei.',
        text_enemy: 'מים! Ich halte dich unter der Oberfläche meines Befehls.',
      },
      'קול': {
        next: 'resonantTrap',
        text_player: 'קול! Ich forme den Gehorsam zu einem Echo nach meinen Regeln.',
        text_enemy: 'קול! Meine Stimme presst dich in den Hall zurück.',
      },
    },
  },
  steamChamber: {
    intro_player: {
      speaker: 'narrator',
      text: 'Dampf umschlingt dich. Wasser und Feuer stoßen sich und suchen Form.',
    },
    intro_enemy: {
      text: 'Der Dampf kriecht über meine Arme. Ich suche einen Weg aus der Hitze.',
    },
    prompt_player: 'Wie lenkst du den Dampf?',
    damage: 45,
    failure_player: '%s - der Dampf schneidet dich wie Glas.',
    failure_computer: '%s - der Dampf frisst an mir, ich verliere die Kontrolle.',
    transitions: {
      'קול': {
        next: 'resonantTrap',
        text_player: 'קול! Ich singe durch den Dampf, bis der Hall zerreißt.',
        text_enemy: 'קול! Ich verdichte den Dampf zu einem brüllenden Hall.',
      },
      'חיים': {
        next: 'overgrown',
        text_player: 'חיים! Ich lasse nasses Grün entstehen, das die Hitze bändigt.',
        text_enemy: 'חיים! Ich lasse nasses Rankenwerk nach dir greifen.',
      },
      'אש': {
        next: 'radiant',
        text_player: 'אש! Ich ziehe die Hitze zurück ins Licht.',
        text_enemy: 'אש! Ich schicke glühende Ströme zurück auf dich.',
      },
      'מים': {
        next: 'flooded',
        text_player: 'מים! Ich lasse den Dampf wieder zu Fluss werden.',
        text_enemy: 'מים! Ich breche den Dampf auf und lenke ihn als Strömung.',
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
      'דבר': {
        next: 'spoken',
        text_player: 'דבר! Forme das Nein zu Sprache.',
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
        next: 'radiant',
        text_player: 'אש! Ich brenne das Nein zu neuer Glut und lenke es ins Licht.',
        text_enemy: 'אש! Ich schuere mein Nein zu einem Fluch.',
      },
    },
  },
  listening: {
    intro_player: {
      speaker: 'narrator',
      text: 'שמע – eine Stimme befiehlt dir zu gehorchen; alles andere verstummt.',
    },
    intro_enemy: {
      text: 'שמע heißt: „Gehorche mir.“ Ich will deine Stimme beugen.',
    },
    prompt_player: 'Was folgt auf das Hoeren?',
    damage: 45,
    failure_player: '%s - dein Lauschen bleibt leer, der Schlag trifft dich.',
    failure_computer: '%s - ich hoere meine eigene Luege und stolpere.',
    failure_player_damageText: 'Bileam erhaelt 45 Schaden im Widerhall.',
    failure_computer_damageText: 'Balak erleidet 45 Schaden, sein Hall bricht.',
    transitions: {
      'לא': {
        next: 'negation',
        text_player: 'לא! Ich werde abgewiesen, darum gehorche ich nicht und stelle mein Nein vor dich.',
        text_enemy: 'לא! Ich werde abgewiesen und lasse dich fühlen, was Gehorsam verweigert.',
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
        next: 'steamChamber',
        text_player: 'מים! Nebel, nimm die Glut.',
        text_enemy: 'מים! Ich ersticke mein Feuer und wende mich gegen dich.',
      },
      'לא': {
        next: 'negation',
        text_player: 'לא! Ich werde abgewiesen – sogar das Feuer gehört nur mir.',
        text_enemy: 'לא! Ich werde abgewiesen und verweigere dir jede Glut.',
        damage: 52,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 52 Schaden, als dein abgewiesenes Nein das Feuer erstickt.',
      },
      'קול': {
        next: 'echoing',
        text_player: 'קול! Ich singe gegen das Feuer an, bis es weicht.',
        text_enemy: 'קול! Ich lasse Donner wie Funken auf dich fallen.',
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
      'חיים': {
        next: 'overgrown',
        text_player: 'חיים! Ich lasse Ranken aus dem Strom greifen.',
        text_enemy: 'חיים! Mein Wasser wuchert wie Rankwerk.',
        damage: 15,
        damageText: '%opponent% erhaelt 15 Schaden durch wuchernde Ranken.',
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
        next: 'overgrown',
        text_player: 'מים! Ich lenke den Hall in Ströme.',
        text_enemy: 'מים! Ich ertränke deinen Widerhall.',
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
      'דבר': {
        next: 'resonantTrap',
        text_player: 'דבר! Ich halte das Wort fest und leite es in den Hall.',
        text_enemy: 'דבר! Ich lenke jede Silbe zu meinem Urteil.',
        damage: 44,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 44 Schaden, weil dein gesprochenes Urteil sich festbeißt.',
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
      'דבר': {
        next: 'spoken',
        text_player: 'דבר! Ich fasse die Wahrheit in klares Wort.',
        text_enemy: 'דבר! Ich spreche die Wahrheit, damit du kniest.',
        damage: 48,
        damageTarget: 'enemy',
        damageText: '%opponent% erleidet 48 Schaden – das Wort bindet die ausgesprochene Wahrheit.',
      },
      'קול': {
        next: 'echoing',
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
        text_enemy: 'מים! Ich ertränke deinen Segen.',
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
        next: 'start',
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
        next: 'burning',
        text_player: 'מים! Fuehr das Leben zum Fluss.',
        text_enemy: 'מים! Ich lenke das Wachsen in Stroeme, die dich treffen.',
      },
      'קול': {
        next: 'radiant',
        text_player: 'קול! Ruhe, Leben.',
        text_enemy: 'קול! Ich befehle dem Wuchern, mich zu hoeren und dich zu schlagen.',
        damage: 15,
        damageText: '%opponent% erhaelt 15 Schaden durch peitschende Triebe.',
      },
      'חיים': {
        next: 'truth',
        text_player: 'חיים! Bleib in deinem Mass.',
        text_enemy: 'חיים! Ich ueberwuchere dich vollstaendig.',
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
    failure_player: '%s - der Kreis schliesst sich und schnürt deinen Atem.',
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
        next: 'echoing',
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
