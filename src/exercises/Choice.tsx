import { useMemo } from 'react';
import { Icon } from '../design/Icon';
import type { Choice as ChoiceExercise, Listen } from '../lib/types';
import { shuffle } from '../lib/lesson';

type Props = {
  exercise: ChoiceExercise | Listen;
  selected: number | null;
  onSelect: (index: number) => void;
  locked: boolean;
  /** After checking: mark the right option, and the chosen one when it was wrong. Off in the placement test. */
  reveal?: boolean;
};

export const KEYS = 'ABCDEFGH';

export function Choice({ exercise, selected, onSelect, locked, reveal = locked }: Props) {
  // Shuffled once per mount; the parent remounts on each new attempt.
  const order = useMemo(() => shuffle(exercise.options.map((_, i) => i)), [exercise]);
  return (
    <div className="options" role="radiogroup">
      {order.map((i, position) => {
        const verdict = !reveal ? undefined : i === exercise.answer ? 'right' : i === selected ? 'wrong' : undefined;
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={selected === i}
            className="option"
            data-verdict={verdict}
            lang={exercise.answerLang}
            disabled={locked}
            onClick={() => onSelect(i)}
          >
            <span className="option-key" aria-hidden="true">
              {KEYS[position]}
            </span>
            <span className="option-text">{exercise.options[i]}</span>
            {verdict && (
              <span className="option-mark" aria-hidden="true">
                <Icon name={verdict === 'right' ? 'check' : 'cross'} size={16} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
