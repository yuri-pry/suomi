import { expect, test } from 'vitest';
import { accessories, animals, avatarMarkup, defaultLook, expressions, lookString, parseLook } from '../src/design/avatar';

test('a saved look round-trips, and broken or old values fall back part by part', () => {
  const look = { animal: 'kettu', colour: 'pink', style: 'sun', expression: 'uninen', accessory: 'pipo' } as const;
  expect(parseLook(lookString(look))).toEqual(look);
  expect(parseLook('')).toEqual(defaultLook);
  expect(parseLook('kuusi')).toEqual(defaultLook); // a glyph id from before the animals
  expect(parseLook('constructor.__proto__.x')).toEqual(defaultLook);
  expect(parseLook('susi.nope.hill.bad.lasit')).toEqual({ ...defaultLook, animal: 'susi', style: 'hill', accessory: 'lasit' });
});

test('every animal draws with every expression and accessory', () => {
  for (const animal of Object.keys(animals))
    for (const expression of Object.keys(expressions))
      for (const accessory of Object.keys(accessories)) {
        const svg = avatarMarkup({ ...defaultLook, animal, expression, accessory } as typeof defaultLook, 'x');
        expect(svg).not.toMatch(/undefined|NaN|__ID__/);
      }
});

test('the owl keeps orange rings, which grow instead of turning white when surprised', () => {
  const owl = (expression: string) => avatarMarkup({ ...defaultLook, animal: 'pollo', expression } as typeof defaultLook, 'x');
  expect(owl('iloinen')).toContain('r="5.2" fill="#f0a030"');
  expect(owl('yllattynyt')).toContain('r="6.6" fill="#f0a030"');
  expect(owl('yllattynyt')).not.toMatch(/r="5\.06\d*" fill="#fff"/);
});
