import type { CSSProperties, ReactNode } from 'react';

type Props = {
  /** 0 to 100. */
  value: number;
  label: ReactNode;
  /** CSS custom properties are allowed: --ring-size, --ring-color, --ring-track. */
  style?: CSSProperties & Record<`--${string}`, string>;
};

/** Progress ring. Both circles use pathLength 100, so the dash offset is 100 minus the value. */
export function Ring({ value, label, style }: Props) {
  return (
    <span className="ring" role="img" aria-label={`${Math.round(value)} %`} style={style}>
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <circle className="ring-track" cx="18" cy="18" r="15" pathLength="100" />
        <circle className="ring-value" cx="18" cy="18" r="15" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - value} />
      </svg>
      <span className="ring-label">{label}</span>
    </span>
  );
}
