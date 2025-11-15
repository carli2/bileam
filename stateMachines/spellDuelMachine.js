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
    damage: 10,
    failure_player: '%s - dein Atem verfliegt, nichts reagiert.',
    failure_computer: '%s - ich presse das Wort, doch nichts gehorcht mir.',
    failure_player_damageText: 'Bileam erhaelt 10 Schaden im Rueckstoss.',
    failure_computer_damageText: 'Der Gegner erleidet 10 Schaden, sein Wille splittert.',
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
        text_player: 'קול! Stimme, zerreiss die Schlucht.',
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
      },
      'שמע': {
        next: 'listening',
        text_player: 'שמע! Ich hoere, bevor ich spreche.',
        text_enemy: 'שמע! Hoer mich, Lehrling.',
      },
      'ברכה': {
        next: 'blessing',
        text_player: 'ברכה! Segen, stroeme durch mich.',
        text_enemy: 'ברכה! Ich ueberschuette dich mit Glanz.',
      },
      'דבר': {
        next: 'spoken',
        text_player: 'דבר! Wort, das geschieht.',
        text_enemy: 'דבר! Ich befehle dir zu knien.',
      },
      'אמת': {
        next: 'truth',
        text_player: 'אמת! Spiegel, enthuelle ihn.',
        text_enemy: 'אמת! Ich zwinge dich in mein Gesetz.',
      },
      'מלאך': {
        next: 'angelic',
        text_player: 'מלאך! Bote, steige nieder.',
        text_enemy: 'מלאך! Ich rufe Boten, die dich bannen.',
      },
      'ארור': {
        next: 'curse',
        text_player: 'ארור! Dein Fluch kehrt zurueck.',
        text_enemy: 'ארור! Ich beschwoere den Fluch ueber dich.',
      },
      'המלחמה': {
        next: 'battle',
        text_player: 'המלחמה! Kampf, stell dich mir.',
        text_enemy: 'המלחמה! Ich fuehre Krieg gegen dich.',
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
    damage: 16,
    failure_player: '%s - das Nein faellt auf dich zurueck.',
    failure_computer: '%s - das Nein frisst meinen eigenen Befehl.',
    failure_player_damageText: 'Bileam erhaelt 16 Schaden durch zurueckspringende Verneinung.',
    failure_computer_damageText: 'Balak erleidet 16 Schaden, sein Nein zerschneidet ihn.',
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
      'ברכה': {
        next: 'blessing',
        text_player: 'ברכה! Aus dem Nein wird Segen.',
        text_enemy: 'ברכה! Ich zwinge das Nein zum Segen.',
      },
      'מלאך': {
        next: 'angelic',
        text_player: 'מלאך! Bote, trage das Nein.',
        text_enemy: 'מלאך! Ich sende Boten, die dein Nein brechen.',
      },
      'המלחמה': {
        next: 'battle',
        text_player: 'המלחמה! Ich stelle mein Nein in den Kampf.',
        text_enemy: 'המלחמה! Ich mache dein Nein zur Klinge.',
      },
      'ארור': {
        next: 'curse',
        text_player: 'ארור! Ich binde den Fluch mit meinem Nein.',
        text_enemy: 'ארור! Ich drehe dein Nein in einen Fluch.',
      },
      'אור': {
        next: 'radiant',
        text_player: 'אור! Lass das Nein im Licht bestehen.',
        text_enemy: 'אור! Ich zerbreche dein Nein im Licht.',
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
    damage: 18,
    failure_player: '%s - dein Lauschen bleibt leer, der Schlag trifft dich.',
    failure_computer: '%s - ich hoere meine eigene Luege und stolpere.',
    failure_player_damageText: 'Bileam erhaelt 18 Schaden im Widerhall.',
    failure_computer_damageText: 'Balak erleidet 18 Schaden, sein Hall bricht.',
    transitions: {
      'דבר': {
        next: 'spoken',
        text_player: 'דבר! Ich spreche, nachdem ich hoerte.',
        text_enemy: 'דבר! Ich verwandle Lauschen in Befehl.',
      },
      'אמת': {
        next: 'truth',
        text_player: 'אמת! Ich hoere die Wahrheit.',
        text_enemy: 'אמת! Meine Wahrheit wird dein Urteil.',
      },
      'ברכה': {
        next: 'blessing',
        text_player: 'ברכה! Was ich hoerte, wird Segen.',
        text_enemy: 'ברכה! Ich zwinge mein Lauschen zum Glanz.',
      },
      'לא': {
        next: 'negation',
        text_player: 'לא! Manche Stimmen verneine ich.',
        text_enemy: 'לא! Ich verweigere dir das Gehoerte.',
      },
      'מלאך': {
        next: 'angelic',
        text_player: 'מלאך! Bote, nimm dieses Hoeren.',
        text_enemy: 'מלאך! Die Boten hoeren auf mich, nicht auf dich.',
      },
      'אור': {
        next: 'radiant',
        text_player: 'אור! Das Gehoerte bricht als Licht hervor.',
        text_enemy: 'אור! Ich lasse das Licht auf deinem Lauschen lasten.',
      },
      'חיים': {
        next: 'overgrown',
        text_player: 'חיים! Das, was ich hoerte, waechst.',
        text_enemy: 'חיים! Ich lasse hoerendes Wachstum dich fesseln.',
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
    damage: 24,
    failure_player: '%s - die Glut frisst tiefer in dein Fleisch.',
    failure_computer: '%s - ich knirsche, mein Koerper brennt in der Glut.',
    failure_player_damageText: 'Bileam erhaelt 24 Schaden im Feuer.',
    failure_computer_damageText: 'Der Gegner erleidet 24 Schaden in der Glut.',
    transitions: {
      'מים': {
        next: 'start',
        text_player: 'מים! Nebel, nimm die Glut.',
        text_enemy: 'מים! Ich ersticke mein Feuer und wende mich gegen dich.',
      },
      'קול': {
        next: 'echoing',
        text_player: 'קול! Donner, zerreiss die Flammen.',
        text_enemy: 'קול! Meine Stimme stoesst dich zurueck.',
        damage: 8,
        damageText: '%opponent% erhaelt 8 Klangschlaege Schaden.',
      },
      'שמע': {
        next: 'listening',
        text_player: 'שמע! Ich hoere selbst in den Flammen.',
        text_enemy: 'שמע! Hoer wie das Feuer dich frisst.',
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
    damage: 18,
    failure_player: '%s - Dampf schlaegt zurueck, die Flut reisst dich zu Boden.',
    failure_computer: {
      speaker: 'sequence',
      text: '%s - das Wasser spuelt mir die Worte aus dem Leib.',
    },
    failure_player_damageText: 'Bileam erhaelt 18 Schaden in der Stroemung.',
    failure_computer_damageText: 'Der Gegner wird von der Stroemung verletzt.',
    transitions: {
      'אש': {
        only: 'enemy',
        next: 'burning',
        text_enemy: 'אש! Ich verdampfe deinen Schutz.',
      },
      'קול': {
        next: 'echoing',
        text_player: 'קול! Wasser, sing nach meinem Willen.',
        text_enemy: 'קול! Ich lenke die Stroemung gegen dich.',
      },
      'חיים': {
        next: 'overgrown',
        text_player: 'חיים! Ranken, haltet ihn.',
        text_enemy: 'חיים! Ich lasse Moos an dir hochkriechen.',
        damage: 6,
        damageText: '%opponent% erhaelt 6 Schaden durch wuchernde Ranken.',
      },
      'לא': {
        next: 'negation',
        text_player: 'לא! Der Strom gehorcht meinem Nein.',
        text_enemy: 'לא! Dein Fluss stockt unter meinem Befehl.',
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
    damage: 18,
    failure_player: '%s - dein Klang reisst zurueck und zerschneidet dich.',
    failure_computer: '%s - ich verstumme, Risse laufen durch mich wie Notenlinien.',
    failure_player_damageText: 'Bileam erhaelt 18 Schaden in der Resonanz.',
    failure_computer_damageText: 'Der Gegner erleidet 18 Schaden, Risse singen in ihm.',
    transitions: {
      'קול': {
        next: 'start',
        text_player: 'קול! Gehorche mir und werde still.',
        text_enemy: 'קול! Schweig und gehorche mir.',
      },
      'מים': {
        next: 'flooded',
        text_player: 'מים! Fluss, hoere meinen Takt.',
        text_enemy: 'מים! Ich lenke das Echo in die Stroemung.',
      },
      'אש': {
        next: 'burning',
        text_player: 'אש! Klang, entzuende dich.',
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
      'שמע': {
        next: 'listening',
        text_player: 'שמע! Ich hoere, was der Hall verschweigt.',
        text_enemy: 'שמע! Ich zwinge dich, meinem Hall zu lauschen.',
      },
      'לא': {
        next: 'negation',
        text_player: 'לא! Der Hall verstummt.',
        text_enemy: 'לא! Ich lasse deinen Klang kollabieren.',
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
    failure_player: '%s - dein Wort zerfranst, erdrueckt dich mit Silben.',
    failure_computer: '%s - ich verschlucke meine Worte, mein Leib platzt auf.',
    failure_player_damageText: 'Bileam erhaelt 20 Schaden im Widerhall der Worte.',
    failure_computer_damageText: 'Der Gegner erleidet 20 Schaden, seine Worte reiben ihn auf.',
    transitions: {
      'קול': {
        next: 'echoing',
        text_player: 'קול! Stimme, folge meinem Gesetz.',
        text_enemy: 'קול! Ich befehle dem Hall, dich zu zerschneiden.',
        damage: 8,
        damageText: '%opponent% erhaelt 8 Schaden durch schnappende Silben.',
      },
      'מים': {
        next: 'flooded',
        text_player: 'מים! Sprachfluss, maessige dich.',
        text_enemy: 'מים! Ich lasse Worte wie Sturm auf dich prallen.',
      },
      'אש': {
        next: 'burning',
        text_player: 'אש! Verse, lodert auf.',
        text_enemy: 'אש! Ich entzuende jedes Wort, das ich spreche.',
      },
      'אמת': {
        next: 'truth',
        text_player: 'אמת! Wahrheit, durchdringe die Luege.',
        text_enemy: 'אמת! Ich zeige dir mein Gesetz als Spiegel.',
      },
      'לא': {
        next: 'negation',
        text_player: 'לא! Ich stoppe das Wort, bevor es schadet.',
        text_enemy: 'לא! Ich verbiete dir zu reden.',
      },
      'שמע': {
        next: 'listening',
        text_player: 'שמע! Ich hoere, bevor ich weiter spreche.',
        text_enemy: 'שמע! Hoer meine Befehle!',
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
    failure_computer: '%s - die Wahrheit schnuert mich, Risse entstehen.',
    failure_player_damageText: 'Bileam erhaelt 22 Schaden an schneidender Einsicht.',
    failure_computer_damageText: 'Der Gegner erhaelt 22 Schaden durch spiegelnde Kanten.',
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
        text_player: 'מלאך! Bote, stelle dich zwischen uns.',
        text_enemy: 'מלאך! Ich rufe Boten, die dich fernhalten.',
      },
      'לא': {
        next: 'negation',
        text_player: 'לא! Ich halte die Wahrheit wie ein Schild.',
        text_enemy: 'לא! Ich verneine dein Urteil.',
      },
      'שמע': {
        next: 'listening',
        text_player: 'שמע! Ich lausche auf das wahre Wort.',
        text_enemy: 'שמע! Hoer auf meine Wahrheit.',
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
    damage: 24,
    failure_player: '%s - die Bahnen schneiden dich, Licht wird zu Peitschen.',
    failure_computer: '%s - ich flackere, Glyphen reissen aus mir heraus.',
    failure_player_damageText: 'Bileam erhaelt 24 Schaden am Feuer der Boten.',
    failure_computer_damageText: 'Der Gegner erhaelt 24 Schaden, Glyphen reissen aus.',
    transitions: {
      'אמת': {
        next: 'truth',
        text_player: 'אמת! Halte die Boten im Gleichgewicht.',
        text_enemy: 'אמת! Ich lenke die Boten als Spiegel.',
      },
      'ברכה': {
        next: 'blessing',
        text_player: 'ברכה! Segen, oeffne die Bahnen.',
        text_enemy: 'ברכה! Ich zwinge dich mit meinem Segen.',
      },
      'ארור': {
        next: 'curse',
        text_player: 'ארור! Fluch, trenne mich von den Boten.',
        text_enemy: 'ארור! Ich binde deinen Atem mit Fluch.',
      },
      'שמע': {
        next: 'listening',
        text_player: 'שמע! Ich hoere auf die Boten.',
        text_enemy: 'שמע! Hoer auf die Boten, die dich warnen.',
      },
      'לא': {
        next: 'negation',
        text_player: 'לא! Kein Bote befiehlt mir.',
        text_enemy: 'לא! Ich verneine deine himmlischen Spiele.',
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
    damage: 20,
    failure_player: '%s - der Segen kehrt sich um und laehmt deine Zunge.',
    failure_computer: '%s - ich ertrinke im Glanz, meine Glieder reissen.',
    failure_player_damageText: 'Bileam erhaelt 20 Schaden durch ueberschaeumende Gnade.',
    failure_computer_damageText: 'Der Gegner erhaelt 20 Schaden im Strahlenstrom.',
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
      'שמע': {
        next: 'listening',
        text_player: 'שמע! Ich hoere, wohin der Segen stroemt.',
        text_enemy: 'שמע! Hoer wie ich den Segen gegen dich wende.',
      },
      'לא': {
        next: 'negation',
        text_player: 'לא! Auch Segen braucht eine Grenze.',
        text_enemy: 'לא! Ich verweigere dir den Glanz.',
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
    failure_computer: '%s - der Fluch kruemmt mich gegen mich selbst.',
    failure_player_damageText: 'Bileam erhaelt 20 Schaden im Fluchgriff.',
    failure_computer_damageText: 'Der Gegner erhaelt 20 Schaden, der Fluch frisst ihn.',
    transitions: {
      'ברכה': {
        next: 'blessing',
        text_player: 'ברכה! Brich den Fluch.',
        text_enemy: 'ברכה! Ich ueberstrahle deinen Fluch mit Segen.',
      },
      'מלאך': {
        next: 'angelic',
        text_player: 'מלאך! Bote, nimm den Fluch.',
        text_enemy: 'מלאך! Ich sende den Fluch ueber dich.',
      },
      'המלחמה': {
        next: 'battle',
        text_player: 'המלחמה! Fluch, werde Strategie.',
        text_enemy: 'המלחמה! Ich mache aus dem Fluch einen Schlag.',
      },
      'לא': {
        next: 'negation',
        text_player: 'לא! Ich weise den Fluch zurueck.',
        text_enemy: 'לא! Ich verwehre dir den Schutz.',
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
    failure_player_damageText: 'Bileam erhaelt 20 Schaden im Licht.',
    failure_computer_damageText: 'Der Gegner erhaelt 20 Schaden, Licht zerfrisst den Stein.',
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
        text_player: 'חיים! Wachse im Licht und halte ihn fest.',
        text_enemy: 'חיים! Ich lasse leuchtendes Wachstum nach dir greifen.',
        damage: 10,
        damageText: '%opponent% erhaelt 10 Schaden durch leuchtendes Wachstum.',
      },
      'אש': {
        next: 'burning',
        text_player: 'אש! Verbrenne das Licht zu Funken.',
        text_enemy: 'אש! Ich verdichte das Licht zu Glut gegen dich.',
        damage: 12,
        damageText: '%opponent% erhaelt 12 Schaden aus blendender Glut.',
      },
      'שמע': {
        next: 'listening',
        text_player: 'שמע! Ich hoere selbst im Lichtblitz.',
        text_enemy: 'שמע! Hoer wie das Licht dich schneidet.',
      },
      'לא': {
        next: 'negation',
        text_player: 'לא! Ich daempfe das Licht.',
        text_enemy: 'לא! Dein Licht erlischt.',
      },
    },
  },
  battle: {
    intro_player: {
      speaker: 'narrator',
      text: 'המלחמה hallt wie ferne Trommeln.',
    },
    intro_enemy: {
      text: 'המלחמה donnert durch mich. Ich richte mich zu voller Groesse.',
    },
    prompt_player: 'Wie fuehrst du den Kampf?',
    damage: 26,
    failure_player: '%s - der Kampf zergliedert dich, Atem stockt.',
    failure_computer: '%s - die Schlacht bricht mich, doch ich stehe noch.',
    failure_player_damageText: 'Bileam erhaelt 26 Schaden in der Schlacht.',
    failure_computer_damageText: 'Der Gegner erhaelt 26 Schaden, Trommeln sprengen ihn.',
    transitions: {
      'אש': {
        next: 'burning',
        text_player: 'אש! Kampf, entzuende dich.',
        text_enemy: 'אש! Ich entzuende den Kampf in mir.',
      },
      'מים': {
        next: 'flooded',
        text_player: 'מים! Schlacht, kuehle dich.',
        text_enemy: 'מים! Ich reisse dich mit wie ein Sturm.',
      },
      'אמת': {
        next: 'truth',
        text_player: 'אמת! Kampf, stelle dich dem Spiegel.',
        text_enemy: 'אמת! Ich beuge die Schlacht meinem Urteil.',
      },
      'ברכה': {
        next: 'blessing',
        text_player: 'ברכה! Kampf, werde Schutz.',
        text_enemy: 'ברכה! Ich kroene mich mitten im Kampf.',
      },
      'ארור': {
        next: 'curse',
        text_player: 'ארור! Kampf, sollst nicht verderben.',
        text_enemy: 'ארור! Ich verfluche deinen Widerstand.',
      },
      'לא': {
        next: 'negation',
        text_player: 'לא! Ich beende den Schlag.',
        text_enemy: 'לא! Deine Klinge stoppt vor mir.',
      },
      'שמע': {
        next: 'listening',
        text_player: 'שמע! Ich hoere auf den Rhythmus des Kampfes.',
        text_enemy: 'שמע! Hoer auf das Trommeln meines Kriegs.',
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
    damage: 16,
    failure_player: '%s - die Ranken ziehen dich zu Boden.',
    failure_computer: '%s - das Leben in mir wird wild, ich zerreisse mich fast.',
    failure_player_damageText: 'Bileam erhaelt 16 Schaden zwischen Ranken.',
    failure_computer_damageText: 'Der Gegner erhaelt 16 Schaden, Holzplatten splittern.',
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
        damage: 6,
        damageText: '%opponent% erhaelt 6 Schaden durch peitschende Triebe.',
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
      },
      'שמע': {
        next: 'listening',
        text_player: 'שמע! Ich hoere, was das Leben fluestert.',
        text_enemy: 'שמע! Hoer wie das Gruen dich umarmt.',
      },
    },
  },
};
