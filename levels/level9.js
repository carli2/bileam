import {
  promptBubble,
  ensureAmbience,
  setSceneContext,
  levelAmbiencePlan,
  fadeToBlack,
  fadeToBase,
  showLevelTitle,
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
  splitSpellInput,
} from './utils.js';

let balakFollowTimer = null;

function startBalakFollow(props, id, offset = 20) {
  stopBalakFollow();
  balakFollowTimer = setInterval(() => {
    const balak = findProp(props, id);
    const targetX = wizard.x + offset;
    if (!balak) {
      addProp(props, { id, type: 'balakFigure', x: targetX, align: 'ground', parallax: 1.02 });
      return;
    }
    const currentX = balak.x ?? targetX;
    const maxStep = 1.5; // slower than donkey
    const delta = Math.max(-maxStep, Math.min(maxStep, targetX - currentX));
    updateProp(props, id, { x: currentX + delta });
  }, 80);
}

function stopBalakFollow() {
  if (balakFollowTimer) {
    clearInterval(balakFollowTimer);
    balakFollowTimer = null;
  }
}

const PISGA_FIELD_SCENE = {
  ambience: 'courtAudience',
  wizardStartX: 86,
  donkeyOffset: -38,
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
    { id: 'pisgaStone', type: 'borderMilestone', x: 204, align: 'ground', parallax: 0.94 },
    { id: 'pisgaCleft', type: 'pisgaBridgeRunesDormant', x: 316, align: 'ground', parallax: 0.96 },
    { id: 'pisgaPortal', type: 'pisgaBridgeSegmentDormant', x: 432, align: 'ground', parallax: 0.98 },
    { id: 'pisgaWindVeil', type: 'resonanceRingDormant', x: 508, align: 'ground', parallax: 1.08 },
    { id: 'dabarPillarOne', type: 'resonancePillarDormant', x: 216, align: 'ground', parallax: 0.94 },
    { id: 'dabarPillarTwo', type: 'resonancePillarDormant', x: 320, align: 'ground', parallax: 0.96 },
    { id: 'dabarPillarThree', type: 'resonancePillarDormant', x: 424, align: 'ground', parallax: 0.98 },
    { id: 'pisgaBalak', type: 'balakFigure', x: 612, align: 'ground', parallax: 1.08 },
  ],
};

export async function runLevelNine() {
  const plan = levelAmbiencePlan.level9;

  const props = cloneSceneProps(PISGA_FIELD_SCENE.props);
  applySceneConfig({ ...PISGA_FIELD_SCENE, props });
  ensureAmbience(plan?.review ?? PISGA_FIELD_SCENE.ambience ?? 'courtAudience');
  setSceneContext({ level: 'level9', phase: 'pisga' });
  await showLevelTitle('Level 9 - Die Worte der Wahrheit');
  await showLocationSign(props, { id: 'signPisga', x: 220, text: 'Pisga – Zweites Opferfeld | פסגה' });
  await fadeToBase(600);

  await donkeySay('Zweites Opferfeld – halte hören, Nein und Segen bereit.');
  await showFloatingRunes(props, { x: 200, letters: ['ש', 'מ', 'ע'] });
  await narratorSay('Balak führt dich auf das Feld des Spähers am Pisga und richtet erneut sieben Altäre her. Noch einmal bringt er Stiere und Widder, während du auf יהוה wartest.');
  await donkeySay('Zweites Opferfeld – zweiter Versuch. Halte deine Worte bereit.');
  await propSay(props, 'pisgaBalak', 'Was tust du, Bileam? Ich nahm dich, um meine Feinde zu verfluchen – und du schweigst oder segnest!', { anchor: 'center', offsetY: -30 });
  const buildAltarsPromise = animateBalakAltars(props);

  await buildAltarsPromise;
  await wizardSay('„Steh auf, Balak, und höre! אלוהים ist kein Mensch, dass er lügt; kein Menschenkind, das ihm etwas leid könnte. Was er spricht, das geschieht.“');
  const pillars = ['dabarPillarOne', 'dabarPillarTwo', 'dabarPillarThree'];
  await donkeySay('דבר (DABAR): Dal (ד) – Aleph (א) – Resh (ר). Eine Tür, durch die Kraft aus dem Kopf fließt. Sprich das Wort, und es trägt Form.');
  await promptSingleWord(props, 'dabar', 'דבר', 'Sprich דבר (dabar) – setze das Wort.', pillars[0]);
  await donkeySay('אמת (EMET): Aleph (א) – Kraft am Anfang. Mem (מ) – die fließende Mitte. Tav (ת) – der letzte Buchstabe, Siegel und Besitz-Zeichen. Tav ist ein T wie Tet, liegt aber auf der Y-Taste. Kraft fließt vom Anfang bis zum Ende: Wahrheit.');
  await promptSingleWord(props, 'emet', 'אמת', 'Sprich אמת (emet) – halte das Wort.', pillars[1]);
  await donkeySay('דבר אמת – Wort der Wahrheit. Sprich beide zusammen.');
  await promptCombined(props, ['dabar', 'emet'], ['דבר', 'אמת'], 'Sprich "dabar emet" (Wort der Wahrheit).', pillars[2]);
  await wizardSay('„Siehe, zu segnen ist mir befohlen – und ich werde es nicht widerrufen.“');
  await wizardSay('„Ich sehe kein Unheil in Jakob, keine Mühsal in Israel. יהוה, sein אלוהים, ist bei ihm, und der Jubel eines Königs ist in seiner Mitte.“');
  await wizardSay('„אלוהים hat sie aus Ägypten geführt; er ist für sie wie das Horn des Wildstiers. Kein Zaubern hilft gegen Jakob, kein Wahrsagen gegen Israel.“');
  await wizardSay('„Zu rechter Zeit wird gesagt, was יהוה gewirkt hat. Siehe, ein Volk erhebt sich wie eine Löwin, richtet sich auf wie ein Löwe; es legt sich nicht nieder, bis es Raub gefressen und Blut getrunken hat.“');
  await propSay(props, 'pisgaBalak', 'Weder verfluche noch segne sie! Schweig doch endlich!', { anchor: 'center', offsetY: -32 });
  await wizardSay('Habe ich dir nicht gesagt: Alles, was יהוה redet, das werde ich tun?');
  await donkeySay('Balak hört nur, was er hören will. Doch das Wort bleibt bestehen.');
  await narratorSay('Balak ringt vergeblich. Dennoch plant er ein drittes Mal.');
  await propSay(props, 'pisgaBalak', 'Komm, ich bringe dich an einen andern Ort. Von dort wirst du nur einen Teil sehen – vielleicht kannst du mir dort das Volk verfluchen.', { anchor: 'center', offsetY: -30 });
  await wizardSay('Baue mir dort sieben Altäre und bringe mir sieben Stiere und sieben Widder.');
  await donkeySay('Noch eine Opferhöhe, Meister. Bewahre dabar und emet – sie werden mit ברך verbunden, wenn wir weiterziehen.');
  await narratorSay('So brecht ihr auf zum dritten Feld. Balaks Geduld reißt; dein Wort bleibt gebunden an den Auftrag יהוה.');
  await fadeToBlack(720);
}

async function animateBalakAltars(props) {
  const altarSpots = [180, 240, 300, 360, 420, 480, 540];
  for (let i = props.length - 1; i >= 0; i -= 1) {
    if (props[i]?.id && String(props[i].id).startsWith('balakBuiltAltar')) {
      props.splice(i, 1);
    }
  }
  let balak = findProp(props, 'pisgaBalak');
  if (!balak) {
    addProp(props, { id: 'pisgaBalak', type: 'balakFigure', x: wizard.x - 24, align: 'ground', parallax: 1.02 });
    balak = findProp(props, 'pisgaBalak');
  } else {
    updateProp(props, 'pisgaBalak', { x: Math.min(wizard.x - 24, altarSpots[0] - 30) });
  }
  for (let i = 0; i < altarSpots.length; i += 1) {
    const target = altarSpots[i];
    while (balak && Math.abs((balak.x ?? target) - target) > 2) {
      const currentX = balak.x ?? target;
      const delta = Math.max(-1.2, Math.min(1.2, target - currentX));
      updateProp(props, 'pisgaBalak', { x: currentX + delta });
      balak = findProp(props, 'pisgaBalak');
      await sleep(60);
    }
    const baseId = `balakBuiltAltar${i + 1}`;
    addProp(props, { id: baseId, type: 'gardenAltar', x: target, align: 'ground', parallax: balak?.parallax ?? 1.02, visible: true });
    await sleep(260);
    const centerX = getPropCenterX(props, baseId);
    const fireId = `${baseId}Fire`;
    addProp(props, { id: fireId, type: 'watchFireDormant', x: centerX, align: 'ground', parallax: balak?.parallax ?? 1.02, layer: 1, offsetY: -14 });
    await sleep(340);
    updateProp(props, fireId, { type: 'watchFireAwakened' });
    await sleep(240);
  }
}

async function promptSingleWord(props, canonical, hebrew, prompt, pillarId) {
  while (true) {
    const answer = await readWord(prompt);
    if (spellEquals(answer, canonical, hebrew)) {
      await celebrateGlyph(answer);
      if (pillarId) updateProp(props, pillarId, { type: 'resonanceRingActive' });
      break;
    }
    await donkeySay(`Tipp ${canonical.toUpperCase()} oder ${hebrew}.`);
  }
}

async function promptCombined(props, canonicalSeq, hebrewSeq, prompt, pillarId) {
  const expected = canonicalSeq.map((word, idx) => [word, hebrewSeq[idx]]);
  while (true) {
    const answer = await readWord(prompt);
    const tokens = splitSpellInput(answer);
    if (tokens.length === expected.length) {
      const matches = tokens.every((token, index) => {
        const [lat, heb] = expected[index] ?? [];
        return spellEquals(token, lat, heb);
      });
      if (matches) {
        for (let i = 0; i < expected.length; i += 1) {
          await celebrateGlyph(expected[i][0]);
        }
        if (pillarId) updateProp(props, pillarId, { type: 'resonanceRingActive' });
        break;
      }
    }
    await donkeySay('Sprich beide Wörter mit Leerzeichen: z. B. "dabar emet".');
  }
}

async function phasePisgaPath(props) {
  addProp(props, { id: 'pisgaScriptVeil', type: 'pisgaScriptPath', x: wizard.x - 40, y: wizard.y - 30, parallax: 0.8 });
  await pulsePisgaCues(props);
  const steps = [
    { id: 'pisgaStone', prompt: 'Der Späherstein verlangt einen Segen: sprich ברך.', spells: ['baruch', 'ברך'] },
    { id: 'pisgaCleft', prompt: 'Höre und verneine Balaks Linie (שמע, dann לא).', sequence: ['shama', 'lo'] },
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
              await donkeySay('Der Abschluss lautet ברך – sprich baruch.');
            } else {
              await donkeySay('Der Abschluss lautet ברך – versuche es noch einmal.');
            }
          } else {
            await donkeySay('Tipp die Folge auf einmal, getrennt durch Leerzeichen.');
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
