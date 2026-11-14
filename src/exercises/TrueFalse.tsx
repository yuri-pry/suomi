import type { Lang, TrueFalse as TrueFalseExercise } from '../lib/types';
import { t } from '../lib/strings';

type Props = {
  exercise: TrueFalseExercise;
  selected: boolean | null;
  onSelect: (value: boolean) => void;
  locked: boolean;
  lang: Lang;
};

export function TrueFalse({ exercise, selected, onSelect, locked, lang }: Props) {
  return (
    <>
      <p className="tf-text" lang={exercise.promptLang}>
        {exercise.text}
      </p>
      <h1 className="prompt" lang={exercise.promptLang}>
        {exercise.prompt}
      </h1>
      <div className="options" role="radiogroup">
        {[true, false].map((value) => (
          <button
            key={String(value)}
            type="button"
            role="radio"
            aria-checked={selected === value}
            className="option"
            disabled={locked}
            onClick={() => onSelect(value)}
          >
            {t(value ? 'true' : 'false', lang)}
          </button>
        ))}
      </div>
    </>
  );
}
