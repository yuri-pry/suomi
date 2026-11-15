// Original icon set. 24 px grid, 2 px round stroke, 3 px clear margin, currentColor.
// Every glyph is one path string, so adding an icon is adding one line.

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

const speakerBody = 'M4 10v4h3l5 4V6l-5 4z';
const innerWave = 'M16 9.5a3.5 3.5 0 0 1 0 5';

const icons = {
  home: 'M4 11l8-7 8 7M6 10v10h12V10M10 20v-5h4v5',
  path: `${circle(6, 5, 2)}${circle(18, 12, 2)}${circle(6, 19, 2)}M8 5h5a5 5 0 0 1 5 5M16 12h-5a5 5 0 0 0-5 5`,
  book: 'M12 6v14M12 6C10 4.7 7 4.5 3.5 5v14c3.5-.5 6.5-.3 8.5 1M12 6c2-1.3 5-1.5 8.5-1v14c-3.5-.5-6.5-.3-8.5 1',
  profile: `${circle(12, 8, 4)}M4 20c0-3.6 3.6-6 8-6s8 2.4 8 6`,
  settings: `M4 7h9M17 7h3${circle(15, 7, 2)}M4 12h3M11 12h9${circle(9, 12, 2)}M4 17h10M18 17h2${circle(16, 17, 2)}`,
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  back: 'M20 12H4M10 6l-6 6 6 6',
  'chevron-down': 'M6 9l6 6 6-6',
  'chevron-right': 'M9 6l6 6-6 6',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  cross: 'M7 7l10 10M17 7L7 17',
  lock: 'M7 11h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2zM8 11V8a4 4 0 0 1 8 0v3M12 15v2',
  play: 'M8 5.5v13l10-6.5z',
  speaker: `${speakerBody}${innerWave}`,
  volume: `${speakerBody}${innerWave}M18.5 7a7 7 0 0 1 0 10`,
  vibrate: 'M10 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM4.5 9v6M19.5 9v6',
  flame: 'M12 3c1 3.5 5 5.5 5 10.5a5 5 0 0 1-10 0c0-2 .8-3.4 2-4.5.3 1.6 1 2.4 2 2.8C11 9 10.5 6 12 3z',
  star: 'M12 3.6l2.35 5.76 6.21.46-4.76 4.02 1.49 6.04L12 16.6l-5.29 3.28 1.49-6.04-4.76-4.02 6.21-.46z',
  target: `${circle(12, 12, 9)}${circle(12, 12, 5)}${circle(12, 12, 1)}`,
  trophy: 'M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M12 14v4M8 20h8',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  refresh: 'M20 12a8 8 0 1 1-2.3-5.7M18.5 3v4h-4',
  sun: `${circle(12, 12, 4)}M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4`,
  moon: 'M20 14.5A8 8 0 1 1 9.5 4a8.5 8.5 0 0 0 10.5 10.5z',
  globe: `${circle(12, 12, 9)}M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z`,
  download: 'M12 4v12M7 11l5 5 5-5M5 20h14',
  upload: 'M12 16V4M7 9l5-5 5 5M5 20h14',
  arrow: 'M4 12h16M14 6l6 6-6 6',
  layers: 'M12 4l8 4-8 4-8-4zM4 12l8 4 8-4M4 16l8 4 8-4',
  info: `${circle(12, 12, 9)}M12 11v5M12 8h.01`,
} as const;

export type IconName = keyof typeof icons;
export const iconNames = Object.keys(icons) as IconName[];

type IconProps = {
  name: IconName;
  /** Width and height in CSS pixels. */
  size?: number;
  /** Give a title only when the icon stands alone without a text label. */
  title?: string;
  className?: string;
};

export function Icon({ name, size = 24, title, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title && <title>{title}</title>}
      <path d={icons[name]} />
    </svg>
  );
}

// Avatars: Finnish nature glyphs on a tinted disc. The id is what gets stored in progress,
// so never rename one; add new ones at the end.
export const avatars = [
  { id: 'kuusi', label: 'Spruce', tone: 3, d: 'M12 4l4 5h-2.5l4 5h-11l4-5H8zM12 14v5' },
  { id: 'aalto', label: 'Wave', tone: 1, d: 'M4 10c2.5-3 5.5-3 8 0s5.5 3 8 0M4 15c2.5-3 5.5-3 8 0s5.5 3 8 0' },
  { id: 'marja', label: 'Berries', tone: 2, d: `${circle(9, 15, 3.5)}${circle(16, 13.5, 3)}M9 11.5c0-3 2-5.5 5-6.5M16 10.5c0-2-.6-4-2-5.5` },
  { id: 'tunturi', label: 'Fell', tone: 4, d: `M3 19l6-10 4 6 2.5-3.5L21 19z${circle(17, 6.5, 2)}` },
  { id: 'lumi', label: 'Snowflake', tone: 1, d: 'M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5L12 7l2.5-2.5M9.5 19.5L12 17l2.5 2.5' },
  { id: 'lehti', label: 'Leaf', tone: 3, d: 'M5 19C5 11 10 5 19 5c0 9-6 14-14 14zM5 19l9-9' },
  { id: 'kala', label: 'Fish', tone: 4, d: 'M3 12c3-4.5 9-5.5 13 0-4 5.5-10 4.5-13 0zM16 12l5-4v8zM7.5 11h.01' },
  { id: 'sieni', label: 'Mushroom', tone: 2, d: 'M4 12a8 8 0 0 1 16 0zM10 12v6a2 2 0 0 0 4 0v-6M9 8h.01M14 7.5h.01' },
] as const;

export type AvatarId = (typeof avatars)[number]['id'];

type AvatarProps = { id: AvatarId; size?: number; title?: string; className?: string };

export function Avatar({ id, size = 44, title, className }: AvatarProps) {
  const avatar = avatars.find((a) => a.id === id) ?? avatars[0];
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="-6 -6 36 36"
      fill="none"
      stroke={`var(--tone-${avatar.tone}-fg)`}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title && <title>{title}</title>}
      <circle cx={12} cy={12} r={18} fill={`var(--tone-${avatar.tone}-bg)`} stroke="none" />
      <path d={avatar.d} />
    </svg>
  );
}
