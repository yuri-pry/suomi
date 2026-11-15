import { Speakable } from './Speakable';
import type { Lang, TrueFalse as TrueFalseExercise } from '../lib/types';
import { t } from '../lib/strings';
import { Icon } from '../design/Icon';
import { KEYS } from './Choice';

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
      <div className="options" role="radiogroup">
        {[true, false].map((value, position) => {
          const verdict = !locked ? undefined : value === exercise.answer ? 'right' : value === selected ? 'wrong' : undefined;
          return (
            <button
              key={String(value)}
              type="button"
              role="radio"
              aria-checked={selected === value}
              className="option"
              data-verdict={verdict}
              disabled={locked}
              onClick={() => onSelect(value)}
            >
              <span className="option-key" aria-hidden="true">
                {KEYS[position]}
              </span>
              <span className="option-text">{t(value ? 'true' : 'false', lang)}</span>
              {verdict && (
                <span className="option-mark" aria-hidden="true">
                  <Icon name={verdict === 'right' ? 'check' : 'cross'} size={16} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
