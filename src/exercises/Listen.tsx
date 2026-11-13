import { useEffect } from 'react';
import type { Listen as ListenExercise } from '../lib/types';
import { speak } from '../lib/speech';
import { Choice } from './Choice';

type Props = {
  exercise: ListenExercise;
  voice: SpeechSynthesisVoice;
  selected: number | null;
  onSelect: (index: number) => void;
  locked: boolean;
  playLabel: string;
};

export function Listen({ exercise, voice, selected, onSelect, locked, playLabel }: Props) {
  // Speak once when the exercise appears; stop if the learner moves on mid-sentence.
  useEffect(() => {
    speak(exercise.prompt, voice);
    return () => speechSynthesis.cancel();
  }, [exercise, voice]);

  return (
    <>
      <button type="button" className="play" onClick={() => speak(exercise.prompt, voice)}>
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
