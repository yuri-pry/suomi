import { useMemo } from 'react';
import { Icon } from '../design/Icon';
import type { Choice as ChoiceExercise, Listen } from '../lib/types';
import { shuffle } from '../lib/lesson';

type Props = {
  exercise: ChoiceExercise | Listen;
  selected: number | null;
  onSelect: (index: number) => void;
  locked: boolean;
};

/** After checking: the right row turns green, a wrong pick red, the rest step back. Each with its own mark, not colour alone. */
export const resultOf = (locked: boolean, isAnswer: boolean, isPicked: boolean) =>
  !locked ? undefined : isAnswer ? 'right' : isPicked ? 'wrong' : 'rest';

export function Choice({ exercise, selected, onSelect, locked }: Props) {
  // Shuffled once per mount; the parent remounts on each new attempt.
  const order = useMemo(() => shuffle(exercise.options.map((_, i) => i)), [exercise]);
  return (
    <div className="options" role="radiogroup">
      {order.map((i, row) => {
        const result = resultOf(locked, i === exercise.answer, selected === i);
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={selected === i}
            className="option"
            data-result={result}
            lang={exercise.answerLang}
            disabled={locked}
            onClick={() => onSelect(i)}
          >
            {/* lettered by position on screen, not by the option's place in the content file */}
            <span className="option-key" aria-hidden="true">
              {result === 'right' ? <Icon name="check" size={18} /> : result === 'wrong' ? <Icon name="cross" size={18} /> : String.fromCharCode(65 + row)}
            </span>
            <span className="option-text">{exercise.options[i]}</span>
          </button>
        );
      })}
    </div>
  );
}
