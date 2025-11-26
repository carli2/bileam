import {
  promptBubble,
  ensureAmbience,
  setSceneContext,
  levelAmbiencePlan,
  fadeToBlack,
  fadeToBase,
  showLevelTitle,
  setSceneProps,
  flashLightning,
  waitForWizardToReach,
} from '../scene.js';
import {
  narratorSay,
  wizardSay,
  donkeySay,
  anchorX,
  anchorY,
  wizard,
  applySceneConfig,
  cloneSceneProps,
  spellEquals,
  updateProp,
  addProp,
  celebrateGlyph,
  propSay,
  showLocationSign,
  showFloatingRunes,
  findProp,
  getPropCenterX,
  canonicalizeSequence,
  consumeSequenceTokens,
  sleep,
} from './utils.js';

const PISGA_SCENE = {
  ambience: 'courtAudience',
  wizardStartX: 86,
  donkeyOffset: -38,
  groundProfile: {
    height: 22,
    cutouts: [],
  },
  props: [
    { id: 'pisgaVeil', type: 'canyonMist', x: -88, align: 'ground', offsetY: -62, parallax: 0.34, layer: -3 },
    { id: 'pisgaStone', type: 'borderMilestone', x: 204, align: 'ground', parallax: 0.94 },
    { id: 'pisgaCleft', type: 'pisgaBridgeRunesDormant', x: 316, align: 'ground', parallax: 0.96 },
    { id: 'pisgaPortal', type: 'pisgaBridgeSegmentDormant', x: 432, align: 'ground', parallax: 0.98 },
    { id: 'pisgaWindVeil', type: 'resonanceRingDormant', x: 508, align: 'ground', parallax: 1.08 },
    { id: 'pisgaForeground', type: 'gardenForegroundPlant', x: 84, align: 'ground', parallax: 1.14, layer: 2 },
  ],
};

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

export async function runLevelNine() {
  const plan = levelAmbiencePlan.level9;

  const approachProps = cloneSceneProps(PISGA_SCENE.props);
  applySceneConfig({ ...PISGA_SCENE, props: approachProps });
  ensureAmbience(plan?.review ?? PISGA_SCENE.ambience ?? 'courtAudience');
  setSceneContext({ level: 'level9', phase: 'pisga-approach' });
  await showLevelTitle('Level 9 - Die Stimme des Wahren');
  await showLocationSign(approachProps, { id: 'signPisga', x: 220, text: 'Pisga – Zweites Opferfeld | פסגה' });
  await fadeToBase(600);

  await donkeySay('Zweites Opferfeld – halte hören, Nein und Segen bereit.');
  await phasePisgaPath(approachProps);

  const pisgaProps = cloneSceneProps(PISGA_LINE_SCENE.props);
  await transitionToScene(plan?.learn, PISGA_LINE_SCENE, pisgaProps, 'pisga-first');
  await showFloatingRunes(pisgaProps, { x: 200, letters: ['ש', 'מ', 'ע'] });
  await donkeySay('Denk an den Rhythmus: hören, verneinen, segnen. Jetzt kommt das Wort, das wirkt – דבר – und die Wahrheit, die hält – אמת.');
  await storyFirstOraclePisga(pisgaProps);
  await flashLightning({ doubleFlash: true, durationIn: 80, durationOut: 180, intensity: 0.9 });

  const secondProps = cloneSceneProps(DABAR_SCENE.props);
  await transitionToScene(plan?.learn, DABAR_SCENE, secondProps, 'pisga-second');
  await showFloatingRunes(secondProps, { x: 244, letters: ['ד', 'ב', 'ר'] });
  await storySecondOraclePisga(secondProps);
  await storyTowardThirdField(secondProps);

  await fadeToBlack(720);
}

async function storyFirstOraclePisga(props) {
  await narratorSay('Balak führt dich auf das Feld des Spähers am Pisga und richtet erneut sieben Altäre her. Noch einmal bringt er Stiere und Widder, während du auf יהוה wartest.');
  await donkeySay('Zweites Opferfeld – zweiter Versuch. Halte deine Worte bereit.');
  await propSay(props, 'pisgaBalak', 'Was tust du, Bileam? Ich nahm dich, um meine Feinde zu verfluchen – und du schweigst oder segnest!', { anchor: 'center', offsetY: -30 });
}

async function storySecondOraclePisga(props) {
  await narratorSay('Balak gibt nicht nach. Er führt Bileam zum Feld der Späher auf dem Gipfel des Pisga. Wieder entstehen sieben Altäre, wieder werden Opfer gebracht.');
  await wizardSay('„Steh auf, Balak, und höre! אלוהים ist kein Mensch, dass er lügt; kein Menschenkind, das ihm etwas leid könnte. Was er spricht, das geschieht.“');
  await wizardSay('„Siehe, zu segnen ist mir befohlen – und ich werde es nicht widerrufen.“');
  await wizardSay('„Ich sehe kein Unheil in Jakob, keine Mühsal in Israel. יהוה, sein אלוהים, ist bei ihm, und der Jubel eines Königs ist in seiner Mitte.“');
  await wizardSay('„אלוהים hat sie aus מצרים geführt; er ist für sie wie das Horn des Wildstiers. Kein Zaubern hilft gegen Jakob, kein Wahrsagen gegen Israel.“');
  await wizardSay('„Zu rechter Zeit wird gesagt, was יהוה gewirkt hat. Siehe, ein Volk erhebt sich wie eine Löwin, richtet sich auf wie ein Löwe; es legt sich nicht nieder, bis es Raub gefressen und Blut getrunken hat.“');
  await donkeySay('Dabar trifft, emet hält – höre auf die Reihenfolge: דבר dann אמת.');
  await propSay(props, 'dabarBalak', 'Weder verfluche noch segne sie! Schweig doch endlich!', { anchor: 'center', offsetY: -32 });
  await wizardSay('Habe ich dir nicht gesagt: Alles, was יהוה redet, das werde ich tun?');
  await donkeySay('Balak hört nur, was er hören will. Doch das Wort bleibt bestehen.');
  await flashLightning({ doubleFlash: true, durationIn: 70, durationOut: 170, intensity: 0.9 });
}

async function storyTowardThirdField(props) {
  await narratorSay('Balak ringt vergeblich. Dennoch plant er ein drittes Mal.');
  await propSay(props, 'dabarBalak', 'Komm, ich bringe dich an einen andern Ort. Von dort wirst du nur einen Teil sehen – vielleicht kannst du mir dort das Volk verfluchen.', { anchor: 'center', offsetY: -30 });
  await wizardSay('Baue mir dort sieben Altäre und bringe mir sieben Stiere und sieben Widder.');
  await donkeySay('Noch eine Stufe, Meister. Bewahre dabar und emet – sie werden mit ברך verbunden, wenn wir weiterziehen.');
  await narratorSay('So brecht ihr auf zum dritten Feld. Balaks Geduld reisst; dein Wort bleibt gebunden an den Auftrag יהוה.');
  await flashLightning({ doubleFlash: true, durationIn: 60, durationOut: 150, intensity: 0.8 });
}

async function phasePisgaPath(props) {
  addProp(props, { id: 'pisgaScriptVeil', type: 'pisgaScriptPath', x: wizard.x - 40, y: wizard.y - 30, parallax: 0.8 });
  await pulsePisgaCues(props);
  const steps = [
    { id: 'pisgaStone', prompt: 'Der Späherstein verlangt einen Segen: sprich ברך.', spells: ['baruch', 'ברך'] },
    { id: 'pisgaCleft', prompt: 'Höre und verneine Balaks Linie (שמע, dann לא).', sequence: ['shama', 'lo'] },
    { id: 'pisgaPortal', prompt: 'Öffne das Portal mit לא und schliesse mit ברך.', sequence: ['lo', 'baruch'] },
  ];
  for (const step of steps) {
    const target = props.find(entry => entry.id === step.id)?.x ?? wizard.x + 200;
    await waitForWizardToReach(target, { tolerance: 18 });
    if (step.sequence) {
      let idx = 0;
      let baruchFailures = 0;
      const canonicalSeq = canonicalizeSequence(step.sequence);
      while (idx < step.sequence.length) {
        const expected = step.sequence[idx];
        const labels = expected === 'shama' ? 'שמע' : expected === 'lo' ? 'לא' : 'ברך';
        const answer = await readWord(step.prompt);
        const multiAdvance = consumeSequenceTokens(answer, canonicalSeq, idx);
        if (multiAdvance > 0) {
          for (let offset = 0; offset < multiAdvance; offset += 1) {
            await celebrateGlyph(step.sequence[idx + offset]);
          }
          idx += multiAdvance;
          if (idx === step.sequence.length) {
            updateProp(props, step.id, { type: 'pisgaBridgeSegmentLit' });
          }
          continue;
        }
        if (spellEquals(answer, expected, labels)) {
          idx += 1;
          if (idx === step.sequence.length) {
            updateProp(props, step.id, { type: 'pisgaBridgeSegmentLit' });
          }
        } else {
          if (expected === 'baruch') {
            baruchFailures += 1;
            if (baruchFailures % 3 === 0) {
              await donkeySay('Der Abschluss lautet ברך – sprich baruch, oder tippe alle Worte auf einmal (z. B. "lo baruch").');
            } else {
              await donkeySay('Halte die Reihenfolge ein.');
            }
          } else {
            await donkeySay('Halte die Reihenfolge ein – oder sprich sie am Stück, getrennt durch Leerzeichen.');
          }
          idx = 0;
        }
      }
    } else if (step.spells) {
      let ok = false;
      while (!ok) {
        const answer = await readWord(step.prompt);
        if (step.spells.some(spell => spellEquals(answer, spell))) {
          ok = true;
          updateProp(props, step.id, { type: 'pisgaBridgeSegmentLit' });
          await celebrateGlyph(answer);
        } else {
          await donkeySay('Der Stein wartet auf das passende Wort.');
        }
      }
    }
  }
}

async function pulsePisgaCues(props) {
  const veil = findProp(props, 'pisgaWindVeil');
  if (veil) {
    updateProp(props, 'pisgaWindVeil', { type: 'resonanceRingActive' });
  }
  const cues = [
    { id: 'pisgaStone', tint: 'blue', flash: 0.35, offsetY: -34 },
    { id: 'pisgaCleft', tint: 'violet', flash: 0.4, offsetY: -32 },
    { id: 'pisgaPortal', tint: 'gold', flash: 0.42, offsetY: -28 },
  ];
  for (const cue of cues) {
    const centerX = getPropCenterX(props, cue.id);
    const base = findProp(props, cue.id);
    const cueId = `${cue.id}Cue`;
    addProp(props, {
      id: cueId,
      type: 'pisgaCueGlow',
      tint: cue.tint,
      x: Math.round(centerX - 14),
      align: 'ground',
      offsetY: cue.offsetY ?? -30,
      parallax: base?.parallax ?? 1,
      layer: (base?.layer ?? 0) + 1,
    });
    await flashLightning({ doubleFlash: false, durationIn: 70, durationOut: 190, intensity: cue.flash ?? 0.36 });
    await sleep(260);
    updateProp(props, cueId, { visible: false });
  }
  if (veil) {
    updateProp(props, 'pisgaWindVeil', { type: 'resonanceRingDormant' });
  }
}

async function readWord(promptText) {
  const input = await promptBubble(
    anchorX(wizard, -6),
    anchorY(wizard, -60),
    promptText,
    anchorX(wizard, 0),
    anchorY(wizard, -34),
  );
  if (input == null) return '';
  return String(input).trim();
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
