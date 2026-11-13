import { useMemo } from 'react';
import type { Choice as ChoiceExercise, Listen } from '../lib/types';
import { shuffle } from '../lib/lesson';

type Props = {
  exercise: ChoiceExercise | Listen;
  selected: number | null;
  onSelect: (index: number) => void;
  locked: boolean;
};

export function Choice({ exercise, selected, onSelect, locked }: Props) {
  // Shuffled once per mount; the parent remounts on each new attempt.
  const order = useMemo(() => shuffle(exercise.options.map((_, i) => i)), [exercise]);
  return (
    <div className="options" role="radiogroup">
      {order.map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={selected === i}
          className="option"
          lang={exercise.answerLang}
          disabled={locked}
          onClick={() => onSelect(i)}
        >
          {exercise.options[i]}
        </button>
      ))}
    </div>
  );
}
