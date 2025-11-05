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
      text: 'Ich balle die Fäuste.\nDie Luft knistert, Worte glühen.',
      duration: 1500,
    },
    prompt_player: 'Welches Wort entfesselst du?',
    damage: 10,
    failure_player: '%s - dein Atem verfliegt, nichts reagiert.',
    failure_computer: '%s - ich presse das Wort, doch nichts gehorcht mir.',
    failure_player_damageText: 'Bileam erhält 10 Schaden im Rückstoß.',
    failure_computer_damageText: 'Der Gegner erleidet 10 Schaden, sein Wille splittert.',
    transitions: {
      'אש': {
        next: 'burning',
        text_player: 'אש! Funken fräsen sich in dein Fleisch.',
        text_enemy: 'אש! Ich entzünde die Luft um dich.',
      },
      'מים': {
        next: 'flooded',
        text_player: 'מים! Ströme, haltet ihn.',
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
    },
  },
  burning: {
    intro_player: {
      speaker: 'narrator',
      text: 'אש kriecht über deine Ärmel. Hitze summt in der Luft.',
    },
    intro_enemy: null,
    sequence_enemy: [
      {
        speaker: 'sequence',
        text: 'אש frisst durch mich. Hitze summt in meinem Blut.',
      },
    ],
    prompt_player: 'Wie löschst du die Flammen?',
    damage: 24,
    failure_player: '%s - die Glut frisst tiefer in dein Fleisch.',
    failure_computer: '%s - ich knirsche, mein Körper brennt in der Glut.',
    failure_player_damageText: 'Bileam erhält 24 Schaden im Feuer.',
    failure_computer_damageText: 'Der Gegner erleidet 24 Schaden in der Glut.',
    transitions: {
      'מים': {
        next: 'start',
        text_player: 'מים! Nebel, nimm die Glut.',
        text_enemy: 'מים! Ich ersticke mein Feuer und wende mich gegen dich.',
      },
      'קול': {
        next: 'echoing',
        text_player: 'קול! Donner, zerreiß die Flammen.',
        text_enemy: 'קול! Meine Stimme stößt dich zurück.',
        damage: 8,
        damageText: '%opponent% erhält 8 Klangschläge Schaden.',
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
    damage: 18,
    failure_player: '%s - Dampf schlägt zurück, die Flut reißt dich zu Boden.',
    failure_computer: {
      speaker: 'sequence',
      text: '%s - das Wasser spült mir die Worte aus dem Leib.',
    },
    failure_player_damageText: 'Bileam erhält 18 Schaden in der Strömung.',
    failure_computer_damageText: 'Der Gegner wird von der Strömung verletzt.',
    transitions: {
      'אש': {
        only: 'enemy',
        next: 'burning',
        text_enemy: 'אש! Ich verdampfe deinen Schutz.',
      },
      'קול': {
        next: 'echoing',
        text_player: 'קול! Wasser, sing nach meinem Willen.',
        text_enemy: 'קול! Ich lenke die Strömung gegen dich.',
      },
      'חיים': {
        next: 'overgrown',
        text_player: 'חיים! Ranken, haltet ihn.',
        text_enemy: 'חיים! Ich lasse Moos an dir hochkriechen.',
        damage: 6,
        damageText: '%opponent% erhält 6 Schaden durch wuchernde Ranken.',
      },
    },
  },
  echoing: {
    intro_player: {
      speaker: 'narrator',
      text: 'קול drückt in deine Schläfen. Fels vibriert im Takt.',
    },
    intro_enemy: {
      text: 'קול schwingt durch mich. Ich jage dem hallenden Wort hinterher.',
    },
    prompt_player: 'Mit welchem Wort stellst du die Resonanz?',
    damage: 18,
    failure_player: '%s - dein Klang reißt zurück und zerschneidet dich.',
    failure_computer: '%s - ich verstumme, Risse laufen durch mich wie Notenlinien.',
    failure_player_damageText: 'Bileam erhält 18 Schaden in der Resonanz.',
    failure_computer_damageText: 'Der Gegner erleidet 18 Schaden, Risse singen in ihm.',
    transitions: {
      'קול': {
        next: 'start',
        text_player: 'קול! Gehorche mir und werde still.',
        text_enemy: 'קול! Schweig und gehorche mir.',
      },
      'מים': {
        next: 'flooded',
        text_player: 'מים! Fluss, höre meinen Takt.',
        text_enemy: 'מים! Ich lenke das Echo in die Strömung.',
      },
      'אש': {
        next: 'burning',
        text_player: 'אש! Klang, entzünde dich.',
        text_enemy: 'אש! Ich schmiede Donner zu Flammen.',
      },
      'חיים': {
        next: 'overgrown',
        text_player: 'חיים! Wucher, tanze nach meinem Klang.',
        text_enemy: 'חיים! Ich lasse Wachstum meinem Klang folgen.',
      },
      'דבר': {
        next: 'spoken',
        text_player: 'דבר! Worte, binde den Klang.',
        text_enemy: 'דבר! Ich befehle dem Echo.',
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
    damage: 20,
    failure_player: '%s - dein Wort zerfranst, erdrückt dich mit Silben.',
    failure_computer: '%s - ich verschlucke meine Worte, mein Leib platzt auf.',
    failure_player_damageText: 'Bileam erhält 20 Schaden im Widerhall der Worte.',
    failure_computer_damageText: 'Der Gegner erleidet 20 Schaden, seine Worte reiben ihn auf.',
    transitions: {
      'קול': {
        next: 'echoing',
        text_player: 'קול! Stimme, folge meinem Gesetz.',
        text_enemy: 'קול! Ich befehle dem Hall, dich zu zerschneiden.',
        damage: 8,
        damageText: '%opponent% erhält 8 Schaden durch schnappende Silben.',
      },
      'מים': {
        next: 'flooded',
        text_player: 'מים! Sprachfluss, mäßige dich.',
        text_enemy: 'מים! Ich lasse Worte wie Sturm auf dich prallen.',
      },
      'אש': {
        next: 'burning',
        text_player: 'אש! Verse, lodert auf.',
        text_enemy: 'אש! Ich entzünde jedes Wort, das ich spreche.',
      },
      'אמת': {
        next: 'truth',
        text_player: 'אמת! Wahrheit, durchdringe die Lüge.',
        text_enemy: 'אמת! Ich zeige dir mein Gesetz als Spiegel.',
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
    damage: 22,
    failure_player: '%s - der Spiegel zerspringt, Splitter schneiden dich.',
    failure_computer: '%s - die Wahrheit schnürt mich, Risse entstehen.',
    failure_player_damageText: 'Bileam erhält 22 Schaden an schneidender Einsicht.',
    failure_computer_damageText: 'Der Gegner erhält 22 Schaden durch spiegelnde Kanten.',
    transitions: {
      'דבר': {
        next: 'spoken',
        text_player: 'דבר! Forme die Wahrheit mit Sprache.',
        text_enemy: 'דבר! Ich fasse die Wahrheit in Befehl.',
      },
      'קול': {
        next: 'echoing',
        text_player: 'קול! Spiegel, erklinge in mir.',
        text_enemy: 'קול! Ich lasse Wahrheit als Klinge tönen.',
      },
      'מלאך': {
        next: 'angelic',
        text_player: 'מלאך! Bote, stelle dich zwischen uns.',
        text_enemy: 'מלאך! Ich rufe Boten, die dich fernhalten.',
      },
    },
  },
  angelic: {
    intro_player: {
      speaker: 'narrator',
      text: 'מלאך schwebt über dir. Schriftbahnen gleiten durchs Licht.',
    },
    intro_enemy: {
      text: 'מלאך brennt durch mich. Mein Kern erzittert.',
    },
    prompt_player: 'Welche Antwort schickst du zu den Boten?',
    damage: 24,
    failure_player: '%s - die Bahnen schneiden dich, Licht wird zu Peitschen.',
    failure_computer: '%s - ich flackere, Glyphen reißen aus mir heraus.',
    failure_player_damageText: 'Bileam erhält 24 Schaden am Feuer der Boten.',
    failure_computer_damageText: 'Der Gegner erhält 24 Schaden, Glyphen reißen aus.',
    transitions: {
      'אמת': {
        next: 'truth',
        text_player: 'אמת! Halte die Boten im Gleichgewicht.',
        text_enemy: 'אמת! Ich lenke die Boten als Spiegel.',
      },
      'ברכה': {
        next: 'blessing',
        text_player: 'ברכה! Segen, öffne die Bahnen.',
        text_enemy: 'ברכה! Ich zwinge dich mit meinem Segen.',
      },
      'ארור': {
        next: 'curse',
        text_player: 'ארור! Fluch, trenne mich von den Boten.',
        text_enemy: 'ארור! Ich binde deinen Atem mit Fluch.',
      },
    },
  },
  blessing: {
    intro_player: {
      speaker: 'narrator',
      text: 'ברכה rinnt wie warmes Gold durch deine Finger.',
    },
    intro_enemy: {
      text: 'ברכה umhüllt mich, doch mein Blick bleibt hart.',
    },
    prompt_player: 'Wie formst du den Segen?',
    damage: 20,
    failure_player: '%s - der Segen kehrt sich um und lähmt deine Zunge.',
    failure_computer: '%s - ich ertrinke im Glanz, meine Glieder reißen.',
    failure_player_damageText: 'Bileam erhält 20 Schaden durch überschäumende Gnade.',
    failure_computer_damageText: 'Der Gegner erhält 20 Schaden im Strahlenstrom.',
    transitions: {
      'מלאך': {
        next: 'angelic',
        text_player: 'מלאך! Trag den Segen weiter.',
        text_enemy: 'מלאך! Ich lenke den Glanz auf dich.',
      },
      'ארור': {
        next: 'curse',
        text_player: 'ארור! Ich halte den Segen im Zaum.',
        text_enemy: 'ארור! Ich verschlinge deinen Segen mit einem Fluch.',
      },
      'המלחמה': {
        next: 'battle',
        text_player: 'המלחמה! Segen, werde Schild im Kampf.',
        text_enemy: 'המלחמה! Ich verwandle meinen Glanz in Klingen.',
      },
    },
  },
  curse: {
    intro_player: {
      speaker: 'narrator',
      text: 'ארור schmeckt bitter. Luft wird zu Eis.',
    },
    intro_enemy: {
      text: 'ארור tropft von mir. Meine Worte werden Gift.',
    },
    prompt_player: 'Wie brichst du den Fluch?',
    damage: 20,
    failure_player: '%s - der Fluch greift nach deinem Herzen.',
    failure_computer: '%s - der Fluch krümmt mich gegen mich selbst.',
    failure_player_damageText: 'Bileam erhält 20 Schaden im Fluchgriff.',
    failure_computer_damageText: 'Der Gegner erhält 20 Schaden, der Fluch frisst ihn.',
    transitions: {
      'ברכה': {
        next: 'blessing',
        text_player: 'ברכה! Brich den Fluch.',
        text_enemy: 'ברכה! Ich überstrahle deinen Fluch mit Segen.',
      },
      'מלאך': {
        next: 'angelic',
        text_player: 'מלאך! Bote, nimm den Fluch.',
        text_enemy: 'מלאך! Ich sende den Fluch über dich.',
      },
      'המלחמה': {
        next: 'battle',
        text_player: 'המלחמה! Fluch, werde Strategie.',
        text_enemy: 'המלחמה! Ich mache aus dem Fluch einen Schlag.',
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
    damage: 20,
    failure_player: '%s - das Licht durchdringt dich, Metall liegt auf deiner Zunge.',
    failure_computer: '%s - ich zerfalle zu Glas, doch das Leuchten bleibt.',
    failure_player_damageText: 'Bileam erhält 20 Schaden im Licht.',
    failure_computer_damageText: 'Der Gegner erhält 20 Schaden, Licht zerfrisst den Stein.',
    transitions: {
      'קול': {
        next: 'echoing',
        text_player: 'קול! Sing das Licht in Schatten.',
        text_enemy: 'קול! Ich lasse Licht als Donner auf dich prallen.',
      },
      'מים': {
        next: 'flooded',
        text_player: 'מים! Brech dieses Licht zu Regen.',
        text_enemy: 'מים! Ich zersplittere das Licht in Regen auf dir.',
      },
      'חיים': {
        next: 'overgrown',
        keepActor: true,
        text_player: 'חיים! Wachse im Licht und halte ihn fest.',
        text_enemy: 'חיים! Ich lasse leuchtendes Wachstum nach dir greifen.',
        damage: 10,
        damageText: '%opponent% erhält 10 Schaden durch leuchtendes Wachstum.',
      },
      'אש': {
        next: 'burning',
        text_player: 'אש! Verbrenne das Licht zu Funken.',
        text_enemy: 'אש! Ich verdichte das Licht zu Glut gegen dich.',
        damage: 12,
        damageText: '%opponent% erhält 12 Schaden aus blendender Glut.',
      },
    },
  },
  battle: {
    intro_player: {
      speaker: 'narrator',
      text: 'המלחמה hallt wie ferne Trommeln.',
    },
    intro_enemy: {
      text: 'המלחמה donnert durch mich. Ich richte mich zu voller Größe.',
    },
    prompt_player: 'Wie führst du den Kampf?',
    damage: 26,
    failure_player: '%s - der Kampf zergliedert dich, Atem stockt.',
    failure_computer: '%s - die Schlacht bricht mich, doch ich stehe noch.',
    failure_player_damageText: 'Bileam erhält 26 Schaden in der Schlacht.',
    failure_computer_damageText: 'Der Gegner erhält 26 Schaden, Trommeln sprengen ihn.',
    transitions: {
      'אש': {
        next: 'burning',
        text_player: 'אש! Kampf, entzünde dich.',
        text_enemy: 'אש! Ich entzünde den Kampf in mir.',
      },
      'מים': {
        next: 'flooded',
        text_player: 'מים! Schlacht, kühle dich.',
        text_enemy: 'מים! Ich reiße dich mit wie ein Sturm.',
      },
      'אמת': {
        next: 'truth',
        text_player: 'אמת! Kampf, stelle dich dem Spiegel.',
        text_enemy: 'אמת! Ich beuge die Schlacht meinem Urteil.',
      },
      'ברכה': {
        next: 'blessing',
        text_player: 'ברכה! Kampf, werde Schutz.',
        text_enemy: 'ברכה! Ich kröne mich mitten im Kampf.',
      },
      'ארור': {
        next: 'curse',
        text_player: 'ארור! Kampf, sollst nicht verderben.',
        text_enemy: 'ארור! Ich verfluche deinen Widerstand.',
      },
    },
  },
  overgrown: {
    intro_player: {
      speaker: 'narrator',
      text: 'חיים greifen nach dir. Sporen glimmen über dem Boden.',
    },
    intro_enemy: {
      text: 'חיים sprießen aus mir. Ich knirsche unter Ranken.',
    },
    prompt_player: 'Wie beantwortest du das Wachsen?',
    damage: 16,
    failure_player: '%s - die Ranken ziehen dich zu Boden.',
    failure_computer: '%s - das Leben in mir wird wild, ich zerreiße mich fast.',
    failure_player_damageText: 'Bileam erhält 16 Schaden zwischen Ranken.',
    failure_computer_damageText: 'Der Gegner erhält 16 Schaden, Holzplatten splittern.',
    transitions: {
      'אש': {
        next: 'burning',
        text_player: 'אש! Brenne diese Ranken fort.',
        text_enemy: 'אש! Ich verwandle Wachstum in Asche um dich.',
      },
      'מים': {
        next: 'flooded',
        text_player: 'מים! Führ das Leben zum Fluss.',
        text_enemy: 'מים! Ich lenke das Wachsen in Ströme, die dich treffen.',
      },
      'קול': {
        next: 'echoing',
        text_player: 'קול! Ruhe, Leben.',
        text_enemy: 'קול! Ich befehle dem Wuchern, mich zu hören und dich zu schlagen.',
        damage: 6,
        damageText: '%opponent% erhält 6 Schaden durch peitschende Triebe.',
      },
      'חיים': {
        next: 'overgrown',
        keepActor: true,
        text_player: 'חיים! Bleib in deinem Maß.',
        text_enemy: 'חיים! Ich überwuchere dich vollständig.',
      },
    },
  },
};
