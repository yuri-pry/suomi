import { expect, test } from 'vitest';
import { splitWords } from '../src/lib/words';

test('splits a sentence into tappable words, leaving blanks and punctuation as text', () => {
  const words = (s: string) => splitWords(s).filter((p) => p.word).map((p) => p.text);
  expect(words('Minä olen Anna.')).toEqual(['Minä', 'olen', 'Anna']);
  expect(words('Syön ___.')).toEqual(['Syön']);
  expect(words("Asun EU:ssa, vaa'an luona.")).toEqual(['Asun', 'EU:ssa', "vaa'an", 'luona']);
  expect(splitWords('Hei, Anna!').map((p) => p.text).join('')).toBe('Hei, Anna!');
  expect(splitWords('')).toEqual([]);
});
