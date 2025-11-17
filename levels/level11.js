import {
  ensureAmbience,
  setSceneContext,
  levelAmbiencePlan,
  fadeToBase,
  fadeToBlack,
  showLevelTitle,
  setLifeBars,
  getScenePropBounds,
} from '../scene.js';
import {
  donkeySay,
  divineSay,
  propSay,
  applySceneConfig,
  cloneSceneProps,
  findProp,
} from './utils.js';

const CREDITS_SCENE = {
  ambience: 'voidFinale',
  wizardStartX: 104,
  donkeyOffset: -34,
  props: [
    { id: 'finalAngel', type: 'angelBladeForm', x: 236, align: 'ground', parallax: 1 },
  ],
};

export async function runLevelEleven() {
  const plan = levelAmbiencePlan.level11;
  const sceneProps = cloneSceneProps(CREDITS_SCENE.props);
  applySceneConfig({ ...CREDITS_SCENE, props: sceneProps });
  ensureAmbience(plan?.apply ?? CREDITS_SCENE.ambience ?? 'voidFinale');
  setSceneContext({ level: 'level11', phase: 'arrival' });
  setLifeBars(null);

  await showLevelTitle('Abspann');
  await fadeToBase(600);

  const angelSpeech = buildAngelSpeechOptions(sceneProps);
  await propSay(sceneProps, 'finalAngel', 'Bileam, Sohn des Beor, ich bin stolz auf dich.', angelSpeech);
  await divineSay('בדבר יצרתי וכך תוכל גם אתה.\nMit Worten habe ich geschaffen und so kannst du es auch. Worte sind der Code des Universums.');
  await donkeySay('Und ich bin nur eine Eselin.');

  await fadeToBlack(900);
  setSceneContext({ level: 'level11', phase: 'credits' });

  await showLevelTitle('Ende', 6000);
  await showLevelTitle('Story: Buch Numeri, Kapitel 22 bis 24', 6000);
  await showLevelTitle('Idee zum Spiel: Carl-Philip Hänsch', 6000);
  await showLevelTitle('Musik: Suno AI', 6000);
  await showLevelTitle('Umsetzung: GPT5-high', 6000);
}

function buildAngelSpeechOptions(sceneProps) {
  const angel = findProp(sceneProps ?? [], 'finalAngel');
  const bounds = getScenePropBounds('finalAngel');
  const spriteHeight = bounds?.height ?? angel?.sprite?.height ?? 120;
  const estimatedWidth = bounds?.width ?? angel?.sprite?.width ?? 112;
  const offsetY = -Math.max(34, spriteHeight * 0.52);
  const anchorXAngel = () => {
    const liveBounds = getScenePropBounds('finalAngel');
    if (liveBounds) {
      return liveBounds.left + liveBounds.width / 2;
    }
    const baseLeft = angel?.x ?? 236;
    return baseLeft + estimatedWidth / 2;
  };
  const anchorYAngel = () => {
    const liveBounds = getScenePropBounds('finalAngel');
    if (liveBounds) {
      return liveBounds.top + Math.max(10, liveBounds.height * 0.14);
    }
    const baseY = angel?.y ?? 0;
    return baseY + Math.max(10, (angel?.sprite?.height ?? 0) * 0.14);
  };
  return {
    offsetY,
    anchor: 'center',
    anchorX: anchorXAngel,
    anchorY: anchorYAngel,
  };
}
