import { Speakable } from './Speakable';
import { useMemo, useState } from 'react';
import type { Lang, Order as OrderExercise } from '../lib/types';
import { tilesFor } from '../lib/exercise';
import { shuffle } from '../lib/lesson';
import { t } from '../lib/strings';

type Props = {
  exercise: OrderExercise;
  onChange: (words: string[]) => void;
  locked: boolean;
  lang: Lang;
};

export function Order({ exercise, onChange, locked, lang }: Props) {
  // Shuffled once per mount; the parent remounts on each new attempt.
  const tiles = useMemo(() => {
    const words = tilesFor(exercise);
    return shuffle(words.map((_, i) => i)).map((i) => ({ id: i, word: words[i] }));
  }, [exercise]);
  // Tile ids, not words: a word can appear twice.
  const [placed, setPlaced] = useState<number[]>([]);

  const word = (id: number) => tiles.find((tile) => tile.id === id)!.word;

  function update(next: number[]) {
    setPlaced(next);
    onChange(next.map(word));
  }

  return (
    <>
      <h1 className="prompt" lang={exercise.promptLang}>
        <Speakable text={exercise.prompt} lang={exercise.promptLang} />
      </h1>
      <div className="tiles built" role="group" aria-label={t('yourSentence', lang)} lang={exercise.answerLang}>
        {placed.map((id) => (
          <button key={id} type="button" className="tile" disabled={locked} onClick={() => update(placed.filter((p) => p !== id))}>
            {word(id)}
          </button>
        ))}
      </div>
      <div className="tiles" role="group" aria-label={t('words', lang)} lang={exercise.answerLang}>
        {tiles.map(({ id, word: w }) =>
          placed.includes(id) ? (
            // keeps the pool from reflowing; the tile reads as moved to the sentence
            <span key={id} className="tile-gap" aria-hidden="true" />
          ) : (
            <button key={id} type="button" className="tile" disabled={locked} onClick={() => update([...placed, id])}>
              {w}
            </button>
          ),
        )}
      </div>
    </>
  );
}
