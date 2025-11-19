import test from 'node:test';
import assert from 'node:assert/strict';
import { SPELL_DUEL_MACHINE } from '../stateMachines/spellDuelMachine.js';

function getTransition(state, word) {
  return SPELL_DUEL_MACHINE[state]?.transitions?.[word] ?? null;
}

function assertAllows(state, word, message) {
  assert.ok(getTransition(state, word), message);
}

function assertForbids(state, word, message) {
  assert.ok(!getTransition(state, word), message);
}

test('essential elemental counters exist', () => {
  assertAllows('burning', 'מים', 'אש muss weiterhin mit מים gelöscht werden können');
  assertAllows('listening', 'לא', 'שמע braucht das Nein als Antwort');
  assertAllows('overgrown', 'מים', 'חיים kann mit מים gezähmt werden');
  assertAllows('overgrown', 'אש', 'חיים muss durch אש verbrannt werden können');
  assertAllows('steamChamber', 'מים', 'Der Dampf-Knoten muss mit מים abkühlen können');
  assertAllows('radiant', 'מים', 'אור benötigt את מים zur Zerstreuung');
  assertAllows('resonantTrap', 'מים', 'Die Resonanzfalle braucht die Flut als Exit');
  assertAllows('truthPrism', 'ברך', 'אמת im Prisma muss via ברך gewandelt werden können');
  assertAllows('angelic', 'מלאך', 'מלאך muss mit weiterer Engel-Gegenwart beantwortet werden');
  assertAllows('blessing', 'מים', 'Überhitzte ברך-Kreise brauchen מים als Kühlung');
});

test('forbidden elemental replies are blocked', () => {
  assertForbids('burning', 'חיים', 'אש darf nicht mit חיים beantwortet werden');
  assertForbids('burning', 'דבר', 'אש darf nicht mit דבר beantwortet werden');
  assertForbids('flooded', 'אש', 'מים darf nicht mit אש beantwortet werden');
  assertForbids('truth', 'לא', 'אמת darf nicht mit לא beantwortet werden');
  assertForbids('angelic', 'אש', 'מלאך darf nicht mit אש beantwortet werden');
  assertForbids('angelicChorus', 'אש', 'מלאך-Chor darf keine אש-Lösung haben');
  assertForbids('truthPrism', 'לא', 'Das Wahrheitsprisma akzeptiert kein לא');
  assertForbids('overgrown', 'ברך', 'חיים darf nicht mit ברך verwechselt werden');
  assertForbids('steamChamber', 'ברך', 'Der Dampf-Knoten darf keine ברך-Abkürzung besitzen');
  assertForbids('radiant', 'לא', 'אור lässt sich nicht mit לא bändigen');
});
