import {
  ensureAmbience,
  setSceneContext,
  levelAmbiencePlan,
  fadeToBase,
  fadeToBlack,
  showLevelTitle,
  setLifeBars,
} from '../scene.js';
import {
  divineSay,
  applySceneConfig,
  cloneSceneProps,
} from './utils.js';

const LEVEL_MUSIC = [
  { sceneId: 'review_moab', track: 'מי האנשים האלה עמך.mp3' },
  { sceneId: 'review_angel', track: 'The Donkey\'s Cry.mp3' },
  { sceneId: 'review_altars', track: 'Echoes of the Divine.mp3' },
  { sceneId: 'review_truth', track: 'The Wizard and the King.mp3' },
  { sceneId: 'review_starlight', track: 'secher belam ben beor-full.mp3' },
];

const REVIEW_SCENES = [
  {
    id: 'review_moab',
    ambience: 'marketBazaar',
    wizardStartX: 72,
    donkeyOffset: -36,
    props: [
      { id: 'reviewMoabStallWest', type: 'marketStall', x: 212, align: 'ground', parallax: 0.92 },
      { id: 'reviewMoabStallEast', type: 'marketStall', x: 360, align: 'ground', parallax: 0.96 },
      { id: 'reviewMoabBalakFigure', type: 'balakFigure', x: 520, align: 'ground', parallax: 1.04 },
      { id: 'reviewMoabEnvoy', type: 'envoyShadow', x: 268, align: 'ground', parallax: 1.02 },
      { id: 'reviewMoabTrail', type: 'hoofSignTrail', x: 140, align: 'ground', parallax: 0.88 },
    ],
  },
  {
    id: 'review_angel',
    ambience: 'mirrorTower',
    wizardStartX: 84,
    donkeyOffset: -28,
    props: [
      { id: 'reviewAngelBlade', type: 'angelBladeForm', x: 256, align: 'ground', parallax: 0.98 },
      { id: 'reviewTerraceBasalt', type: 'basaltSpireTall', x: 180, align: 'ground', parallax: 0.9 },
      { id: 'reviewResonance', type: 'resonanceRingDormant', x: 420, align: 'ground', parallax: 1.06 },
      { id: 'reviewTerraceMist', type: 'canyonMist', x: -40, align: 'ground', offsetY: -50, parallax: 0.5 },
    ],
  },
  {
    id: 'review_altars',
    ambience: 'desertTravel',
    wizardStartX: 90,
    donkeyOffset: -32,
    props: [
      { id: 'reviewAltarNorth', type: 'altarGlyphPlateDormant', x: 160, align: 'ground', parallax: 0.94 },
      { id: 'reviewAltarCenter', type: 'altarGlyphPlateDormant', x: 316, align: 'ground', parallax: 0.98 },
      { id: 'reviewAltarSouth', type: 'altarGlyphPlateDormant', x: 468, align: 'ground', parallax: 1.02 },
      { id: 'reviewBlessingOrbit', type: 'blessingFragmentOrbit', x: 260, y: -48, parallax: 0.92, letter: 'ברך' },
      { id: 'reviewBalakAdvisor', type: 'balakAdvisor', x: 544, align: 'ground', parallax: 1.06 },
    ],
  },
  {
    id: 'review_truth',
    ambience: 'courtAudience',
    wizardStartX: 78,
    donkeyOffset: -34,
    props: [
      { id: 'reviewTruthPlateOne', type: 'pisgaAltarPlate', x: 160, align: 'ground', parallax: 0.92 },
      { id: 'reviewTruthPlateTwo', type: 'pisgaAltarPlate', x: 224, align: 'ground', parallax: 0.94 },
      { id: 'reviewTruthPlateThree', type: 'pisgaAltarPlate', x: 288, align: 'ground', parallax: 0.96 },
      { id: 'reviewTruthBanner', type: 'princeProcessionBanner', x: 110, align: 'ground', parallax: 0.88 },
      { id: 'reviewTruthBalak', type: 'balakFigure', x: 576, align: 'ground', parallax: 1.04 },
    ],
  },
  {
    id: 'review_starlight',
    ambience: 'sanctumFinale',
    wizardStartX: 96,
    donkeyOffset: -36,
    props: [
      { id: 'reviewShadowWest', type: 'shadowFracture', x: 162, align: 'ground', parallax: 0.92 },
      { id: 'reviewShadowCore', type: 'balakProcessCore', x: 320, align: 'ground', parallax: 0.98 },
      { id: 'reviewShadowEast', type: 'shadowFracture', x: 468, align: 'ground', parallax: 1.04 },
      { id: 'reviewActiveCore', type: 'balakProcessCoreActive', x: 320, align: 'ground', parallax: 1.02 },
    ],
  },
];

const GERMAN_SUMMARIES = {
  '22:1': 'Num 22,1 – Die Israeliten lagern in den Ebenen von Moab gegenüber Jericho.',
  '22:2': 'Num 22,2 – Balak Sohn Zippors sieht alles, was Israel den Amoriten antat.',
  '22:3': 'Num 22,3 – Moab fürchtet das Volk Israel sehr und ekelt sich vor seiner Nähe.',
  '22:4': 'Num 22,4 – Moab erklärt den Ältesten Midians, dass die Menge alles abfressen werde wie ein Rind das Gras, denn Balak ist ihr König.',
  '22:5': 'Num 22,5 – Balak sendet Boten zu Bileam nach Petor am Fluss in seinem Heimatland.',
  '22:6': 'Num 22,6 – Er bittet Bileam, Israel zu verfluchen, damit er es schlagen und vertreiben könne, denn dessen Segen gilt.',
  '22:7': 'Num 22,7 – Die Ältesten von Moab und Midian gehen mit Wahrsagerlohn zu Bileam und sprechen Balaks Worte.',
  '22:8': 'Num 22,8 – Bileam lässt sie über Nacht bleiben, bis er hört, was יהוה ihm sagt.',
  '22:9': 'Num 22,9 – Gott fragt Bileam, wer diese Männer seien.',
  '22:10': 'Num 22,10 – Bileam erklärt, dass Balak Sohn Zippors, König von Moab, ihn gerufen habe.',
  '22:11': 'Num 22,11 – Balak will, dass er das Volk aus Ägypten verflucht, damit er es bekämpfen und vertreiben kann.',
  '22:12': 'Num 22,12 – Gott verbietet Bileam, mitzugehen oder das Volk zu verfluchen, weil es gesegnet ist.',
  '22:13': 'Num 22,13 – Bileam schickt die Fürsten Balaks heim, weil יהוה es nicht erlaubt.',
  '22:14': 'Num 22,14 – Die Fürsten berichten Balak, dass Bileam nicht mit ihnen kommt.',
  '22:15': 'Num 22,15 – Balak sendet erneut mehr und angesehenere Fürsten.',
  '22:16': 'Num 22,16 – Sie bitten Bileam im Namen Balaks dringend zu kommen.',
  '22:17': 'Num 22,17 – Balak verspricht große Ehre und Gehorsam, wenn Bileam Israel verflucht.',
  '22:18': 'Num 22,18 – Bileam antwortet, dass selbst ein Haus voller Silber und Gold ihn nicht von יהוהs Wort abbringen kann.',
  '22:19': 'Num 22,19 – Er bittet sie zu übernachten, um zu erfahren, was יהוה noch sprechen wird.',
  '22:20': 'Num 22,20 – Gott erlaubt ihm, mitzugehen, aber nur das zu tun, was er ihm sagt.',
  '22:21': 'Num 22,21 – Bileam sattelt seine Eselin und zieht mit den Fürsten von Moab.',
  '22:22': 'Num 22,22 – Gottes Zorn entbrennt, der Engel יהוהs stellt sich ihm entgegen, während er mit zwei Dienern reitet.',
  '22:23': 'Num 22,23 – Die Eselin sieht den Engel mit gezogenem Schwert, verlässt den Weg und wird dafür geschlagen.',
  '22:24': 'Num 22,24 – Der Engel steht in einem Weinbergpfad mit Mauern zur Rechten und Linken.',
  '22:25': 'Num 22,25 – Die Eselin drückt Bileams Fuß an die Wand und er schlägt sie erneut.',
  '22:26': 'Num 22,26 – Der Engel tritt in eine enge Stelle, wo man nicht ausweichen kann.',
  '22:27': 'Num 22,27 – Die Eselin legt sich unter Bileam, der sie wütend mit dem Stab schlägt.',
  '22:28': 'Num 22,28 – יהוה öffnet der Eselin den Mund; sie fragt, warum er sie dreimal geschlagen hat.',
  '22:29': 'Num 22,29 – Bileam sagt, sie habe ihn verhöhnt; hätte er ein Schwert, hätte er sie getötet.',
  '22:30': 'Num 22,30 – Die Eselin erinnert ihn an ihren langjährigen Dienst und fragt, ob sie so etwas je getan habe; er sagt Nein.',
  '22:31': 'Num 22,31 – יהוה öffnet Bileams Augen, er sieht den Engel mit dem Schwert und verneigt sich.',
  '22:32': 'Num 22,32 – Der Engel fragt, warum er die Eselin schlug; er kam entgegen, weil Bileams Weg verkehrt war.',
  '22:33': 'Num 22,33 – Die Eselin sah den Engel, wich dreimal aus und rettete Bileams Leben.',
  '22:34': 'Num 22,34 – Bileam bekennt seine Schuld und ist bereit umzkehren, wenn der Weg falsch ist.',
  '22:35': 'Num 22,35 – Der Engel erlaubt ihm, mitzugehen, doch er soll nur reden, was ihm gesagt wird.',
  '22:36': 'Num 22,36 – Balak eilt an die Grenze, um Bileam zu empfangen.',
  '22:37': 'Num 22,37 – Balak fragt, warum Bileam nicht früher gekommen sei und ob er ihn nicht ehren könne.',
  '22:38': 'Num 22,38 – Bileam erklärt, er könne nur die Worte sprechen, die Gott ihm gibt.',
  '22:39': 'Num 22,39 – Bileam geht mit Balak nach Kirjat-Chuzot.',
  '22:40': 'Num 22,40 – Balak opfert Rinder und Schafe und teilt das Fleisch mit Bileam und den Fürsten.',
  '22:41': 'Num 22,41 – Am Morgen führt Balak Bileam auf die Höhen Baals, damit er Israel überblickt.',
  '23:1': 'Num 23,1 – Bileam bittet Balak, sieben Altäre zu bauen und sieben Stiere und Widder zu bereiten.',
  '23:2': 'Num 23,2 – Balak tut es und beide bringen auf jedem Altar einen Stier und einen Widder dar.',
  '23:3': 'Num 23,3 – Bileam sagt Balak, bei den Opfern zu stehen, während er vielleicht יהוה begegnet.',
  '23:4': 'Num 23,4 – Gott begegnet Bileam, der von den Altären und Opfern berichtet.',
  '23:5': 'Num 23,5 – יהוה legt Bileam Worte in den Mund und sendet ihn zu Balak zurück.',
  '23:6': 'Num 23,6 – Bileam findet Balak und die moabitischen Fürsten bei den Altären wartend.',
  '23:7': 'Num 23,7 – Bileam beginnt sein erstes Spruchwort und berichtet von Balaks Auftrag, Jakob zu verfluchen.',
  '23:8': 'Num 23,8 – Er fragt, wie er verfluchen könne, wen Gott nicht verflucht.',
  '23:9': 'Num 23,9 – Er sieht Israel als Volk, das abgesondert wohnt und nicht zu den Nationen gezählt wird.',
  '23:10': 'Num 23,10 – Er kann die Menge Jakobs kaum zählen und wünscht, wie sie zu sterben.',
  '23:11': 'Num 23,11 – Balak beklagt sich, dass Bileam statt Fluch einen Segen ausgesprochen hat.',
  '23:12': 'Num 23,12 – Bileam insistiert, nur das sagen zu können, was יהוה ihm gibt.',
  '23:13': 'Num 23,13 – Balak führt ihn an einen anderen Ort, wo er nur einen Teil des Volkes sehen soll.',
  '23:14': 'Num 23,14 – Sie gehen auf den Gipfel des Pisga, errichten erneut sieben Altäre und opfern.',
  '23:15': 'Num 23,15 – Bileam weist Balak an, bei seinem Opfer stehenzubleiben.',
  '23:16': 'Num 23,16 – יהוה begegnet Bileam und legt ihm erneut Worte in den Mund.',
  '23:17': 'Num 23,17 – Balak fragt gespannt nach dem neuen Wort יהוהs.',
  '23:18': 'Num 23,18 – Bileam beginnt sein zweites Spruchwort und ruft Balak zum Hören auf.',
  '23:19': 'Num 23,19 – Gott ist kein Mensch, der lügt oder bereut; was er sagt, das erfüllt er.',
  '23:20': 'Num 23,20 – Bileam hat den Auftrag zum Segen erhalten und kann ihn nicht widerrufen.',
  '23:21': 'Num 23,21 – Gott sieht keinen Frevel in Jakob; der Jubel eines Königs ist in ihrer Mitte.',
  '23:22': 'Num 23,22 – Gott führte sie aus Ägypten und gab ihnen die Kraft eines Wildochsen.',
  '23:23': 'Num 23,23 – Gegen Jakob wirkt keine Zauberei; man wird verkünden, was Gott getan hat.',
  '23:24': 'Num 23,24 – Israel erhebt sich wie ein Löwe und ruht nicht, bis es Beute verschlungen hat.',
  '23:25': 'Num 23,25 – Balak fleht, Bileam möge weder fluchen noch segnen.',
  '23:26': 'Num 23,26 – Bileam erinnert daran, dass er nur reden kann, was יהוה sagt.',
  '23:27': 'Num 23,27 – Balak versucht es an einem dritten Ort, vielleicht werde Gott einen Fluch erlauben.',
  '23:28': 'Num 23,28 – Er bringt Bileam auf den Gipfel des Peor mit Blick auf die Wüste.',
  '23:29': 'Num 23,29 – Bileam verlangt erneut sieben Altäre und Opfer.',
  '23:30': 'Num 23,30 – Balak richtet die Altäre und die Opfer wie verlangt her.',
  '24:1': 'Num 24,1 – Bileam erkennt, dass Gott Israel segnen will, und sucht keine Zeichen mehr.',
  '24:2': 'Num 24,2 – Er sieht Israel nach seinen Stämmen lagern; der Geist Gottes kommt auf ihn.',
  '24:3': 'Num 24,3 – Bileam spricht sein drittes Spruchwort als der Mann mit geöffnetem Auge.',
  '24:4': 'Num 24,4 – Er beschreibt sich als Hörer der Worte Gottes, der ein Gesicht des Allmächtigen schaut.',
  '24:5': 'Num 24,5 – Er preist die Schönheit der Zelte Jakobs und der Wohnstätten Israels.',
  '24:6': 'Num 24,6 – Israel ist wie Täler und Gärten, wie Aloen und Zedern an Wassern.',
  '24:7': 'Num 24,7 – Wasser fließt aus Israel; ihr König wird höher als Agag und ihr Reich erhöht.',
  '24:8': 'Num 24,8 – Gott führte sie aus Ägypten; sie verschlingen ihre Feinde und zerbrechen deren Knochen.',
  '24:9': 'Num 24,9 – Israel liegt wie ein Löwe; wer es segnet, wird gesegnet, wer es verflucht, verflucht.',
  '24:10': 'Num 24,10 – Balak wird wütend, schlägt seine Hände zusammen und klagt über den dritten Segen.',
  '24:11': 'Num 24,11 – Er befiehlt Bileam zu fliehen; die versprochene Ehre bleibt aus.',
  '24:12': 'Num 24,12 – Bileam erinnert Balak an seinen Hinweis, nur Gottes Wort reden zu können.',
  '24:13': 'Num 24,13 – Selbst ein Haus voller Silber und Gold könnte ihn nicht von יהוהs Wort abbringen.',
  '24:14': 'Num 24,14 – Er kündigt an, Balaks Volk mitzuteilen, was Israel ihnen am Ende der Tage tun wird.',
  '24:15': 'Num 24,15 – Bileam hebt ein weiteres Spruchwort als Seher Gottes an.',
  '24:16': 'Num 24,16 – Er bezeichnet sich als den Wissenden, der das Gesicht des Allmächtigen sieht.',
  '24:17': 'Num 24,17 – Er sieht einen kommenden Stern aus Jakob und ein Zepter aus Israel, das Moab zerschmettert.',
  '24:18': 'Num 24,18 – Edom und Seir werden Besitz Israels; das Volk zeigt Stärke.',
  '24:19': 'Num 24,19 – Ein Herrscher aus Jakob vernichtet die letzten Gegnerscharen.',
  '24:20': 'Num 24,20 – Amalek war der Erste unter den Völkern, doch sein Ende ist Vernichtung.',
  '24:21': 'Num 24,21 – Die Keniter wohnen sicher auf dem Felsen.',
  '24:22': 'Num 24,22 – Auch Kain wird zerstört werden; Assur führt ihn fort.',
  '24:23': 'Num 24,23 – Wehe! Wer kann bestehen, wenn Gott dies verfügt?',
  '24:24': 'Num 24,24 – Schiffe aus Kittim bedrängen Assur und Eber, doch auch sie vergehen.',
  '24:25': 'Num 24,25 – Bileam kehrt heim, und Balak geht ebenfalls seines Weges.',
};

export async function runLevelTwelve() {
  const plan = levelAmbiencePlan.level12;
  const fallbackAmbience = plan?.apply ?? 'voidFinale';
  let sceneIndex = 0;

  const activateScene = index => {
    const blueprint = REVIEW_SCENES[index % REVIEW_SCENES.length];
    if (!blueprint) {
      applySceneConfig({
        ambience: fallbackAmbience,
        wizardStartX: 96,
        donkeyOffset: -34,
        props: cloneSceneProps([]),
      });
      ensureAmbience(fallbackAmbience);
      setSceneContext({ level: 'level12', phase: 'original' });
      return;
    }
    const config = {
      ...blueprint,
      props: cloneSceneProps(blueprint.props),
    };
    applySceneConfig(config);
    ensureAmbience(blueprint.ambience ?? fallbackAmbience);
    setSceneContext({ level: 'level12', phase: blueprint.id ?? 'review' });
    const track = LEVEL_MUSIC.find(entry => entry.sceneId === blueprint.id)?.track ?? null;
    if (track) {
      switchMusic(track);
    }
  };

  activateScene(sceneIndex);
  setLifeBars(null);

  await showLevelTitle('Originalstory');
  await fadeToBase(600);

  const verses = await loadOriginalVerses();
  for (let i = 0; i < verses.length; i += 1) {
    const verse = verses[i];
    const summary = GERMAN_SUMMARIES[verse.ref] ?? `Numeri ${verse.ref.replace(':', ',')} – Worte bleiben bestehen.`;
    const sanitizedHebrew = verse.hebrew || '—';
    await divineSay(`${sanitizedHebrew}\n${summary}`);
    if (i < verses.length - 1) {
      sceneIndex = (sceneIndex + 1) % REVIEW_SCENES.length;
      activateScene(sceneIndex);
    }
  }

  await fadeToBlack(900);
  setLifeBars(null);
}

async function loadOriginalVerses() {
  const url = new URL('./original.txt', import.meta.url);
  const response = await fetch(url);
  if (!response.ok) {
    return [];
  }
  const raw = await response.text();
  const lines = raw.split(/\r?\n/);
  const verses = [];
  for (const line of lines) {
    const cleaned = stripDirectionalControls(line).trim();
    if (!cleaned) continue;
    const match = cleaned.match(/^(\d+)\s+\u05C3(\d+)\s+(.+)$/u);
    if (!match) continue;
    const verseNumber = match[1];
    const chapterNumber = match[2];
    const hebrew = stripNiqqud(match[3]).trim();
    if (!hebrew) continue;
    verses.push({
      ref: `${chapterNumber}:${verseNumber}`,
      hebrew,
    });
  }
  return verses;
}

function stripDirectionalControls(text) {
  return text.replace(/[\u202a-\u202e]/g, '');
}

function stripNiqqud(text) {
  return text.replace(/[\u0591-\u05C7]/g, '');
}
