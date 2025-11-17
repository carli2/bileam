import {
  ensureAmbience,
  setSceneContext,
  levelAmbiencePlan,
  fadeToBlack,
  fadeToBase,
  showLevelTitle,
  setSceneProps,
} from '../scene.js';
import {
  narratorSay,
  wizardSay,
  donkeySay,
  applySceneConfig,
  cloneSceneProps,
  propSay,
  showLocationSign,
  showFloatingRunes,
} from './utils.js';

const PISGA_LINE_SCENE = {
  ambience: 'courtAudience',
  wizardStartX: 84,
  donkeyOffset: -40,
  groundProfile: {
    height: 22,
    cutouts: [{ start: 520, end: 720 }],
  },
  props: [
    { id: 'pisgaBackdrop', type: 'canyonMist', x: -90, align: 'ground', offsetY: -60, parallax: 0.4, layer: -3 },
    { id: 'pisgaRidge', type: 'borderProcessionPath', x: -40, align: 'ground', parallax: 0.5, layer: -2 },
    { id: 'pisgaForegroundVines', type: 'gardenForegroundPlant', x: 60, align: 'ground', parallax: 1.12, layer: 2 },
    { id: 'pisgaTorchWest', type: 'watchFireDormant', x: 120, align: 'ground', parallax: 0.88 },
    { id: 'pisgaTorchEast', type: 'watchFireDormant', x: 560, align: 'ground', parallax: 1.08 },
    { id: 'pisgaPlateauNorth', type: 'basaltSpireTall', x: -28, align: 'ground', parallax: 0.72 },
    { id: 'pisgaPlateauSouth', type: 'basaltSpireShort', x: 64, align: 'ground', parallax: 0.78 },
    { id: 'pisgaCliffWall', type: 'vineyardBoundary', x: 596, align: 'ground', parallax: 1.12 },
    { id: 'pisgaChasmMist', type: 'canyonMist', x: 620, align: 'ground', offsetY: 10, parallax: 1.18, layer: 1 },
    { id: 'pisgaCampOne', type: 'campTent', x: 180, align: 'ground', parallax: 1.04, layer: 1 },
    { id: 'pisgaCampTwo', type: 'campTent', x: 240, align: 'ground', parallax: 1.06, layer: 1 },
    { id: 'pisgaCampThree', type: 'campTent', x: 300, align: 'ground', parallax: 1.1, layer: 1 },
    { id: 'pisgaCampFour', type: 'campTent', x: 360, align: 'ground', parallax: 1.14, layer: 1 },
    { id: 'truthPlateOne', type: 'pisgaAltarPlate', x: 152, align: 'ground', parallax: 0.92 },
    { id: 'truthPlateTwo', type: 'pisgaAltarPlate', x: 216, align: 'ground', parallax: 0.94 },
    { id: 'truthPlateThree', type: 'pisgaAltarPlate', x: 280, align: 'ground', parallax: 0.96 },
    { id: 'truthPlateFour', type: 'pisgaAltarPlate', x: 344, align: 'ground', parallax: 0.98 },
    { id: 'truthPlateFive', type: 'pisgaAltarPlate', x: 408, align: 'ground', parallax: 1.0 },
    { id: 'truthPlateSix', type: 'pisgaAltarPlate', x: 472, align: 'ground', parallax: 1.02 },
    { id: 'truthPlateSeven', type: 'pisgaAltarPlate', x: 536, align: 'ground', parallax: 1.04 },
    { id: 'pisgaBanner', type: 'princeProcessionBanner', x: 112, align: 'ground', parallax: 0.9 },
    { id: 'pisgaBalak', type: 'balakFigure', x: 612, align: 'ground', parallax: 1.08 },
  ],
};

const DABAR_SCENE = {
  ambience: 'courtAudience',
  wizardStartX: 96,
  donkeyOffset: -40,
  groundProfile: {
    height: 22,
    cutouts: [{ start: 520, end: 720 }],
  },
  props: [
    { id: 'dabarBackdrop', type: 'resonanceRingDormant', x: -60, align: 'ground', parallax: 0.5, layer: -3 },
    { id: 'dabarPath', type: 'borderProcessionPath', x: 0, align: 'ground', parallax: 0.56, layer: -2 },
    { id: 'dabarTorchLeft', type: 'watchFireDormant', x: 140, align: 'ground', parallax: 0.84 },
    { id: 'dabarTorchRight', type: 'watchFireDormant', x: 472, align: 'ground', parallax: 1.1 },
    { id: 'dabarPlateauCrag', type: 'basaltSpireTall', x: -24, align: 'ground', parallax: 0.74 },
    { id: 'dabarPlateauRidge', type: 'basaltSpireShort', x: 88, align: 'ground', parallax: 0.8 },
    { id: 'dabarCliffWall', type: 'vineyardBoundary', x: 598, align: 'ground', parallax: 1.16 },
    { id: 'dabarChasmMist', type: 'canyonMist', x: 628, align: 'ground', offsetY: 12, parallax: 1.22, layer: 1 },
    { id: 'dabarCampOne', type: 'campTent', x: 210, align: 'ground', parallax: 1.06, layer: 1 },
    { id: 'dabarCampTwo', type: 'campTent', x: 270, align: 'ground', parallax: 1.08, layer: 1 },
    { id: 'dabarCampThree', type: 'campTent', x: 330, align: 'ground', parallax: 1.12, layer: 1 },
    { id: 'dabarPillarOne', type: 'resonancePillarDormant', x: 216, align: 'ground', parallax: 0.94 },
    { id: 'dabarPillarTwo', type: 'resonancePillarDormant', x: 320, align: 'ground', parallax: 0.96 },
    { id: 'dabarPillarThree', type: 'resonancePillarDormant', x: 424, align: 'ground', parallax: 0.98 },
    { id: 'dabarBalak', type: 'balakFigure', x: 536, align: 'ground', parallax: 1.06 },
  ],
};

const GARDEN_SCENE = {
  ambience: 'courtAudience',
  wizardStartX: 92,
  donkeyOffset: -40,
  groundProfile: {
    height: 16,
    cutouts: [],
  },
  props: [
    { id: 'gardenBackdrop', type: 'gardenBackdropTrees', x: -120, align: 'ground', parallax: 0.3, layer: -4 },
    { id: 'gardenHaze', type: 'canyonMist', x: -40, align: 'ground', offsetY: -52, parallax: 0.46, layer: -2 },
    { id: 'gardenStream', type: 'water', x: 60, align: 'ground', parallax: 0.78 },
    { id: 'gardenLampWest', type: 'watchFireDormant', x: 108, align: 'ground', parallax: 0.82 },
    { id: 'gardenLampEast', type: 'watchFireDormant', x: 520, align: 'ground', parallax: 1.12 },
    { id: 'gardenNet', type: 'truthWeaveNetDormant', x: 140, align: 'ground', parallax: 0.9 },
    { id: 'symbolTent', type: 'truthMirrorSymbolDormant', x: 220, align: 'ground', parallax: 0.94 },
    { id: 'symbolGarden', type: 'truthMirrorSymbolDormant', x: 300, align: 'ground', parallax: 0.96 },
    { id: 'symbolTree', type: 'truthMirrorSymbolDormant', x: 380, align: 'ground', parallax: 0.98 },
    { id: 'symbolLion', type: 'truthMirrorSymbolDormant', x: 460, align: 'ground', parallax: 1.0 },
    { id: 'gardenBalakShadow', type: 'balakFigure', x: 520, align: 'ground', parallax: 1.02 },
  ],
};

export async function runLevelNine() {
  const plan = levelAmbiencePlan.level9;

  const pisgaProps = cloneSceneProps(PISGA_LINE_SCENE.props);
  applySceneConfig({ ...PISGA_LINE_SCENE, props: pisgaProps });
  ensureAmbience(plan?.review ?? PISGA_LINE_SCENE.ambience ?? 'courtAudience');
  setSceneContext({ level: 'level9', phase: 'pisga-first' });
  await showLevelTitle('Level 9 - Die Stimme des Wahren');
  await fadeToBase(600);

  await showLocationSign(pisgaProps, { id: 'signBamotBaal', x: 176, text: 'Bamot-Baal | במות בעל' });
  await showFloatingRunes(pisgaProps, { x: 200, letters: ['ש', 'מ', 'ע'] });
  await storyFirstOraclePisga(pisgaProps);

  const secondProps = cloneSceneProps(DABAR_SCENE.props);
  await transitionToScene(plan?.learn, DABAR_SCENE, secondProps, 'pisga-second');
  await showLocationSign(secondProps, { id: 'signPisgaField', x: 220, text: 'Pisga – Feld der Spaeher | פסגה' });
  await showFloatingRunes(secondProps, { x: 244, letters: ['ד', 'ב', 'ר'] });
  await storySecondOraclePisga(secondProps);

  const thirdProps = cloneSceneProps(GARDEN_SCENE.props);
  await transitionToScene(plan?.apply, GARDEN_SCENE, thirdProps, 'pisga-third');
  await showLocationSign(thirdProps, { id: 'signPeor', x: 200, text: 'Peor – Drittes Opferfeld | פעור' });
  await showFloatingRunes(thirdProps, { x: 228, letters: ['א', 'מ', 'ת'] });
  await storyBalakDemandsThird(thirdProps);

  await fadeToBlack(720);
}

async function storyFirstOraclePisga(props) {
  await narratorSay('Auf dem Bamot-Baal stehen sieben Altäre. Balak lässt auf jedem einen Stier und einen Widder opfern, während Bileam sich zurückzieht, um Gottes Stimme zu hören.');
  await donkeySay('Sieben Altäre, sieben Opfer – Balak hofft, dass das reicht.');
  await wizardSay('„Von Aram hat mich Balak bringen lassen, vom Gebirge des Ostens: Komm, verfluche Jakob, komm, verwünsche Israel.“');
  await wizardSay('„Wie sollte ich verfluchen, wen יהוה nicht verflucht? Wie sollte ich verdammen, wen Gott nicht verdammt?“');
  await wizardSay('„Wer kann den Staub Jakobs zählen, wer die Zahl Israels bestimmen? Mein Wunsch ist, wie die Gerechten zu sterben; mein Ende sei wie das ihre.“');
  await propSay(props, 'pisgaBalak', 'Was tust du, Bileam? Ich nahm dich, um meine Feinde zu verfluchen, und siehe, du segnest sie!', { anchor: 'center', offsetY: -30 });
  await wizardSay('Alles, was יהוה in meinen Mund legt, das muss ich reden.');
}

async function storySecondOraclePisga(props) {
  await narratorSay('Balak gibt nicht nach. Er führt Bileam zum Feld der Späher auf dem Gipfel des Pisga. Wieder entstehen sieben Altäre, wieder werden Opfer gebracht.');
  await wizardSay('„Steh auf, Balak, und höre! Gott ist kein Mensch, dass er lügt; kein Menschenkind, das ihm etwas leid könnte. Was er spricht, das geschieht.“');
  await wizardSay('„Siehe, zu segnen ist mir befohlen – und ich werde es nicht widerrufen.“');
  await wizardSay('„Ich sehe kein Unheil in Jakob, keine Mühsal in Israel. יהוה, sein Gott, ist bei ihm, und der Jubel eines Königs ist in seiner Mitte.“');
  await wizardSay('„Wie ein Löwe liegt es da; wer will es aufschrecken? Wer dich segnet, ist gesegnet, wer dich verflucht, ist verflucht.“');
  await propSay(props, 'dabarBalak', 'Weder verfluche noch segne sie! Schweig doch endlich!', { anchor: 'center', offsetY: -32 });
  await wizardSay('Habe ich dir nicht gesagt: Alles, was יהוה redet, das werde ich tun?');
  await donkeySay('Balak hört nur, was er hören will. Doch das Wort bleibt bestehen.');
}

async function storyBalakDemandsThird(props) {
  await narratorSay('Balak ringt vergeblich. Dennoch versucht er es ein drittes Mal.');
  await propSay(props, 'gardenBalakShadow', 'Komm, ich bringe dich an einen andern Ort. Von dort wirst du nur einen Teil sehen – vielleicht kannst du mir dort das Volk verfluchen.', { anchor: 'center', offsetY: -30 });
  await wizardSay('Baue mir dort sieben Altäre und bringe mir sieben Stiere und sieben Widder.');
  await narratorSay('Balak nickt. Noch einmal werden Altäre errichtet, noch einmal wartet er auf das Wort.');
  await donkeySay('Noch eine Stufe, Meister. Was als nächstes geschieht, entscheidet alles.');
  await narratorSay('So bereiten sie das dritte Opferfeld vor – und Bileam macht sich bereit für das große Orakel, das Level 10 entfalten wird.');
}

async function transitionToScene(ambienceKey, sceneConfig, props, phase) {
  await fadeToBlack(320);
  ensureAmbience(ambienceKey ?? sceneConfig.ambience ?? 'courtAudience');
  setSceneProps([]);
  applySceneConfig({ ...sceneConfig, props }, { setAmbience: false });
  setSceneProps(props);
  setSceneContext({ level: 'level9', phase });
  await fadeToBase(360);
}
