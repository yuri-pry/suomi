import { useId } from 'react';
import { avatarMarkup, type Look } from './avatar';

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
  info: `${circle(12, 12, 9)}M12 11v5M12 8h.01`,
  paw: `${circle(6, 10.5, 1.6)}${circle(9.5, 6, 1.6)}${circle(14.5, 6, 1.6)}${circle(18, 10.5, 1.6)}M12 12c-2.8 0-5.5 3.4-5.5 5.6 0 1.4 1.1 2.4 2.6 2.4 1.2 0 1.8-.6 2.9-.6s1.7.6 2.9.6c1.5 0 2.6-1 2.6-2.4 0-2.2-2.7-5.6-5.5-5.6z`,
  drop: 'M12 3.5c3 3.8 6 7 6 10.5a6 6 0 0 1-12 0c0-3.5 3-6.7 6-10.5z',
  image: `M5 5h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM4 16l5-5 4 4 2-2 5 5${circle(15.5, 9, 1.5)}`,
  smile: `${circle(12, 12, 9)}M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01`,
  bowtie: 'M10 12L3.5 7.5v9zM14 12l6.5-4.5v9zM10 10h4v4h-4z',
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

// Avatar: an animal from avatar.ts drawn from the learner's saved look.
type AvatarProps = { look: Look; size?: number; title?: string; className?: string };

export function Avatar({ look, size = 44, title, className }: AvatarProps) {
  // useId gives colons and the like; url(#…) needs a plain id
  const id = 'av' + useId().replace(/[^A-Za-z0-9_-]/g, '');
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      // constant art from avatar.ts; the look is validated by parseLook, so no user text reaches it
      dangerouslySetInnerHTML={{ __html: avatarMarkup(look, id) }}
    />
  );
}
