import { useEffect } from 'react';
import type { Listen as ListenExercise } from '../lib/types';
import type { Speaker } from '../lib/speech';
import { Choice } from './Choice';

type Props = {
  exercise: ListenExercise;
  speaker: Speaker;
  selected: number | null;
  onSelect: (index: number) => void;
  locked: boolean;
  playLabel: string;
};

export function Listen({ exercise, speaker, selected, onSelect, locked, playLabel }: Props) {
  // Speak once when the exercise appears; stop if the learner moves on mid-sentence.
  useEffect(() => {
    speaker.speak(exercise.prompt);
    return () => speaker.stop();
  }, [exercise, speaker]);

  return (
    <>
      <button type="button" className="play" onClick={() => speaker.speak(exercise.prompt)}>
        <span aria-hidden="true">🔊</span> {playLabel}
      </button>
      {/* The sentence is revealed only after checking, so it cannot be read instead of heard. */}
      {locked && (
        <p className="heard" lang="fi">
          {exercise.prompt}
        </p>
      )}
      <Choice exercise={exercise} selected={selected} onSelect={onSelect} locked={locked} />
    </>
  );
}
