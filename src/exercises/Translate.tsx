import { Speakable } from './Speakable';
import type { Translate as TranslateExercise } from '../lib/types';
import { Letters, useLetterInput } from './Letters';

type Props = {
  exercise: TranslateExercise;
  value: string;
  onChange: (value: string) => void;
  locked: boolean;
  label: string;
};

export function Translate({ exercise, value, onChange, locked, label }: Props) {
  const { ref, insert } = useLetterInput(value, onChange);
  return (
    <>
      <h1 className="prompt" lang={exercise.promptLang}>
        <Speakable text={exercise.prompt} lang={exercise.promptLang} />
      </h1>
      <input
        ref={ref}
        className="fill-input translate-input"
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
      />
      {exercise.answerLang === 'fi' && <Letters onInsert={insert} locked={locked} />}
    </>
  );
}
