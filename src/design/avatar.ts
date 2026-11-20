// Avatar art: Finnish animals in flat two-tone shapes, ported from the approved draft (avatar-drafts, round 12).
// Everything here is a constant SVG fragment in a 100x100 box; the only input is a look whose fields are
// checked against these tables by parseLook, so the markup never carries user text.
import type { Lang } from '../lib/types';

type Label = Record<Lang, string>;
const D = '#2a211c';

// depth: a shape casts its own shadow on its right edge (itself minus a copy nudged left), so shapes drawn
// later cover it and every tip tapers the same way. Ids come from a counter at load, so they stay fixed.
let casts = 0;
const cast = (f: string, dx = 3.5, by = f) => {
  const m = `__ID__d${casts++}`;
  return f + `<mask id="${m}" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><g filter="url(#__ID__W)">${f}</g>` +
    `<g filter="url(#__ID__K)" transform="translate(-${dx} 0)">${by}</g></mask><rect width="100" height="100" opacity=".16" mask="url(#${m})"/>`;
};
// a filled path with rounded corners: the same-colour round stroke softens every point
const path = (d: string, c: string, w: number, extra = '') => `<path d="${d}" fill="${c}" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" ${extra}/>`;
const p = (d: string, c: string, extra = '') => cast(path(d, c, 6, extra));
// a convex polygon (clockwise on screen) with a true circular fillet of its own radius at each corner
const fillet = (pts: [number, number][], rs: number[]) =>
  pts.map(([x, y], i) => {
    const [ax, ay] = pts[(i + pts.length - 1) % pts.length], [bx, by] = pts[(i + 1) % pts.length];
    const la = Math.hypot(ax - x, ay - y), lb = Math.hypot(bx - x, by - y);
    const u = [(ax - x) / la, (ay - y) / la], v = [(bx - x) / lb, (by - y) / lb];
    const t = rs[i] / Math.tan(Math.acos(u[0] * v[0] + u[1] * v[1]) / 2);
    const f = (n: number) => n.toFixed(2);
    return `${i ? 'L' : 'M'}${f(x + u[0] * t)} ${f(y + u[1] * t)} A${rs[i]} ${rs[i]} 0 0 1 ${f(x + v[0] * t)} ${f(y + v[1] * t)}`;
  }).join(' ') + ' Z';
// between faceted and curved: same outline, much rounder corners
const ps = (d: string, c: string) => cast(path(d, c, 10));
// softest: for the seal
const pss = (d: string, c: string) => cast(path(d, c, 15));
// softer still: the seal's head
const psss = (d: string, c: string) => cast(path(d, c, 24));
// no shadow: forehead marks stay flat
const flat = (s: string) => s.slice(0, s.indexOf('<mask'));
// half-strength shadow: left cheeks, whose shaded edge faces the middle of the face
const light = (s: string) => s.replace('opacity=".16"', 'opacity=".07"');
// centred shape with a notch on top: its shadow comes from the outline with the notch filled, so the notch
// shades nothing on the left side of the face
const notched = (d: string, filled: string, c: string, w: number) => cast(path(d, c, w), 3.5, path(filled, c, w));
// shoulders: a heavy rounded trapezoid, its top and bottom half widths set per animal
const body = (c: string, chest?: string, top = 14, base = 30) => pss(`M${50 - top} 88 L${50 + top} 88 L${50 + base} 104 L${50 - base} 104 Z`, c) + (chest ? p('M42.5 89 L57.5 89 L60 101 L40 101 Z', chest) : '');

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

const norppaHead = 'M38.1 50.5 L44.9 44.5 L55.1 44.5 L61.9 50.5 L64.5 61.6 L60.2 70.1 L50 73.5 L39.8 70.1 L35.5 61.6 Z';
const norppaBody = 'M35 89 L65 89 L82 104 L18 104 Z';

export const animals = {
  karhu: {
    label: { en: 'Bear', fi: 'Karhu' }, bg: 'teal', eyes: [[40, 52], [60, 52]], mouth: [50, 73], top: 31, topW: 22, neck: 84,
    shape: body('#6f4529', '#a5744f', 18, 36) + cast('<circle cx="31" cy="34" r="10" fill="#8a5a3b"/>') + cast('<circle cx="69" cy="34" r="10" fill="#8a5a3b"/>') + `
      ` + cast('<circle cx="31" cy="34" r="5" fill="#c99a72"/>') + cast('<circle cx="69" cy="34" r="5" fill="#c99a72"/>') +
      p('M28 44 L37 32 L63 32 L72 44 L79 60 L70 74 L50 82 L30 74 L21 60 Z', '#8a5a3b') +
      p('M39 62 L50 58 L61 62 L63 72 L50 79 L37 72 Z', '#dcb892') + p('M45 62 Q50 60 55 62 Q53 66 50 66 Q47 66 45 62 Z', D, 'stroke-width="2"'),
    detail: light(p('M21 60 L30 58 L28 68 Z', '#a5744f')) + p('M79 60 L70 58 L72 68 Z', '#a5744f') +
      `<path d="M35 45 L41 44 M65 45 L59 44" stroke="#5e3b24" stroke-width="2" stroke-linecap="round"/>`,
  },
  kettu: {
    label: { en: 'Fox', fi: 'Kettu' }, bg: 'blue', eyes: [[40, 52], [60, 52]], mouth: [50, 81], top: 33, topW: 21, neck: 86,
    shape: body('#d9611c', '#f6efe6', 12, 26) + p('M25 13 L42 33 L23 42 Z', '#e8742a') + p('M75 13 L58 33 L77 42 Z', '#e8742a') +
      p('M28 23 L37 33 L27 38 Z', D) + p('M72 23 L63 33 L73 38 Z', D) +
      p('M27 46 L30 33 L50 32 L70 33 L73 46 L82 62 L64 70 L50 84 L36 70 L18 62 Z', '#e8742a') +
      light(p('M18 62 L28 54 L40 64 L50 84 L36 70 Z', '#f6efe6')) + p('M82 62 L72 54 L60 64 L50 84 L64 70 Z', '#f6efe6') +
      `<circle cx="50" cy="76" r="3.4" fill="${D}"/>`,
    detail: p('M30 27 L35 33 L29 36 Z', '#f6efe6') + p('M70 27 L65 33 L71 36 Z', '#f6efe6') + flat(p('M44 36 L50 40 L56 36 L50 47 Z', '#d9611c')),
  },
  poro: {
    label: { en: 'Reindeer', fi: 'Poro' }, bg: 'yellow', eyes: [[42, 51], [58, 51]], mouth: [50, 77], top: 35, topW: 16, neck: 88,
    back: cast(`<g stroke="#efe3cf" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <path d="M40 36 L30 20 L21 9 M30 20 L35 8 M30 20 L15 22"/><path d="M60 36 L70 20 L79 9 M70 20 L65 8 M70 20 L85 22"/></g>`),
    shape: body('#7d6149', '#efe3cf') + p('M30 86 L40 81 L50 87 L60 81 L70 86 L62 95 L50 91 L38 95 Z', '#efe3cf') + p('M36 42 L18 38 L28 48 Z', '#9b7b5f') + p('M64 42 L82 38 L72 48 Z', '#9b7b5f') +
      p('M34 38 L44 33 L56 33 L66 38 L66 56 L60 76 L56 87 L44 87 L40 76 L34 56 Z', '#9b7b5f') +
      p('M40 70 L50 67 L60 70 L58 82 L50 86 L42 82 Z', '#cdb79c') + `<ellipse cx="50" cy="72" rx="6" ry="3.6" fill="${D}"/>`,
    detail: flat(p('M45 35 L55 35 L53 52 L47 52 Z', '#7d6149')) +
      p('M33 43 L24 40 L29 46 Z', '#cdb79c') + p('M67 43 L76 40 L71 46 Z', '#cdb79c'),
  },
  hirvi: {
    label: { en: 'Moose', fi: 'Hirvi' }, bg: 'green', eyes: [[41, 49], [59, 49]], mouth: [50, 84.5], top: 34, topW: 17, neck: 91,
    back: p('M36 36 Q24 34 14 22 Q12 30 17 33 Q9 32 7 26 Q7 38 22 41 Z', '#dccaa6') + p('M64 36 Q76 34 86 22 Q88 30 83 33 Q91 32 93 26 Q93 38 78 41 Z', '#dccaa6'),
    shape: body('#5a3d29', undefined, 17, 31) + p('M35 44 L18 42 L28 52 Z', '#6b4a33') + p('M65 44 L82 42 L72 52 Z', '#6b4a33') +
      p('M34 40 L44 34 L56 34 L66 40 L66 60 L68 78 L62 90 L38 90 L32 78 L34 60 Z', '#6b4a33') +
      p('M36 70 L50 66 L64 70 L66 82 L58 89 L42 89 L34 82 Z', '#8a6346') +
      `<ellipse cx="44.5" cy="78" rx="2.6" ry="3.4" fill="${D}"/><ellipse cx="55.5" cy="78" rx="2.6" ry="3.4" fill="${D}"/>`,
    detail: p('M47 91.5 L53 91.5 L52 98.5 L48 98.5 Z', '#4a3020') + p('M33 46 L23 44 L29 50 Z', '#8a6346') + p('M67 46 L77 44 L71 50 Z', '#8a6346') +
      flat(p('M44 36 L56 36 L54 52 L46 52 Z', '#5a3d29')),
  },
  susi: {
    label: { en: 'Wolf', fi: 'Susi' }, bg: 'navy', eyes: [[40, 50], [60, 50]], mouth: [50, 83], top: 31, topW: 22, neck: 90,
    shape: body('#6f747b', '#dfe2e5', 15, 30) + p('M27 11 L41 32 L23 40 Z', '#8a8f96') + p('M73 11 L59 32 L77 40 Z', '#8a8f96') +
      p('M29 21 L36 32 L28 36 Z', '#5c6168') + p('M71 21 L64 32 L72 36 Z', '#5c6168') +
      p('M26 44 L31.5 32.5 L50 30 L68.5 32.5 L74 44 L81 62 L66 70 L58 86 L42 86 L34 70 L19 62 Z', '#8a8f96') +
      light(p('M19 62 L28 54 L36 64 L34 70 Z', '#dfe2e5')) + p('M81 62 L72 54 L64 64 L66 70 Z', '#dfe2e5') +
      notched('M36 56 L44 54 L50 60 L56 54 L64 56 L60 70 L58 86 L42 86 L40 70 Z', 'M36 56 L44 54 L56 54 L64 56 L60 70 L58 86 L42 86 L40 70 Z', '#dfe2e5', 6) +
      `<ellipse cx="50" cy="78" rx="4.6" ry="3.2" fill="${D}"/>`,
    detail: p('M31 26 L34 31 L30 33 Z', '#c9ccd0') + p('M69 26 L66 31 L70 33 Z', '#c9ccd0') + flat(p('M38 33 L62 33 L58 43 L50 47 L42 43 Z', '#6f747b')),
  },
  ilves: {
    label: { en: 'Lynx', fi: 'Ilves' }, bg: 'lilac', eyes: [[40, 50], [60, 50]], mouth: [50, 69], top: 31, topW: 22, neck: 84,
    shape: body('#a8743f', '#f6ecd9', 15, 33) + `<path d="M26 16 L24.8 6.5 M74 16 L75.2 6.5" stroke="${D}" stroke-width="3" stroke-linecap="round"/>` +
      p('M26 16 L42 32 L25.5 40 Z', '#d39a55') + p('M74 16 L58 32 L74.5 40 Z', '#d39a55') +
      // dark tips: the ear outline itself, clipped above a rounded V so they keep clear of the inner dark shape
      `<clipPath id="__ID__t"><path d="M-0 4.9 L37.1 -10 L43.5 22.1 L29.5 18.3 Q26.5 17.3 25 20 L17.6 32.5 Z M100 4.9 L62.9 -10 L56.5 22.1 L70.5 18.3 Q73.5 17.3 75 20 L82.4 32.5 Z"/></clipPath>` +
      `<g clip-path="url(#__ID__t)">` + p('M26 16 L42 32 L25.5 40 Z', '#3b2c22') + p('M74 16 L58 32 L74.5 40 Z', '#3b2c22') + `</g>` +
      // like the fox: the dark inner ear sits behind the head and is cut by it, the light one sits over it
      p('M28.5 22.4 L40.6 34.1 L27.5 40.2 Z', '#3b2c22') + p('M71.5 22.4 L59.4 34.1 L72.5 40.2 Z', '#3b2c22') +
      p('M26 46 L30.5 32.5 L50 31 L69.5 32.5 L74 46 L80 66 L66 71 L50 81 L34 71 L20 66 Z', '#d39a55') +
      // like the fox's: rounder, and set toward the face so the dark rim is wider on the outer side and top
      p('M30.4 26.5 L35.9 32.5 L29.4 36 Z', '#e9d3b0') + p('M69.6 26.5 L64.1 32.5 L70.6 36 Z', '#e9d3b0') +
      light(p('M20 66 L28 56 L38 64 L50 64 L50 81 L34 71 Z', '#f6ecd9')) + p('M80 66 L72 56 L62 64 L50 64 L50 81 L66 71 Z', '#f6ecd9') +
      `<g stroke="#4a3426" stroke-width="1.8" stroke-linecap="round"><path d="M24 62 L31 63 M27 67 L34 67 M76 62 L69 63 M73 67 L66 67"/></g>
      <g fill="#7a4f2a"><circle cx="43" cy="38" r="2"/><circle cx="50" cy="36" r="1.6"/><circle cx="57" cy="38" r="2"/><circle cx="31" cy="50" r="2.2"/><circle cx="69" cy="50" r="2.2"/><circle cx="35" cy="43" r="1.4"/><circle cx="65" cy="43" r="1.4"/></g>
      <path d="M50 40 L50 45 M45 41 L46 45 M55 41 L54 45" stroke="#7a4f2a" stroke-width="1.6" stroke-linecap="round"/>
      <ellipse cx="45" cy="64" rx="6.5" ry="5.2" fill="#fff8ec"/><ellipse cx="55" cy="64" rx="6.5" ry="5.2" fill="#fff8ec"/>` +
      p('M47 59 L53 59 L50 62 Z', '#c4746a'),
  },
  norppa: {
    label: { en: 'Saimaa seal', fi: 'Norppa' }, bg: 'pink', eyes: [[39, 53], [61, 53]], eyeScale: 1.5, mouth: [50, 72.5], top: 33, topW: 23, neck: 90,
    // spots are masked to the outline: they may touch it but never spill out. __ID__ is made unique per copy.
    shape: pss(norppaBody, '#6f7a84') + psss(norppaHead, '#8d97a0') +
      `<mask id="__ID__s">` + path(norppaHead, '#fff', 24) + path(norppaBody, '#fff', 15) + `</mask>
      <g mask="url(#__ID__s)"><g fill="#6c7680"><circle cx="26" cy="57" r="4.5"/><circle cx="38" cy="40" r="3.4"/><circle cx="44" cy="35.5" r="1.6"/><circle cx="62" cy="38" r="2.4"/>
        <circle cx="75" cy="52" r="3.8"/><circle cx="69" cy="74" r="3"/><circle cx="30" cy="72" r="1.8"/><circle cx="56" cy="34" r="2.6"/><circle cx="66" cy="45" r="1.4"/></g>
      <g fill="#5a646d"><circle cx="21" cy="92" r="5"/><circle cx="63" cy="92" r="2.6"/><circle cx="72" cy="88" r="1.8"/><circle cx="41" cy="96" r="1.8"/><circle cx="83" cy="97" r="3.5"/></g></g>
      <ellipse cx="44.5" cy="68" rx="6.5" ry="5.5" fill="#d3d9de"/><ellipse cx="55.5" cy="68" rx="6.5" ry="5.5" fill="#d3d9de"/>` +
      p('M47.5 64 L52.5 64 L50 67 Z', D, 'stroke-width="2"') +
      `<g stroke="#d3d9de" stroke-width="1" stroke-linecap="round"><path d="M38 67 L27 64 M38 70 L27 72 M62 67 L73 64 M62 70 L73 72"/></g>`,
  },
  pollo: {
    // eagle owl: a big tapering body, a smaller head sunk into it, tufts at the top corners, orange eyes
    label: { en: 'Eagle owl', fi: 'Pöllö' }, bg: 'teal', eyes: [[41.5, 53], [58.5, 53]], eyeScale: 1.1, mouth: null, top: 38, topW: 18, neck: 74,
    shape: pss('M35 66 L65 66 L77 104 L23 104 Z', '#7a5a3c') +
      ps('M22 104 L27 76 L34 85 L33 104 Z', '#5e4430') + ps('M78 104 L73 76 L66 85 L67 104 Z', '#5e4430') +
      ps('M42 76 L58 76 L61.5 104 L38.5 104 Z', '#d8bf98') +
      `<g stroke="#8a6a48" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${[[80, [42, 48, 54]], [86, [39, 45, 51, 57]], [92, [42, 48, 54]], [98, [39, 45, 51, 57]]]
        .flatMap(([y, xs]) => (xs as number[]).map((x) => `M${x} ${y} l2 2 l2 -2`)).join(' ')}"/></g>` +
      p('M35.2 40.6 L31.9 30.2 L40.8 37.9 Z', '#5e4430') + p('M64.8 40.6 L68.1 30.2 L59.2 37.9 Z', '#5e4430') +
      ps('M33 45 L40 38.5 L50 37 L60 38.5 L67 45 L68 58 L62 67 L50 70 L38 67 L32 58 Z', '#8d6a48') +
      notched('M37 49 L43 45.5 L50 48.5 L57 45.5 L63 49 L62 58 L50 63.5 L38 58 Z', 'M37 49 L43 45.5 L57 45.5 L63 49 L62 58 L50 63.5 L38 58 Z', '#dcc39a', 10) +
      `<circle cx="41.5" cy="53" r="5.2" fill="#f0a030"/><circle cx="58.5" cy="53" r="5.2" fill="#f0a030"/>` +
      cast(`<path d="${fillet([[45, 57.8], [55, 57.8], [50, 68.5]], [2.3, 2.3, 0.8])}" fill="#4a3a30"/>`) + `<g fill="#8a776a"><ellipse cx="48.2" cy="59.2" rx=".75" ry=".55"/><ellipse cx="51.8" cy="59.2" rx=".75" ry=".55"/></g>`,
  },
  orava: {
    label: { en: 'Squirrel', fi: 'Orava' }, bg: 'green', eyes: [[41, 52], [59, 52]], mouth: [50, 69], top: 38, topW: 20, neck: 82,
    back: cast('<path d="M64 100 Q96 92 92 64 Q90 40 74 42 Q86 52 80 66 Q74 82 60 88 Z" fill="#b5521f"/>'),
    shape: body('#b5561f', '#f3dcc0', 11, 24) + `<path d="M33 22 L32 13 M67 22 L68 13" stroke="#8f3f16" stroke-width="3" stroke-linecap="round"/>` +
      p('M32 42 L32 21 L44 37 Z', '#c8642c') + p('M68 42 L68 21 L56 37 Z', '#c8642c') +
      p('M30 47 L40 37 L60 37 L70 47 L76 60 L63 73 L50 80 L37 73 L24 60 Z', '#c8642c') +
      light(p('M24 60 L33 58 L41 68 L37 73 Z', '#f3dcc0')) + p('M76 60 L67 58 L59 68 L63 73 Z', '#f3dcc0') +
      p('M40 61 L50 57 L60 61 L58 72 L50 79 L42 72 Z', '#f3dcc0') + p('M47.5 62 L52.5 62 L50 65 Z', D),
    detail: flat(p('M44 38 L56 38 L50 46 Z', '#b5561f')) + p('M34 37 L34 27 L40 35 Z', '#e89a6a') + p('M66 37 L66 27 L60 35 Z', '#e89a6a'),
  },
  janis: {
    label: { en: 'Mountain hare', fi: 'Jänis' }, bg: 'blue', eyes: [[41, 54], [59, 54]], mouth: [50, 68], top: 40, topW: 20, neck: 84,
    shape: body('#b07f4f', '#f3ece2', 11, 24) + cast('<ellipse cx="40" cy="22" rx="6.5" ry="19" transform="rotate(-8 40 22)" fill="#d6a06a"/>') +
      cast('<ellipse cx="60" cy="22" rx="6.5" ry="19" transform="rotate(8 60 22)" fill="#d6a06a"/>') + `
      ` + cast('<ellipse cx="40" cy="24" rx="3" ry="13" transform="rotate(-8 40 24)" fill="#e9a99b"/>', 1.4) + cast('<ellipse cx="60" cy="24" rx="3" ry="13" transform="rotate(8 60 24)" fill="#e9a99b"/>', 1.4) + `
      <clipPath id="__ID__h"><path d="M30 0 L70 0 L70 13.9 L66.5 13.9 L61.8 9 Q60 7.1 58.2 9 L53.5 13.9 L46.5 13.9 L41.8 9 Q40 7.1 38.2 9 L33.5 13.9 L30 13.9 Z"/></clipPath>
      <g transform="rotate(-8 40 22)"><ellipse cx="40" cy="22" rx="6.5" ry="19" fill="${D}" clip-path="url(#__ID__h)"/></g><g transform="rotate(8 60 22)"><ellipse cx="60" cy="22" rx="6.5" ry="19" fill="${D}" clip-path="url(#__ID__h)"/></g>` +
      p('M33 44 L42 38 L58 38 L67 44 L71 58 L72.5 65 L64 72 L56 80 L44 80 L36 72 L27.5 65 L29 58 Z', '#d6a06a') +
      `<ellipse cx="45.5" cy="66" rx="6" ry="5" fill="#f6efe6"/><ellipse cx="54.5" cy="66" rx="6" ry="5" fill="#f6efe6"/>` +
      p('M47.5 61 L52.5 61 L50 64 Z', '#3b2c22'),
    detail: light(ps('M28.8 65 L31.5 63.2 L32.4 67.4 Z', '#c48d58')) + ps('M71.2 65 L68.5 63.2 L67.6 67.4 Z', '#c48d58'),
  },
  siili: {
    label: { en: 'Hedgehog', fi: 'Siili' }, bg: 'orange', eyes: [[42, 62], [58, 62]], mouth: [50, 80], top: 34, topW: 22, neck: 90,
    back: siiliSpines,
    shape: body('#4e3828', '#e9cfa6', 16, 35) + `<circle cx="33" cy="52" r="5.5" fill="#d9b88f"/><circle cx="67" cy="52" r="5.5" fill="#d9b88f"/>` +
      cast('<circle cx="33" cy="52" r="2.6" fill="#b88d63"/>', 1.4) + cast('<circle cx="67" cy="52" r="2.6" fill="#b88d63"/>', 1.4) +
      notched('M30 60 L40 52 L50 57 L60 52 L70 60 L65 71 L55 81 L45 81 L35 71 Z', 'M30 60 L40 52 L60 52 L70 60 L65 71 L55 81 L45 81 L35 71 Z', '#e9cfa6', 6) +
      `<ellipse cx="50" cy="75" rx="4.4" ry="3.6" fill="${D}"/><circle cx="51.4" cy="74" r="1.1" fill="#fff"/>`,
  },
  lokki: {
    label: { en: 'Gull', fi: 'Lokki' }, bg: 'navy', eyes: [[43, 47], [57, 47]], mouth: null, top: 33, topW: 15, neck: 76,
    shape: pss('M37 82 L63 82 L86 104 L14 104 Z', '#9aa4ad') + p('M36 74 L64 74 L60 100 L40 100 Z', '#f6f6f2') +
      p('M41 62 L59 62 L64 78 L36 78 Z', '#f6f6f2') +
      cast(path('M38 42 L45 35 L55 35 L62 42 L64 55 L58 65 L42 65 L36 55 Z', '#f6f6f2', 10) + path('M44 35 L56 35 L54 40 L46 40 Z', '#e3e6e8', 6)) +
      cast(`<path d="${fillet([[41.5, 51], [58.5, 51], [50, 69.5]], [3, 3, 1.6])}" fill="#f2c230"/>`) + `<g fill="#a87f12"><ellipse cx="47" cy="53.6" rx=".9" ry=".6"/><ellipse cx="53" cy="53.6" rx=".9" ry=".6"/></g><circle cx="51.4" cy="60.5" r="1.6" fill="#d8343f"/>`,
    detail: p('M18 104 L26 93 L31 98 L29 104 Z', D) + p('M82 104 L74 93 L69 98 L71 104 Z', D) +
      `<circle cx="25" cy="100" r="1.4" fill="#fff"/><circle cx="75" cy="100" r="1.4" fill="#fff"/>`,
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
  return `<defs><clipPath id="${id}c"><circle cx="50" cy="50" r="50"/></clipPath>
      <filter id="${id}W" filterUnits="userSpaceOnUse" x="-20" y="-20" width="140" height="140"><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter>
      <filter id="${id}K" filterUnits="userSpaceOnUse" x="-20" y="-20" width="140" height="140"><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/></filter></defs>
    <g clip-path="url(#${id}c)">
      ${bgStyles[look.style].draw(lookColour(look).hex)}
      ${raw.replaceAll('__ID__', id)}
      ${face}${accessories[look.accessory].draw(a)}
    </g>`;
}
