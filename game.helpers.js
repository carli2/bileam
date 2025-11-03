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

const START_VOWELS = new Set(['o', 'u', 'i']);

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

    if (prevWasSpace && START_VOWELS.has(ch)) {
      result.push('א');
      prevWasSpace = false;
    }

    switch (ch) {
      case 'a':
        result.push('א');
        prevWasSpace = false;
        break;
      case 'o':
        result.push('ו');
        prevWasSpace = false;
        break;
      case 'u':
        result.push('ו');
        prevWasSpace = false;
        break;
      case 'i':
        result.push('א');
        result.push('י');
        prevWasSpace = false;
        break;
      case 'j':
        result.push('י');
        prevWasSpace = false;
        break;
      case 'e':
        result.push('ע');
        prevWasSpace = false;
        break;
      default: {
        const letter = BASE_CONSONANTS[ch];
        if (letter) {
          if (prevWasSpace && (letter === 'י' || letter === 'ו')) {
            result.push('א');
          }
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
