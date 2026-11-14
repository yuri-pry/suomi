import { useRef } from 'react';
import { flushSync } from 'react-dom';

/** Text input state plus an `insert` that adds a letter at the cursor; shared by Fill and Translate. */
export function useLetterInput(value: string, onChange: (value: string) => void) {
  const ref = useRef<HTMLInputElement>(null);

  // Insert at the cursor so a letter can be added mid-word, then put the cursor after it.
  function insert(letter: string) {
    const el = ref.current;
    const at = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? at;
    // flushSync: the new value must be in the input before the cursor can be placed in it.
    flushSync(() => onChange(value.slice(0, at) + letter + value.slice(end)));
    el?.focus();
    el?.setSelectionRange(at + 1, at + 1);
  }

  return { ref, insert };
}

export function Letters({ onInsert, locked }: { onInsert: (letter: string) => void; locked: boolean }) {
  return (
    <div className="letters">
      {['ä', 'ö', 'å'].map((letter) => (
        <button key={letter} type="button" className="letter" disabled={locked} onClick={() => onInsert(letter)}>
          {letter}
        </button>
      ))}
    </div>
  );
}
