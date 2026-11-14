import { Speakable } from './Speakable';
import type { Fill as FillExercise } from '../lib/types';
import { Letters, useLetterInput } from './Letters';

type Props = {
  exercise: FillExercise;
  value: string;
  onChange: (value: string) => void;
  locked: boolean;
  label: string;
};

export function Fill({ exercise, value, onChange, locked, label }: Props) {
  const { ref, insert } = useLetterInput(value, onChange);
  const [before, after] = exercise.prompt.split('___');

  return (
    <div className="fill">
      <p className="fill-sentence" lang={exercise.promptLang}>
        <Speakable text={before} lang={exercise.promptLang} />
        <input
          ref={ref}
          className="fill-input"
          aria-label={label}
          lang={exercise.answerLang}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={locked}
          autoFocus
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          // fixed width: sizing to the answer would give its length away
          size={12}
        />
        <Speakable text={after ?? ''} lang={exercise.promptLang} />
      </p>
      {exercise.hint && <p className="hint">({exercise.hint})</p>}
      {exercise.answerLang === 'fi' && <Letters onInsert={insert} locked={locked} />}
    </div>
  );
}
