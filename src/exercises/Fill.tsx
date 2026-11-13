import { useRef } from 'react';
import { flushSync } from 'react-dom';
import type { Fill as FillExercise } from '../lib/types';

type Props = {
  exercise: FillExercise;
  value: string;
  onChange: (value: string) => void;
  locked: boolean;
  label: string;
};

export function Fill({ exercise, value, onChange, locked, label }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [before, after] = exercise.prompt.split('___');

  // Insert at the cursor so a letter can be added mid-word, then put the cursor after it.
  function insert(letter: string) {
    const el = input.current;
    const at = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? at;
    // flushSync: the new value must be in the input before the cursor can be placed in it.
    flushSync(() => onChange(value.slice(0, at) + letter + value.slice(end)));
    el?.focus();
    el?.setSelectionRange(at + 1, at + 1);
  }

  return (
    <div className="fill">
      <p className="fill-sentence" lang={exercise.promptLang}>
        {before}
        <input
          ref={input}
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
        {after}
      </p>
      {exercise.hint && <p className="hint">({exercise.hint})</p>}
      {exercise.answerLang === 'fi' && (
        <div className="letters">
          {['ä', 'ö', 'å'].map((letter) => (
            <button key={letter} type="button" className="letter" disabled={locked} onClick={() => insert(letter)}>
              {letter}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
