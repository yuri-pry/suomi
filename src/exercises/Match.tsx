import { useMemo, useState } from 'react';
import type { Lang, Match as MatchExercise } from '../lib/types';
import { isMatched, pick, type MatchState } from '../lib/exercise';
import { shuffle } from '../lib/lesson';
import { t } from '../lib/strings';

type Props = {
  exercise: MatchExercise;
  /** Called with the number of wrong pairs once every pair is matched. */
  onComplete: (mistakes: number) => void;
  lang: Lang;
};

export function Match({ exercise, onComplete, lang }: Props) {
  // Each column is shuffled on its own, once per mount.
  const [fiOrder, enOrder] = useMemo(() => {
    const idx = exercise.pairs.map((_, i) => i);
    return [shuffle(idx), shuffle(idx)];
  }, [exercise]);
  const [state, setState] = useState<MatchState>({ done: [], mistakes: 0 });
  const [left, setLeft] = useState<number | null>(null);
  const [right, setRight] = useState<number | null>(null);
  const [missed, setMissed] = useState(false);

  function choose(side: 'fi' | 'en', i: number) {
    const [l, r] = side === 'fi' ? [left === i ? null : i, right] : [left, right === i ? null : i];
    setMissed(false);
    if (l === null || r === null) {
      setLeft(l);
      setRight(r);
      return;
    }
    const next = pick(state, l, r);
    setState(next);
    setLeft(null);
    setRight(null);
    setMissed(next.mistakes > state.mistakes);
    if (isMatched(next, exercise)) onComplete(next.mistakes);
  }

  const column = (side: 'fi' | 'en', order: number[], selected: number | null) => (
    <div className="options" role="group" aria-label={t(side === 'fi' ? 'finnishWords' : 'englishWords', lang)}>
      {order.map((i) => {
        const done = state.done.includes(i);
        return (
          <button
            key={i}
            type="button"
            className={`option${done ? ' is-matched' : ''}`}
            lang={side}
            aria-pressed={selected === i}
            disabled={done}
            onClick={() => choose(side, i)}
          >
            {done && <span aria-label={t('matched', lang)}>✓ </span>}
            {exercise.pairs[i][side]}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <div className="match">
        {column('fi', fiOrder, left)}
        {column('en', enOrder, right)}
      </div>
      <p className="hint" role="status">
        {missed ? t('noPair', lang) : ''}
      </p>
    </>
  );
}
