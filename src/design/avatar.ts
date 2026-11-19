// Avatar art: Finnish animals in flat two-tone shapes, ported from the approved draft (avatar-drafts, round 12).
// Everything here is a constant SVG fragment in a 100x100 box; the only input is a look whose fields are
// checked against these tables by parseLook, so the markup never carries user text.
import type { Lang } from '../lib/types';

type Label = Record<Lang, string>;
const D = '#2a211c';

// a filled path with rounded corners: the same-colour round stroke softens every point
const p = (d: string, c: string, extra = '') => `<path d="${d}" fill="${c}" stroke="${c}" stroke-width="6" stroke-linejoin="round" ${extra}/>`;
// between faceted and curved: same outline, much rounder corners
const ps = (d: string, c: string) => p(d, c).replace('stroke-width="6"', 'stroke-width="10"');
// softest: for the seal
const pss = (d: string, c: string) => p(d, c).replace('stroke-width="6"', 'stroke-width="15"');
const body = (c: string, chest?: string) => p('M18 100 Q22 82 50 81 Q78 82 82 100 Z', c) + (chest ? p('M40 86 Q50 90 60 86 L57 100 L43 100 Z', chest) : '');

/** Background colours, with the colour block tone (1..7) the profile hero uses for each. */
export const colours = {
  teal: { hex: '#4fa3a5', tone: 5, label: { en: 'Teal', fi: 'Sinivihreä' } },
  pink: { hex: '#ee9fa5', tone: 4, label: { en: 'Pink', fi: 'Vaaleanpunainen' } },
  orange: { hex: '#ef8a4c', tone: 2, label: { en: 'Orange', fi: 'Oranssi' } },
  yellow: { hex: '#f4c249', tone: 2, label: { en: 'Yellow', fi: 'Keltainen' } },
  blue: { hex: '#4b9fd6', tone: 1, label: { en: 'Blue', fi: 'Sininen' } },
  green: { hex: '#9fcb57', tone: 3, label: { en: 'Green', fi: 'Vihreä' } },
  lilac: { hex: '#bf98d4', tone: 6, label: { en: 'Lilac', fi: 'Lila' } },
  navy: { hex: '#2d4a6b', tone: 1, label: { en: 'Navy', fi: 'Tummansininen' } },
} satisfies Record<string, { hex: string; tone: number; label: Label }>;
type Colour = keyof typeof colours;

type Animal = {
  label: Label;
  bg: Colour;
  eyes: [[number, number], [number, number]];
  eyeScale?: number;
  mouth: [number, number] | null;
  /** Where hats and flowers sit: top of the head and its half width. */
  top: number;
  topW: number;
  /** Where scarves and bow ties sit. */
  neck: number;
  back?: string;
  shape: string;
  detail?: string;
};

const siiliSpines = ([[40, 30, '#4e3828', 0], [33, 26, '#6e5039', 0.5]] as const)
  .map(([ro, ri, c, off]) => {
    const n = 22;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const a = Math.PI * (0.82 + ((i + off) * 1.36) / (n + 1));
      const r = i % 2 ? ri : ro;
      pts.push(`${(50 + r * Math.cos(a)).toFixed(1)} ${(66 + r * Math.sin(a)).toFixed(1)}`);
    }
    return p(`M50 98 L${pts.join(' L')} Z`, c);
  })
  .join('');

const norppaHead = 'M36 49 L44 42 L56 42 L64 49 L67 62 L62 72 L50 76 L38 72 L33 62 Z';
const norppaBody = 'M16 100 Q20 82 50 82 Q80 82 84 100 Z';

export const animals = {
  karhu: {
    label: { en: 'Bear', fi: 'Karhu' }, bg: 'teal', eyes: [[40, 52], [60, 52]], mouth: [50, 73], top: 31, topW: 22, neck: 84,
    shape: body('#6f4529') + `<circle cx="31" cy="34" r="10" fill="#8a5a3b"/><circle cx="69" cy="34" r="10" fill="#8a5a3b"/>
      <circle cx="31" cy="34" r="5" fill="#c99a72"/><circle cx="69" cy="34" r="5" fill="#c99a72"/>` +
      p('M28 44 L37 32 L63 32 L72 44 L79 60 L70 74 L50 82 L30 74 L21 60 Z', '#8a5a3b') +
      p('M39 62 L50 58 L61 62 L63 72 L50 79 L37 72 Z', '#dcb892') + p('M45 62 Q50 60 55 62 Q53 66 50 66 Q47 66 45 62 Z', D, 'stroke-width="2"'),
    detail: p('M21 60 L30 58 L28 68 Z', '#a5744f') + p('M79 60 L70 58 L72 68 Z', '#a5744f') +
      `<path d="M35 45 L41 44 M65 45 L59 44" stroke="#5e3b24" stroke-width="2" stroke-linecap="round"/>`,
  },
  kettu: {
    label: { en: 'Fox', fi: 'Kettu' }, bg: 'blue', eyes: [[40, 52], [60, 52]], mouth: [50, 79], top: 33, topW: 21, neck: 86,
    shape: body('#d9611c', '#f6efe6') + p('M25 13 L42 33 L23 42 Z', '#e8742a') + p('M75 13 L58 33 L77 42 Z', '#e8742a') +
      p('M28 23 L37 33 L27 38 Z', D) + p('M72 23 L63 33 L73 38 Z', D) +
      p('M27 46 L30 33 L50 32 L70 33 L73 46 L82 62 L64 70 L50 84 L36 70 L18 62 Z', '#e8742a') +
      p('M18 62 L28 54 L40 64 L50 84 L36 70 Z', '#f6efe6') + p('M82 62 L72 54 L60 64 L50 84 L64 70 Z', '#f6efe6') +
      `<circle cx="50" cy="76" r="3.4" fill="${D}"/>`,
    detail: p('M30 27 L35 33 L29 36 Z', '#f6efe6') + p('M70 27 L65 33 L71 36 Z', '#f6efe6') + p('M44 36 L50 40 L56 36 L50 47 Z', '#d9611c'),
  },
  poro: {
    label: { en: 'Reindeer', fi: 'Poro' }, bg: 'yellow', eyes: [[42, 51], [58, 51]], mouth: [50, 77], top: 35, topW: 16, neck: 88,
    back: `<g stroke="#efe3cf" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <path d="M40 36 L30 20 L21 9 M30 20 L35 8 M30 20 L15 22"/><path d="M60 36 L70 20 L79 9 M70 20 L65 8 M70 20 L85 22"/></g>`,
    shape: body('#7d6149', '#efe3cf') + p('M36 42 L18 38 L28 48 Z', '#9b7b5f') + p('M64 42 L82 38 L72 48 Z', '#9b7b5f') +
      p('M34 38 L44 33 L56 33 L66 38 L66 56 L60 76 L56 87 L44 87 L40 76 L34 56 Z', '#9b7b5f') +
      p('M40 70 L50 67 L60 70 L58 82 L50 86 L42 82 Z', '#cdb79c') + `<ellipse cx="50" cy="72" rx="6" ry="3.6" fill="${D}"/>`,
    detail: p('M30 86 L40 81 L50 87 L60 81 L70 86 L62 95 L50 91 L38 95 Z', '#efe3cf') + p('M45 35 L55 35 L53 52 L47 52 Z', '#7d6149') +
      p('M33 43 L24 40 L29 46 Z', '#cdb79c') + p('M67 43 L76 40 L71 46 Z', '#cdb79c'),
  },
  hirvi: {
    label: { en: 'Moose', fi: 'Hirvi' }, bg: 'green', eyes: [[41, 49], [59, 49]], mouth: [50, 86], top: 34, topW: 17, neck: 91,
    back: p('M36 36 Q24 34 14 22 Q12 30 17 33 Q9 32 7 26 Q7 38 22 41 Z', '#dccaa6') + p('M64 36 Q76 34 86 22 Q88 30 83 33 Q91 32 93 26 Q93 38 78 41 Z', '#dccaa6'),
    shape: body('#5a3d29') + p('M35 44 L18 42 L28 52 Z', '#6b4a33') + p('M65 44 L82 42 L72 52 Z', '#6b4a33') +
      p('M34 40 L44 34 L56 34 L66 40 L66 60 L68 78 L62 90 L38 90 L32 78 L34 60 Z', '#6b4a33') +
      p('M36 70 L50 66 L64 70 L66 82 L58 89 L42 89 L34 82 Z', '#8a6346') +
      `<ellipse cx="44.5" cy="78" rx="2.6" ry="3.4" fill="${D}"/><ellipse cx="55.5" cy="78" rx="2.6" ry="3.4" fill="${D}"/>`,
    detail: p('M47 89 L53 89 L52 97 L48 97 Z', '#4a3020') + p('M33 46 L23 44 L29 50 Z', '#8a6346') + p('M67 46 L77 44 L71 50 Z', '#8a6346') +
      p('M44 36 L56 36 L54 52 L46 52 Z', '#5a3d29'),
  },
  susi: {
    label: { en: 'Wolf', fi: 'Susi' }, bg: 'navy', eyes: [[40, 50], [60, 50]], mouth: [50, 83], top: 31, topW: 22, neck: 90,
    shape: body('#6f747b', '#dfe2e5') + p('M27 11 L41 32 L23 40 Z', '#8a8f96') + p('M73 11 L59 32 L77 40 Z', '#8a8f96') +
      p('M29 21 L36 32 L28 36 Z', '#5c6168') + p('M71 21 L64 32 L72 36 Z', '#5c6168') +
      p('M26 44 L29 31 L50 30 L71 31 L74 44 L81 62 L66 70 L58 86 L42 86 L34 70 L19 62 Z', '#8a8f96') +
      p('M19 62 L28 54 L36 64 L34 70 Z', '#dfe2e5') + p('M81 62 L72 54 L64 64 L66 70 Z', '#dfe2e5') +
      p('M36 56 L44 54 L50 60 L56 54 L64 56 L60 70 L58 86 L42 86 L40 70 Z', '#dfe2e5') +
      `<ellipse cx="50" cy="78" rx="4.6" ry="3.2" fill="${D}"/>`,
    detail: p('M31 26 L34 31 L30 33 Z', '#c9ccd0') + p('M69 26 L66 31 L70 33 Z', '#c9ccd0') + p('M38 33 L62 33 L58 43 L50 47 L42 43 Z', '#6f747b'),
  },
  ilves: {
    label: { en: 'Lynx', fi: 'Ilves' }, bg: 'lilac', eyes: [[40, 50], [60, 50]], mouth: [50, 69], top: 31, topW: 22, neck: 84,
    shape: body('#a8743f', '#f6ecd9') + `<path d="M28 24 L27 11 M72 24 L73 11" stroke="${D}" stroke-width="3" stroke-linecap="round"/>` +
      p('M28 24 L41 36 L24 42 Z', '#3b2c22') + p('M72 24 L59 36 L76 42 Z', '#3b2c22') +
      p('M30 30 L37 36 L28 39 Z', '#e9d3b0') + p('M70 30 L63 36 L72 39 Z', '#e9d3b0') +
      p('M26 46 L28 31 L50 31 L72 31 L74 46 L80 66 L66 71 L50 81 L34 71 L20 66 Z', '#d39a55') +
      p('M20 66 L28 56 L38 64 L50 81 L34 71 Z', '#f6ecd9') + p('M80 66 L72 56 L62 64 L50 81 L66 71 Z', '#f6ecd9') +
      `<g stroke="#4a3426" stroke-width="1.8" stroke-linecap="round"><path d="M24 62 L31 63 M27 67 L34 67 M76 62 L69 63 M73 67 L66 67"/></g>
      <g fill="#7a4f2a"><circle cx="43" cy="38" r="2"/><circle cx="50" cy="36" r="1.6"/><circle cx="57" cy="38" r="2"/><circle cx="31" cy="50" r="2.2"/><circle cx="69" cy="50" r="2.2"/><circle cx="35" cy="43" r="1.4"/><circle cx="65" cy="43" r="1.4"/></g>
      <path d="M50 40 L50 45 M45 41 L46 45 M55 41 L54 45" stroke="#7a4f2a" stroke-width="1.6" stroke-linecap="round"/>
      <ellipse cx="45" cy="64" rx="6.5" ry="5.2" fill="#fff8ec"/><ellipse cx="55" cy="64" rx="6.5" ry="5.2" fill="#fff8ec"/>` +
      p('M47 59 L53 59 L50 62 Z', '#c4746a'),
  },
  norppa: {
    label: { en: 'Saimaa seal', fi: 'Norppa' }, bg: 'pink', eyes: [[39, 53], [61, 53]], eyeScale: 1.5, mouth: [50, 75], top: 35, topW: 22, neck: 90,
    // spots are masked to the outline: they may touch it but never spill out. __ID__ is made unique per copy.
    shape: p(norppaBody, '#6f7a84') + pss(norppaHead, '#8d97a0') +
      `<mask id="__ID__s">` + pss(norppaHead, '#fff') + p(norppaBody, '#fff') + `</mask>
      <g mask="url(#__ID__s)"><g fill="#6c7680"><circle cx="26" cy="57" r="4.5"/><circle cx="38" cy="40" r="3.4"/><circle cx="44" cy="35.5" r="1.6"/><circle cx="62" cy="38" r="2.4"/>
        <circle cx="75" cy="52" r="3.8"/><circle cx="69" cy="74" r="3"/><circle cx="30" cy="72" r="1.8"/><circle cx="56" cy="34" r="2.6"/><circle cx="66" cy="45" r="1.4"/></g>
      <g fill="#5a646d"><circle cx="21" cy="92" r="5"/><circle cx="63" cy="92" r="2.6"/><circle cx="72" cy="88" r="1.8"/><circle cx="41" cy="96" r="1.8"/><circle cx="83" cy="97" r="3.5"/></g></g>
      <ellipse cx="44.5" cy="68" rx="6.5" ry="5.5" fill="#d3d9de"/><ellipse cx="55.5" cy="68" rx="6.5" ry="5.5" fill="#d3d9de"/>` +
      p('M47.5 62 L52.5 62 L50 65 Z', D, 'stroke-width="2"') +
      `<g stroke="#d3d9de" stroke-width="1" stroke-linecap="round"><path d="M38 67 L27 64 M38 70 L27 72 M62 67 L73 64 M62 70 L73 72"/></g>`,
  },
  pollo: {
    label: { en: 'Eagle owl', fi: 'Pöllö' }, bg: 'teal', eyes: [[39, 53], [61, 53]], eyeScale: 1.4, mouth: null, top: 36, topW: 22, neck: 80,
    shape: ps('M33 40 L30 30 L41 35 Z', '#6e5034') + ps('M67 40 L70 30 L59 35 Z', '#6e5034') +
      p('M24 100 L23 58 L30 40 L50 34 L70 40 L77 58 L76 100 Z', '#8d6a48') +
      p('M36 80 L50 75 L64 80 L67 100 L33 100 Z', '#c9a882') +
      `<g stroke="#8d6a48" stroke-width="1.8" fill="none" stroke-linecap="round"><path d="M41 84 l3 3 l3 -3 M53 84 l3 3 l3 -3 M47 92 l3 3 l3 -3"/></g>` +
      p('M28 48 L38 41 L50 47 L62 41 L72 48 L70 61 L50 68 L30 61 Z', '#e8d6b5') +
      p('M46.5 61 L53.5 61 L50 68 Z', '#f0a030', 'stroke-width="2.5"'),
    detail: p('M24 100 L25 66 L33 74 L32 100 Z', '#6e5034') + p('M76 100 L75 66 L67 74 L68 100 Z', '#6e5034') +
      `<path d="M44 37 l2 3 l2 -3 M52 37 l2 3 l2 -3" stroke="#6e5034" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
  },
  orava: {
    label: { en: 'Squirrel', fi: 'Orava' }, bg: 'green', eyes: [[41, 52], [59, 52]], mouth: [50, 69], top: 38, topW: 20, neck: 82,
    back: `<path d="M64 100 Q96 92 92 64 Q90 40 74 42 Q86 52 80 66 Q74 82 60 88 Z" fill="#b5521f"/>`,
    shape: body('#b5561f', '#f3dcc0') + `<path d="M33 22 L32 13 M67 22 L68 13" stroke="#8f3f16" stroke-width="3" stroke-linecap="round"/>` +
      p('M32 42 L32 21 L44 37 Z', '#c8642c') + p('M68 42 L68 21 L56 37 Z', '#c8642c') +
      p('M30 47 L40 37 L60 37 L70 47 L76 60 L62 70 L50 76 L38 70 L24 60 Z', '#c8642c') +
      p('M24 60 L34 58 L38 70 Z', '#f3dcc0') + p('M76 60 L66 58 L62 70 Z', '#f3dcc0') +
      p('M40 61 L50 57 L60 61 L57 70 L50 76 L43 70 Z', '#f3dcc0') + p('M47.5 62 L52.5 62 L50 65 Z', D),
    detail: p('M34 37 L34 27 L40 35 Z', '#e89a6a') + p('M66 37 L66 27 L60 35 Z', '#e89a6a') + p('M44 38 L56 38 L50 46 Z', '#b5561f'),
  },
  janis: {
    label: { en: 'Mountain hare', fi: 'Jänis' }, bg: 'blue', eyes: [[41, 54], [59, 54]], mouth: [50, 68], top: 40, topW: 20, neck: 84,
    shape: body('#d9d4cc') + `<ellipse cx="40" cy="22" rx="6.5" ry="19" transform="rotate(-8 40 22)" fill="#ece8e2"/>
      <ellipse cx="60" cy="22" rx="6.5" ry="19" transform="rotate(8 60 22)" fill="#ece8e2"/>
      <ellipse cx="40" cy="24" rx="3" ry="13" transform="rotate(-8 40 24)" fill="#f2c3c3"/><ellipse cx="60" cy="24" rx="3" ry="13" transform="rotate(8 60 24)" fill="#f2c3c3"/>
      <ellipse cx="38.3" cy="6" rx="4.2" ry="4" fill="${D}"/><ellipse cx="61.7" cy="6" rx="4.2" ry="4" fill="${D}"/>` +
      p('M33 44 L42 38 L58 38 L67 44 L72 58 L77 66 L64 72 L56 80 L44 80 L36 72 L23 66 L28 58 Z', '#ece8e2') +
      `<ellipse cx="45.5" cy="66" rx="6" ry="5" fill="#fff"/><ellipse cx="54.5" cy="66" rx="6" ry="5" fill="#fff"/>` +
      p('M47.5 61 L52.5 61 L50 64 Z', '#d98a8a'),
    detail: p('M23 66 L30 62 L32 70 Z', '#d8d2c8') + p('M77 66 L70 62 L68 70 Z', '#d8d2c8'),
  },
  siili: {
    label: { en: 'Hedgehog', fi: 'Siili' }, bg: 'orange', eyes: [[42, 62], [58, 62]], mouth: [50, 80], top: 34, topW: 22, neck: 90,
    back: siiliSpines,
    shape: body('#4e3828', '#e9cfa6') + `<circle cx="33" cy="52" r="5.5" fill="#d9b88f"/><circle cx="67" cy="52" r="5.5" fill="#d9b88f"/>
      <circle cx="33" cy="52" r="2.6" fill="#b88d63"/><circle cx="67" cy="52" r="2.6" fill="#b88d63"/>` +
      p('M30 60 L40 52 L50 57 L60 52 L70 60 L65 71 L55 81 L45 81 L35 71 Z', '#e9cfa6') +
      `<ellipse cx="50" cy="75" rx="4.4" ry="3.6" fill="${D}"/><circle cx="51.4" cy="74" r="1.1" fill="#fff"/>`,
  },
  lokki: {
    label: { en: 'Gull', fi: 'Lokki' }, bg: 'navy', eyes: [[43, 47], [57, 47]], mouth: null, top: 33, topW: 15, neck: 76,
    shape: p('M12 100 Q16 76 38 74 L62 74 Q84 76 88 100 Z', '#9aa4ad') + p('M36 74 L64 74 L60 100 L40 100 Z', '#f6f6f2') +
      p('M41 62 L59 62 L64 78 L36 78 Z', '#f6f6f2') +
      p('M36 41 L44 33 L56 33 L64 41 L66 55 L59 67 L41 67 L34 55 Z', '#f6f6f2') +
      p('M44.5 53 L55.5 53 L50 66 Z', '#f2c230') + `<circle cx="51.4" cy="60.5" r="1.6" fill="#d8343f"/>`,
    detail: p('M12 100 L18 86 L28 92 L26 100 Z', D) + p('M88 100 L82 86 L72 92 L74 100 Z', D) +
      `<circle cx="20" cy="95" r="1.6" fill="#fff"/><circle cx="80" cy="95" r="1.6" fill="#fff"/>` + p('M44 35 L56 35 L54 40 L46 40 Z', '#e3e6e8'),
  },
} satisfies Record<string, Animal>;

const eye = {
  dot: (x: number, y: number, s: number) => `<circle cx="${x}" cy="${y}" r="${3.4 * s}" fill="${D}"/><circle cx="${x + 1.1 * s}" cy="${y - 1.2 * s}" r="${1.1 * s}" fill="#fff"/>`,
  big: (x: number, y: number, s: number) => `<circle cx="${x}" cy="${y}" r="${4.6 * s}" fill="#fff"/><circle cx="${x}" cy="${y}" r="${3 * s}" fill="${D}"/><circle cx="${x + 1 * s}" cy="${y - 1 * s}" r="${0.9 * s}" fill="#fff"/>`,
  happy: (x: number, y: number, s: number) => `<path d="M${x - 3.6 * s} ${y + 1.2} Q${x} ${y - 4 * s} ${x + 3.6 * s} ${y + 1.2}" stroke="${D}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  sleepy: (x: number, y: number, s: number) => `<path d="M${x - 3.6 * s} ${y} Q${x} ${y + 3 * s} ${x + 3.6 * s} ${y}" stroke="${D}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
};
const mouth = {
  smile: (x: number, y: number) => `<path d="M${x - 5} ${y} Q${x - 2.5} ${y + 3.5} ${x} ${y} Q${x + 2.5} ${y + 3.5} ${x + 5} ${y}" stroke="${D}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
  grin: (x: number, y: number) => `<path d="M${x - 5.5} ${y - 1} Q${x} ${y + 8} ${x + 5.5} ${y - 1} Z" fill="${D}"/><path d="M${x - 2.6} ${y + 3} Q${x} ${y + 1.4} ${x + 2.6} ${y + 3} Q${x} ${y + 5.6} ${x - 2.6} ${y + 3}" fill="#e06a6a"/>`,
  tongue: (x: number, y: number) => `<path d="M${x - 5} ${y} Q${x - 2.5} ${y + 3.5} ${x} ${y} Q${x + 2.5} ${y + 3.5} ${x + 5} ${y}" stroke="${D}" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M${x + 0.5} ${y + 1.5} Q${x + 3} ${y + 7} ${x + 5} ${y + 1.5}" fill="#e06a6a"/>`,
  o: (x: number, y: number) => `<ellipse cx="${x}" cy="${y + 1.5}" rx="2.6" ry="3.2" fill="${D}"/>`,
  flat: (x: number, y: number) => `<path d="M${x - 3} ${y + 1} L${x + 3} ${y + 1}" stroke="${D}" stroke-width="1.8" stroke-linecap="round"/>`,
};

export const expressions = {
  iloinen: { label: { en: 'Happy', fi: 'Iloinen' }, eyes: ['dot', 'dot'], mouth: 'smile' },
  nauraa: { label: { en: 'Laughing', fi: 'Nauraa' }, eyes: ['happy', 'happy'], mouth: 'grin' },
  vinkkaa: { label: { en: 'Wink', fi: 'Vinkkaa' }, eyes: ['dot', 'happy'], mouth: 'tongue' },
  yllattynyt: { label: { en: 'Surprised', fi: 'Yllättynyt' }, eyes: ['big', 'big'], mouth: 'o' },
  uninen: {
    label: { en: 'Sleepy', fi: 'Uninen' }, eyes: ['sleepy', 'sleepy'], mouth: 'flat',
    extra: `<text x="74" y="34" font-size="12" font-weight="700" fill="#fff" font-family="system-ui">z</text><text x="82" y="25" font-size="9" font-weight="700" fill="#fff" font-family="system-ui">z</text>`,
  },
} satisfies Record<string, { label: Label; eyes: [keyof typeof eye, keyof typeof eye]; mouth: keyof typeof mouth; extra?: string }>;

export const accessories = {
  none: { label: { en: 'None', fi: 'Ei mitään' }, draw: () => '' },
  pipo: {
    label: { en: 'Beanie', fi: 'Pipo' },
    draw: (a: Animal) => {
      const t = a.top, w = a.topW;
      return `<path d="M${50 - w} ${t + 6} Q${50 - w} ${t - 16} 50 ${t - 17} Q${50 + w} ${t - 16} ${50 + w} ${t + 6} Z" fill="#d8343f"/>
      <rect x="${50 - w - 2}" y="${t + 1}" width="${2 * w + 4}" height="8" rx="4" fill="#f4f1ea"/><circle cx="50" cy="${t - 18}" r="5" fill="#f4f1ea"/>`;
    },
  },
  huivi: {
    label: { en: 'Scarf', fi: 'Kaulahuivi' },
    draw: (a: Animal) => {
      const n = a.neck;
      return `<path d="M28 ${n - 4} Q50 ${n + 6} 72 ${n - 4} L74 ${n + 4} Q50 ${n + 14} 26 ${n + 4} Z" fill="#2f7fd0"/>
      <path d="M58 ${n + 4} L66 ${n + 4} L68 ${n + 18} L59 ${n + 18} Z" fill="#2f7fd0"/>
      <path d="M30 ${n} L33 ${n + 7} M40 ${n + 3} L42 ${n + 10} M52 ${n + 4} L53 ${n + 11}" stroke="#fff" stroke-width="2.4"/>`;
    },
  },
  lasit: {
    label: { en: 'Glasses', fi: 'Lasit' },
    draw: (a: Animal) => {
      const [[x1, y1], [x2, y2]] = a.eyes, r = 7.5 * (a.eyeScale ?? 1) ** 0.5;
      return `<g fill="rgba(255,255,255,.25)" stroke="${D}" stroke-width="2"><circle cx="${x1}" cy="${y1}" r="${r}"/><circle cx="${x2}" cy="${y2}" r="${r}"/></g>
      <path d="M${x1 + r} ${y1} Q50 ${y1 - 3} ${x2 - r} ${y2}" stroke="${D}" stroke-width="2" fill="none"/>`;
    },
  },
  rusetti: {
    label: { en: 'Bow tie', fi: 'Rusetti' },
    draw: (a: Animal) => {
      const n = a.neck + 4;
      return `<path d="M50 ${n} L39 ${n - 6} L39 ${n + 6} Z M50 ${n} L61 ${n - 6} L61 ${n + 6} Z" fill="#f2b632" stroke="#f2b632" stroke-width="2" stroke-linejoin="round"/><circle cx="50" cy="${n}" r="3" fill="#d99a14"/>`;
    },
  },
  kukka: {
    label: { en: 'Flower', fi: 'Kukka' },
    draw: (a: Animal) => {
      const x = 50 + a.topW - 2, y = a.top + 4;
      return [0, 72, 144, 216, 288].map((d) => `<ellipse cx="${x}" cy="${y - 4.5}" rx="3" ry="4.5" transform="rotate(${d} ${x} ${y})" fill="#fff"/>`).join('') + `<circle cx="${x}" cy="${y}" r="2.8" fill="#f4c249"/>`;
    },
  },
} satisfies Record<string, { label: Label; draw: (a: Animal) => string }>;

// Two-tone backgrounds: a darker field with a lighter shape in it.
export const bgStyles = {
  halo: { label: { en: 'Halo', fi: 'Kehä' }, draw: (c: string) => `<rect width="100" height="100" fill="${c}"/><rect width="100" height="100" fill="#000" opacity=".12"/><circle cx="50" cy="52" r="38" fill="${c}"/>` },
  hill: { label: { en: 'Hill', fi: 'Mäki' }, draw: (c: string) => `<rect width="100" height="100" fill="${c}"/><path d="M0 66 Q30 52 60 60 Q82 66 100 58 V100 H0 Z" fill="#000" opacity=".12"/>` },
  sun: { label: { en: 'Sun', fi: 'Aurinko' }, draw: (c: string) => `<rect width="100" height="100" fill="${c}"/><circle cx="26" cy="24" r="34" fill="#fff" opacity=".18"/>` },
} satisfies Record<string, { label: Label; draw: (c: string) => string }>;

export type Look = {
  animal: keyof typeof animals;
  /** '' means the animal's own colour, so changing animal keeps a matching background until one is picked. */
  colour: Colour | '';
  style: keyof typeof bgStyles;
  expression: keyof typeof expressions;
  accessory: keyof typeof accessories;
};

export const defaultLook: Look = { animal: 'karhu', colour: '', style: 'halo', expression: 'iloinen', accessory: 'none' };

const pick = <T extends string>(table: object, value: string | undefined, fallback: T) => (value !== undefined && Object.hasOwn(table, value) ? (value as T) : fallback);

/** Reads the saved avatar string (animal.colour.style.expression.accessory). Each part falls back on its own,
 *  so a broken or pre-animal value (the old glyph ids like 'kuusi') gives the default look. */
export function parseLook(saved: string): Look {
  const [animal, colour, style, expression, accessory] = saved.split('.');
  return {
    animal: pick(animals, animal, defaultLook.animal),
    colour: colour === '' ? '' : pick(colours, colour, defaultLook.colour),
    style: pick(bgStyles, style, defaultLook.style),
    expression: pick(expressions, expression, defaultLook.expression),
    accessory: pick(accessories, accessory, defaultLook.accessory),
  };
}

export const lookString = (l: Look) => [l.animal, l.colour, l.style, l.expression, l.accessory].join('.');

export const lookColour = (l: Look) => colours[l.colour || animals[l.animal].bg];

/** The inner markup of a 100x100 avatar svg. `id` must be unique in the document and safe inside url(#…). */
export function avatarMarkup(look: Look, id: string) {
  const a: Animal = animals[look.animal];
  const e = expressions[look.expression];
  const s = a.eyeScale ?? 1;
  const eyes = (e.eyes as readonly (keyof typeof eye)[]).map((k, i) => eye[k](a.eyes[i][0], a.eyes[i][1], s)).join('');
  const face = eyes + (a.mouth ? mouth[e.mouth](...a.mouth) : '') + ('extra' in e ? e.extra : '');
  const raw = (a.back ?? '') + a.shape + (a.detail ?? '');
  // depth: each shape gets a crisp shadow along its lower-right edge (the art minus a copy nudged up-left);
  // the erode-then-dilate filter rounds only its sharp tips
  return `<defs><clipPath id="${id}c"><circle cx="50" cy="50" r="50"/></clipPath>
      <filter id="${id}w"><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter>
      <filter id="${id}o"><feMorphology operator="erode" radius="1.3"/><feMorphology operator="dilate" radius="1.3"/></filter>
      <filter id="${id}k"><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/></filter>
      <mask id="${id}m"><g filter="url(#${id}w)">${raw.replaceAll('__ID__', id + 'w')}</g><g filter="url(#${id}k)" transform="translate(-3.5 -4.5)">${raw.replaceAll('__ID__', id + 'k')}</g></mask></defs>
    <g clip-path="url(#${id}c)">
      ${bgStyles[look.style].draw(lookColour(look).hex)}
      ${raw.replaceAll('__ID__', id)}
      <g filter="url(#${id}o)" opacity=".16"><rect width="100" height="100" fill="#000" mask="url(#${id}m)"/></g>
      ${face}${accessories[look.accessory].draw(a)}
    </g>`;
}
