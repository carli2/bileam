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
  t: 'ט',
  v: 'ו',
  w: 'ש',
  x: 'ח',
  y: 'ת',
  z: 'ז',
};

const FINAL_FORMS = {
  'כ': 'ך',
  'מ': 'ם',
  'נ': 'ן',
  'פ': 'ף',
  'צ': 'ץ',
};

function isLetter(char) {
  return /^[a-z]$/i.test(char);
}

function isHebrewChar(char) {
  return /[\u0590-\u05FF]/.test(char);
}

export function transliterateToHebrew(input) {
  if (!input) return '';
  const ascii = input.toLowerCase();
  const result = [];

  for (const ch of ascii) {
    if (ch === ' ') {
      result.push(' ');
      continue;
    }

    if (isHebrewChar(ch)) {
      result.push(ch);
      continue;
    }

    if (!isLetter(ch)) {
      continue;
    }

    switch (ch) {
      case 'a':
        result.push('א');
        break;
      case 'o':
        result.push('ו');
        break;
      case 'u':
        result.push('ו');
        break;
      case 'i':
        result.push('י');
        break;
      case 'j':
        result.push('י');
        break;
      case 'e':
        result.push('ע');
        break;
      default: {
        const letter = BASE_CONSONANTS[ch];
        if (letter) {
          result.push(letter);
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
