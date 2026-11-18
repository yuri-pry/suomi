import { Icon } from '../design/Icon';
import { useState, type ReactNode } from 'react';
import type { Unit } from '../lib/types';
import { checkpointId, checkpointUnlocked, currentStreak, isUnlocked, testedOut, unitPassed, xpToday, type Progress } from '../lib/progress';
import { t, type StringKey } from '../lib/strings';

type Props = {
  units: Unit[];
  progress: Progress;
  today: string;
  /** Exercises due for review that this device can play. */
  reviewDue: number;
  /** Exercises in the practice session for the weakest rules; 0 hides the practice row. */
  practice: number;
  level: { level: number; exact: number; section: number; mastered: number; total: number };
  onStart: (lessonId: string) => void;
  onCheckpoint: (unit: Unit) => void;
  onReview: () => void;
  onPractice: () => void;
};

/** A unit that folds away, painted in one of the seven block tones. The learner's choice sticks while the screen is open. */
function Module({ eyebrow, title, count, tone, startOpen, children }: {
  eyebrow: string;
  title: string;
  count: string;
  tone: number;
  startOpen: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(startOpen);
  return (
    <details className="unit block" data-tone={tone} open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className="unit-head">
        <span className="unit-heading">
          <span className="eyebrow">{eyebrow}</span>
          <h2 className="unit-title">{title}</h2>
          <span className="unit-count">{count}</span>
        </span>
        <span className="unit-chevron" aria-hidden="true">
          <Icon name="chevron-down" size={20} />
        </span>
      </summary>
      <div className="unit-body">{children}</div>
    </details>
  );
}

export function Home({ units, progress, today, reviewDue, practice, level, onStart, onCheckpoint, onReview, onPractice }: Props) {
  const lang = progress.lang;
  const isOpen = (id: string) => !(id in progress.done) && !testedOut(progress, id);
  // Only the unit being worked on starts open, so a long course does not mean a long scroll.
  const current = units.find((u, i) => u.lessons.some((l) => isOpen(l.id)) || !unitPassed(progress, units, i)) ?? units[units.length - 1];
  // The one step to do next, a lesson or a checkpoint, is lifted out of the path.
  const next = units
    .flatMap((u, i) => [
      ...u.lessons.filter((l) => isOpen(l.id) && isUnlocked(progress, units, l.id)).map((l) => l.id),
      ...(!unitPassed(progress, units, i) && checkpointUnlocked(progress, units, i) ? [checkpointId(u.id)] : []),
    ])
    .at(0);
  const earned = xpToday(progress, today);
  const goalPct = Math.min(100, Math.round((earned / progress.goal) * 100));
  const streak = currentStreak(progress, today);
  return (
    <div className="home">
      <header className="home-top">
        <h1 className="home-title">{t('appName', lang)}</h1>
        <span className="chip">
          <Icon name="flame" size={18} className="tint-streak" />
          {streak}
          <span className="sr-only">{t('streak', lang)}</span>
        </span>
        <span className="chip">
          <Icon name="star" size={18} className="tint-xp" />
          {progress.xp}
          <span className="sr-only">{t('xp', lang)}</span>
        </span>
      </header>

      <main>
        <div className="home-cards">
          <section className="goal-card card">
            <h2 className="eyebrow">{t('today', lang)}</h2>
            <div className="ring goal-ring" data-done={goalPct >= 100 || undefined} aria-hidden="true">
              <svg viewBox="0 0 40 40">
                <circle className="ring-track" cx={20} cy={20} r={17} pathLength={100} />
                <circle className="ring-value" cx={20} cy={20} r={17} pathLength={100} strokeDashoffset={100 - goalPct} />
              </svg>
              <span className="ring-label">
                {goalPct >= 100 ? <Icon name="check" size={22} /> : `${goalPct}%`}
              </span>
            </div>
            <p className="goal-value">
              {earned} / {progress.goal} {t('xp', lang)}
            </p>
            <p className="goal-label">{t('dailyGoal', lang)}</p>
          </section>

          <section className="review-card block" data-tone="6" data-empty={reviewDue === 0 || undefined}>
            <h2 className="eyebrow">{t('review', lang)}</h2>
            {reviewDue === 0 ? (
              <p className="review-card-none">{t('reviewNone', lang)}</p>
            ) : (
              <>
                <p className="review-card-count">
                  <span className="review-card-number">{reviewDue}</span> {t('reviewDue', lang)}
                </p>
                <button type="button" className="btn btn-small review-card-btn" onClick={onReview}>
                  {t('reviewStart', lang)} <Icon name="chevron-right" size={18} />
                </button>
              </>
            )}
          </section>
        </div>

        {practice > 0 && (
          <section className="practice-row card">
            <h2 className="practice-row-title">{t('practiseWeak', lang)}</h2>
            <button type="button" className="btn btn-small btn-primary" onClick={onPractice}>
              {t('practiseStart', lang)} <Icon name="chevron-right" size={18} />
            </button>
          </section>
        )}

        <section className="level-card card">
          <h2 className="eyebrow">{t('level', lang)}</h2>
          <p className="level-value">
            <span className="level-number">{level.exact.toFixed(2)}</span>
            <span className="level-section">{t(`section${level.section}` as StringKey, lang)}</span>
          </p>
          <div className="progress progress-thin" aria-hidden="true">
            <div className="progress-fill" style={{ transform: `scaleX(${level.exact % 1})` }} />
          </div>
          <p className="level-rules">
            {level.mastered} / {level.total} {t('rulesMastered', lang)}
          </p>
        </section>

        <h2 className="eyebrow home-section">{t('yourPath', lang)}</h2>
        {units.map((unit, u) => (
          <Module
            key={unit.id}
            eyebrow={`${t('unit', lang)} ${u + 1}`}
            title={unit.title}
            count={`${unit.lessons.filter((l) => l.id in progress.done).length} / ${unit.lessons.length} ${t('lessons', lang)}`}
            tone={(u % 7) + 1}
            startOpen={unit === current}
          >
            <div className="unit-panel">
              <details className="tip">
                <summary className="tip-head">
                  <span className="row-tile" aria-hidden="true">
                    <Icon name="book" size={20} />
                  </span>
                  <span className="row-label">{t('tip', lang)}</span>
                  <Icon name="chevron-down" size={18} className="tip-chevron" />
                </summary>
                <div className="tip-body">
                  {(lang === 'fi' && unit.tip.fi ? unit.tip.fi : unit.tip.en).split('\n\n').map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </details>
              <ol className="path">
                {unit.lessons.map((lesson, i) => {
                  const done = lesson.id in progress.done;
                  const open = isUnlocked(progress, units, lesson.id);
                  const state = done ? 'done' : open ? 'open' : 'locked';
                  return (
                    <li key={lesson.id} className="path-step" data-state={state} data-next={lesson.id === next || undefined}>
                      <button type="button" className="path-node row-action pressable" disabled={!open} onClick={() => onStart(lesson.id)}>
                        <span className="state-badge" data-state={state} aria-hidden="true">
                          {done ? <Icon name="check" size={20} /> : open ? i + 1 : <Icon name="lock" size={18} />}
                        </span>
                        <span className="path-label">{lesson.title}</span>
                        <span className="path-state">{t(done ? 'done' : open ? 'start' : 'locked', lang)}</span>
                      </button>
                    </li>
                  );
                })}
                {(() => {
                  const passed = unitPassed(progress, units, u);
                  const open = checkpointUnlocked(progress, units, u);
                  const state = passed ? 'done' : open ? 'open' : 'locked';
                  return (
                    <li className="path-step path-checkpoint" data-state={state} data-next={checkpointId(unit.id) === next || undefined}>
                      <button type="button" className="path-node row-action pressable" disabled={!open} onClick={() => onCheckpoint(unit)}>
                        <span className="state-badge" data-state={state} aria-hidden="true">
                          <Icon name={open ? 'trophy' : 'lock'} size={20} />
                        </span>
                        <span className="path-label">
                          {t('checkpoint', lang)}
                          <span className="path-sub">{t('checkpointInfo', lang)}</span>
                        </span>
                        <span className="path-state">{passed ? <><Icon name="check" size={16} /> {t('passed', lang)}</> : t(open ? 'start' : 'locked', lang)}</span>
                      </button>
                    </li>
                  );
                })()}
              </ol>
            </div>
          </Module>
        ))}
      </main>
    </div>
  );
}
