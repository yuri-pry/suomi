import { Icon } from '../design/Icon';
import { useState, type ReactNode } from 'react';
import type { Unit } from '../lib/types';
import { currentStreak, isUnlocked, testedOut, type Progress } from '../lib/progress';
import { t } from '../lib/strings';

type Props = {
  units: Unit[];
  progress: Progress;
  today: string;
  /** Exercises due for review that this device can play. */
  reviewDue: number;
  onStart: (lessonId: string) => void;
  onReview: () => void;
};

/** A unit that folds away. The learner's choice sticks while the screen is open. */
function Module({ title, count, startOpen, children }: { title: string; count: string; startOpen: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(startOpen);
  return (
    <details className="unit" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className="unit-head">
        <h1 className="unit-title">{title}</h1>
        <span className="unit-count">{count}</span>
      </summary>
      <div className="unit-body">{children}</div>
    </details>
  );
}

export function Home({ units, progress, today, reviewDue, onStart, onReview }: Props) {
  const lang = progress.lang;
  // Lessons unlock in one line across units until checkpoints exist (task 11).
  const ids = units.flatMap((u) => u.lessons.map((l) => l.id));
  // Only the unit being worked on starts open, so a long course does not mean a long scroll.
  const current = units.find((u) => u.lessons.some((l) => !(l.id in progress.done) && !testedOut(progress, l.id))) ?? units[units.length - 1];
  return (
    <div className="home">
      <header className="stats">
        <strong className="brand">{t('appName', lang)}</strong>
        <span className="stat">
          <Icon name="flame" size={20} /> {currentStreak(progress, today)} {t('streak', lang)}
        </span>
        <span className="stat">
          <Icon name="star" size={20} /> {progress.xp} {t('xp', lang)}
        </span>
      </header>

      <main>
        <section className="review-card" data-empty={reviewDue === 0 || undefined}>
          <h2 className="review-card-title">{t('review', lang)}</h2>
          {reviewDue === 0 ? (
            <p className="review-card-count">{t('reviewNone', lang)}</p>
          ) : (
            <>
              <p className="review-card-count">
                {reviewDue} {t('reviewDue', lang)}
              </p>
              <button type="button" className="btn btn-primary" onClick={onReview}>
                {t('reviewStart', lang)}
              </button>
            </>
          )}
        </section>
        {units.map((unit) => (
          <Module
            key={unit.id}
            title={unit.title}
            count={`${unit.lessons.filter((l) => l.id in progress.done).length} / ${unit.lessons.length}`}
            startOpen={unit === current}
          >
          <details className="tip">
            <summary>{t('tip', lang)}</summary>
            {(lang === 'fi' && unit.tip.fi ? unit.tip.fi : unit.tip.en).split('\n\n').map((p) => (
              <p key={p}>{p}</p>
            ))}
          </details>
          <ol className="lessons">
            {unit.lessons.map((lesson, i) => {
              const done = lesson.id in progress.done;
              const open = isUnlocked(progress, ids, lesson.id);
              return (
                <li key={lesson.id}>
                  <button type="button" className="lesson-node" disabled={!open} onClick={() => onStart(lesson.id)}>
                    <span className="node-number" aria-hidden="true">
                      {done ? <Icon name="check" size={20} /> : open ? i + 1 : <Icon name="lock" size={20} />}
                    </span>
                    <span className="node-title">{lesson.title}</span>
                    <span className="node-state">{t(done ? 'done' : open ? 'start' : 'locked', lang)}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          </Module>
        ))}
      </main>
    </div>
  );
}
