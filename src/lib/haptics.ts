// Vibration patterns in milliseconds (on, off, on, ...). Kept short: feedback, not an alarm.
const patterns: Record<'tap' | 'right' | 'wrong' | 'done', number | number[]> = {
  tap: 8,
  right: [12, 40, 20],
  wrong: [35, 50, 35],
  done: [15, 50, 15, 50, 40],
};

let enabled = true;

/** Follows the learner's setting; called at start-up and when the setting changes. */
export const setHaptics = (on: boolean) => {
  enabled = on;
};

export function haptic(kind: keyof typeof patterns) {
  // iOS Safari has no vibrate; the app simply stays silent there.
  if (enabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(patterns[kind]);
}
