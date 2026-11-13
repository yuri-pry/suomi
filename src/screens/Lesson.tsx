import { useState, type FormEvent } from 'react';
import type { Lang, Lesson as LessonData } from '../lib/types';
import { answer, fractionDone, isDone, startLesson } from '../lib/lesson';
import { checkTyped, type Verdict } from '../lib/check';
import { t } from '../lib/strings';
import { Choice } from '../exercises/Choice';
import { Fill } from '../exercises/Fill';

type Props = {
  lesson: LessonData;
  lang: Lang;
  onDone: (total: number, wrongIds: string[]) => void;
  onQuit: () => void;
};

export function Lesson({ lesson, lang, onDone, onQuit }: Props) {
  const [state, setState] = useState(() => startLesson(lesson.exercises));
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [typed, setTyped] = useState('');
  const [verdict, setVerdict] = useState<Verdict | null>(null);

  const exercise = state.queue[0];
  if (!exercise) return null;

  const hasAnswer = exercise.type === 'choice' ? selected !== null : typed.trim() !== '';
  const correctText = exercise.type === 'choice' ? exercise.options[exercise.answer] : exercise.answers[0];

  function submit(e: FormEvent) {
    e.preventDefault();
    if (verdict === null) {
      if (!hasAnswer) return;
      setVerdict(
        exercise.type === 'choice'
          ? selected === exercise.answer ? 'right' : 'wrong'
          : checkTyped(typed, exercise.answers, exercise.answerLang),
      );
      return;
    }
    const next = answer(state, verdict !== 'wrong');
    if (isDone(next)) return onDone(next.total, next.wrong);
    setState(next);
    setAttempt(attempt + 1);
    setSelected(null);
    setTyped('');
    setVerdict(null);
  }

  return (
    <form className="lesson" onSubmit={submit}>
      <header className="lesson-top">
        <button type="button" className="quit" aria-label={t('quit', lang)} onClick={onQuit}>
          ✕
        </button>
        <div
          className="bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(fractionDone(state) * 100)}
        >
          <div className="bar-fill" style={{ transform: `scaleX(${fractionDone(state)})` }} />
        </div>
      </header>

      <main className="exercise" key={`${exercise.id}-${attempt}`}>
        <p className="instruction">{t(exercise.type === 'choice' ? 'chooseAnswer' : 'typeAnswer', lang)}</p>
        {exercise.type === 'choice' ? (
          <>
            <h1 className="prompt" lang={exercise.promptLang}>
              {exercise.prompt}
            </h1>
            <Choice exercise={exercise} selected={selected} onSelect={setSelected} locked={verdict !== null} />
          </>
        ) : (
          <Fill
            exercise={exercise}
            value={typed}
            onChange={setTyped}
            locked={verdict !== null}
            label={t('typeAnswer', lang)}
          />
        )}
      </main>

      <footer className={`action ${verdict === null ? '' : verdict === 'wrong' ? 'is-wrong' : 'is-right'}`}>
        <div className="feedback" aria-live="polite">
          {verdict !== null && (
            <>
              <p className="feedback-title">
                <span aria-hidden="true">{verdict === 'wrong' ? '✕ ' : '✓ '}</span>
                {t(verdict === 'right' ? 'correct' : verdict === 'typo' ? 'typo' : 'wrong', lang)}
              </p>
              {verdict !== 'right' && (
                <p className="feedback-answer">
                  {t('answerIs', lang)} <strong lang={exercise.answerLang}>{correctText}</strong>
                </p>
              )}
            </>
          )}
        </div>
        <button type="submit" className="primary" disabled={verdict === null && !hasAnswer}>
          {t(verdict === null ? 'check' : 'continue', lang)}
        </button>
      </footer>
    </form>
  );
}
