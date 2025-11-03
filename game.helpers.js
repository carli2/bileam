const BASE_CONSONANTS = {
  b: 'ב',
  c: 'צ',
  d: 'ד',
  e: 'ע',
  f: 'פ',
  g: 'ג',
  h: 'ה',
  k: 'כ',
  l: 'ל',
  m: 'מ',
  n: 'נ',
  p: 'פ',
  q: 'ק',
  r: 'ר',
  s: 'ס',
  t: 'ת',
  v: 'ו',
  w: 'ש',
  x: 'ח',
  y: 'ט',
  z: 'ז',
};

const FINAL_FORMS = {
  'כ': 'ך',
  'מ': 'ם',
  'נ': 'ן',
  'פ': 'ף',
  'צ': 'ץ',
};

const START_VOWELS = new Set(['a', 'o', 'u', 'i', 'j']);

function isLetter(char) {
  return /^[a-z]$/i.test(char);
}

export function transliterateToHebrew(input) {
  if (!input) return '';
  const ascii = input.toLowerCase();
  const result = [];
  let prevWasSpace = true;

  for (const ch of ascii) {
    if (ch === ' ') {
      result.push(' ');
      prevWasSpace = true;
      continue;
    }

    if (!isLetter(ch)) {
      continue;
    }

    if (START_VOWELS.has(ch) && prevWasSpace && ch !== 'e') {
      result.push('א');
      prevWasSpace = false;
    }

    switch (ch) {
      case 'a':
        // Already handled via Alef; nothing else to append
        break;
      case 'o':
        result.push('ו');
        break;
      case 'u':
        result.push('ו');
        break;
      case 'i':
      case 'j':
        result.push('י');
        break;
      case 'e':
        result.push('ע');
        prevWasSpace = false;
        break;
      default: {
        const letter = BASE_CONSONANTS[ch];
        if (letter) {
          result.push(letter);
          prevWasSpace = false;
        }
        break;
      }
    }
  }

  let i = result.length - 1;
  while (i >= 0) {
    const char = result[i];
    if (char === ' ') {
      i--;
      continue;
    }
    if (FINAL_FORMS[char]) {
      result[i] = FINAL_FORMS[char];
    }
    break;
  }

  return result.join('');
}
