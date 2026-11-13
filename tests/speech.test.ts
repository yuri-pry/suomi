import { expect, test } from 'vitest';
import { finnishVoice } from '../src/lib/speech';
import { playable } from '../src/lib/lesson';
import type { Exercise } from '../src/lib/types';

test('finds a Finnish voice whatever the tag format', () => {
  expect(finnishVoice([{ lang: 'en-US' }, { lang: 'fi-FI' }])).toEqual({ lang: 'fi-FI' });
  expect(finnishVoice([{ lang: 'fi_FI' }])).toEqual({ lang: 'fi_FI' }); // Android uses underscores
  expect(finnishVoice([{ lang: 'fi' }])).toEqual({ lang: 'fi' });
  expect(finnishVoice([{ lang: 'en-US' }, { lang: 'fil-PH' }, { lang: 'sv-FI' }])).toBeNull();
  expect(finnishVoice([])).toBeNull();
});

test('listening exercises are dropped when the device cannot speak Finnish', () => {
  const exercise = (id: string, type: 'choice' | 'listen'): Exercise => ({
    id,
    type,
    prompt: 'Hei',
    promptLang: 'fi',
    answerLang: 'en',
    options: ['Hello', 'Bye'],
    answer: 0,
  });
  const exercises = [exercise('a', 'choice'), exercise('b', 'listen')];
  expect(playable(exercises, true)).toHaveLength(2);
  expect(playable(exercises, false).map((e) => e.id)).toEqual(['a']);
});
