import { Icon } from '../design/Icon';
import { useRef, useState, type FormEvent, type RefObject } from 'react';
import type { Exercise, Lang, Lesson as LessonData } from '../lib/types';
import { answer, isDone, playable, retryPosition, startLesson } from '../lib/lesson';
import { almostOf, type Almost, type Verdict } from '../lib/check';
import { correctText, emptyResponse, grade, type Response } from '../lib/exercise';
import type { Speaker } from '../lib/speech';
import { t, type StringKey } from '../lib/strings';
import { haptic } from '../lib/haptics';
import { Choice } from '../exercises/Choice';
import { Speakable } from '../exercises/Speakable';
import { Fill } from '../exercises/Fill';
import { Listen } from '../exercises/Listen';
import { Match } from '../exercises/Match';
import { Order } from '../exercises/Order';
import { Translate } from '../exercises/Translate';
import { TrueFalse } from '../exercises/TrueFalse';

type Props = {
  lesson: LessonData;
  lang: Lang;
  /** null when the device has no Finnish voice: listening exercises are left out. */
  speaker: Speaker | null;
  onDone: (total: number, wrongIds: string[]) => void;
  onQuit: () => void;
};

const instructionKey = (e: Exercise): StringKey => {
  switch (e.type) {
    case 'choice': return 'chooseAnswer';
    case 'fill': return 'typeAnswer';
    case 'listen': return 'listenAnswer';
    case 'match': return 'matchAnswer';
    case 'order': return 'orderAnswer';
    case 'translate': return e.answerLang === 'fi' ? 'translateFi' : 'translateEn';
    case 'truefalse': return 'trueFalseAnswer';
  }
};

type BodyProps = {
  exercise: Exercise;
  response: Response;
  onResponse: (r: Response) => void;
  locked: boolean;
  speaker: Speaker | null;
  lang: Lang;
};

/** The exercise itself. Each component reports its answer through onResponse in the shape grade() expects. */
function Body({ exercise, response, onResponse, locked, speaker, lang }: BodyProps) {
  switch (exercise.type) {
    case 'choice':
      return (
        <>
          <h1 className="prompt" lang={exercise.promptLang}>
            <Speakable text={exercise.prompt} lang={exercise.promptLang} />
          </h1>
          <Choice exercise={exercise} selected={response as number | null} onSelect={onResponse} locked={locked} />
        </>
      );
    case 'fill':
      return <Fill exercise={exercise} value={response as string} onChange={onResponse} locked={locked} label={t('typeAnswer', lang)} />;
    case 'listen':
      return speaker && (
        <Listen
          exercise={exercise}
          speaker={speaker}
          selected={response as number | null}
          onSelect={onResponse}
          locked={locked}
          playLabel={t('play', lang)}
        />
      );
    case 'match':
      return <Match exercise={exercise} onComplete={onResponse} lang={lang} />;
    case 'order':
      return <Order exercise={exercise} onChange={onResponse} locked={locked} lang={lang} />;
    case 'translate':
      return <Translate exercise={exercise} value={response as string} onChange={onResponse} locked={locked} label={t(instructionKey(exercise), lang)} />;
    case 'truefalse':
      return <TrueFalse exercise={exercise} selected={response as boolean | null} onSelect={onResponse} locked={locked} lang={lang} />;
  }
}

/**
 * One dot per exercise while that fits a phone, a bar beyond that. Every answer moves it on;
 * the retry round adds its own dots when it starts.
 */
export function Steps({ done, total, label }: { done: number; total: number; label?: string }) {
  return (
    <div
      className="steps"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      data-dots={total <= 20 || undefined}
    >
      {total <= 20 ? (
        Array.from({ length: total }, (_, i) => (
          <span key={i} className="step" data-state={i < done ? 'done' : i === done ? 'current' : 'todo'} />
        ))
      ) : (
        <span className="progress">
          <span className="progress-fill" style={{ transform: `scaleX(${done / total})` }} />
        </span>
      )}
    </div>
  );
}

/** The learner's word with the differing letter marked, or a gap where one is missing. */
function Marked({ given, at, kind }: Almost & { given: string }) {
  return (
    <span className="almost-word" lang="fi">
      {given.slice(0, at)}
      {kind === 'missing' ? <mark className="almost-mark almost-gap" aria-hidden="true" /> : <mark className="almost-mark">{given[at]}</mark>}
      {given.slice(kind === 'missing' ? at : at + 1)}
    </span>
  );
}

/** Native modal dialog: the browser traps focus and Esc closes it, which here means keep going. */
function QuitConfirm({ dialog, lang, onQuit }: { dialog: RefObject<HTMLDialogElement | null>; lang: Lang; onQuit: () => void }) {
  return (
    <dialog ref={dialog} className="confirm" aria-labelledby="confirm-title" aria-describedby="confirm-text">
      <h2 id="confirm-title" className="sheet-title">{t('quitAsk', lang)}</h2>
      <p id="confirm-text" className="confirm-text">{t('quitLoss', lang)}</p>
      <div className="confirm-actions">
        <button type="button" className="btn btn-primary btn-block" autoFocus onClick={() => dialog.current?.close()}>
          {t('keepGoing', lang)}
        </button>
        <button type="button" className="btn btn-danger btn-block" onClick={onQuit}>
          {t('quitYes', lang)}
        </button>
      </div>
    </dialog>
  );
}

export function Lesson({ lesson, lang, speaker, onDone, onQuit }: Props) {
  const [state, setState] = useState(() => startLesson(playable(lesson.exercises, speaker !== null)));
  const [attempt, setAttempt] = useState(0);
  const [response, setResponse] = useState<Response>(() => emptyResponse(state.queue[0]));
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  // An almost-right answer may be fixed once; a second near miss is simply wrong.
  const [fixed, setFixed] = useState(false);

  const exercise = state.queue[0];
  const confirm = useRef<HTMLDialogElement>(null);
  if (!exercise) return null;

  const graded = grade(exercise, response);
  const checked = fixed && graded === 'almost' ? 'wrong' : graded;
  const { done } = state;
  const answered = done > 0 || verdict !== null || fixed;
  const retry = retryPosition(state);
  // true/false has no answer text of its own, so it is shown in the interface language
  const [correct, correctLang] =
    exercise.type === 'truefalse'
      ? [t(exercise.answer ? 'true' : 'false', lang), lang]
      : [correctText(exercise), exercise.type === 'match' ? undefined : exercise.answerLang];

  const near = verdict === 'almost' && (exercise.type === 'fill' || exercise.type === 'translate') ? almostOf(response as string, exercise.answers) : null;

  function fix() {
    setVerdict(null);
    setFixed(true);
    const field = document.querySelector<HTMLInputElement>('.fill-input');
    // after the field is editable again, so the keyboard comes up with the cursor at the end
    setTimeout(() => {
      field?.focus();
      field?.setSelectionRange(field.value.length, field.value.length);
    });
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (verdict === 'almost') return fix();
    if (verdict === null) {
      if (checked !== null) {
        haptic(checked === 'wrong' || checked === 'almost' ? 'wrong' : 'right');
        setVerdict(checked);
      }
      return;
    }
    const next = answer(state, verdict !== 'wrong');
    if (isDone(next)) {
      haptic('done');
      return onDone(next.total, next.wrong);
    }
    setState(next);
    setAttempt(attempt + 1);
    setResponse(emptyResponse(next.queue[0]));
    setVerdict(null);
    setFixed(false);
  }

  return (
    <form className="lesson" onSubmit={submit}>
      <header className="lesson-top">
        <button type="button" className="icon-btn icon-btn-outline" data-quit aria-label={t('quit', lang)} onClick={() => (answered ? confirm.current?.showModal() : onQuit())}>
          <Icon name="close" />
        </button>
        <p className="lesson-title">{lesson.title}</p>
        <span className="lesson-count" aria-hidden="true">
          {retry ? `${t('retry', lang)} ${retry} / ${state.retries}` : `${done + 1} / ${state.total}`}
        </span>
      </header>
      <QuitConfirm dialog={confirm} lang={lang} onQuit={onQuit} />
      <Steps done={done} total={state.total + state.retries} />

      <main className="exercise" key={`${exercise.id}-${attempt}`}>
        <p className="instruction">{t(instructionKey(exercise), lang)}</p>
        <Body
          exercise={exercise}
          response={response}
          onResponse={setResponse}
          locked={verdict !== null}
          speaker={speaker}
          lang={lang}
        />
      </main>

      <footer className="action" data-verdict={verdict ?? undefined}>
        <div className="feedback" aria-live="polite">
          {verdict !== null && (
            <>
              <p className="feedback-title">
                <span className="feedback-icon" aria-hidden="true">
                  <Icon name={verdict === 'wrong' ? 'cross' : 'check'} size={22} />
                </span>
                {t(verdict === 'right' ? 'correct' : verdict === 'typo' ? 'typo' : verdict === 'almost' ? 'almost' : 'wrong', lang)}
              </p>
              {near && (
                <p className="feedback-answer">
                  <Marked {...near} />
                </p>
              )}
              {verdict !== 'right' && verdict !== 'almost' && (
                <p className="feedback-answer">
                  <span className="feedback-label">{t('answerIs', lang)}</span>{' '}
                  <strong lang={correctLang}>
                    <Speakable text={correct} lang={correctLang ?? 'en'} />
                  </strong>
                </p>
              )}
            </>
          )}
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={verdict === null && checked === null}>
          {t(verdict === null ? 'check' : verdict === 'almost' ? 'fixIt' : 'continue', lang)}
        </button>
        {verdict === 'almost' && (
          <button type="button" className="btn btn-ghost btn-block" onClick={() => setVerdict('wrong')}>
            {t('showAnswer', lang)}
          </button>
        )}
      </footer>
    </form>
  );
}

