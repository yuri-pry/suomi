import { Speakable } from './Speakable';
import type { Lang, TrueFalse as TrueFalseExercise } from '../lib/types';
import { t } from '../lib/strings';
import { Icon } from '../design/Icon';
import { resultOf } from './Choice';

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
        <Speakable text={exercise.text} lang={exercise.promptLang} />
      </p>
      <h1 className="prompt" lang={exercise.promptLang}>
        <Speakable text={exercise.prompt} lang={exercise.promptLang} />
      </h1>
      <div className="tf-options" role="radiogroup">
        {[true, false].map((value) => (
          <button
            key={String(value)}
            type="button"
            role="radio"
            aria-checked={selected === value}
            className="option tf-option"
            data-result={resultOf(locked, value === exercise.answer, selected === value)}
            disabled={locked}
            onClick={() => onSelect(value)}
          >
            <span className="tf-icon" aria-hidden="true">
              <Icon name={value ? 'check' : 'cross'} size={28} />
            </span>
            {t(value ? 'true' : 'false', lang)}
          </button>
        ))}
      </div>
    </>
  );
}
