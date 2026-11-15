import { Fragment, useEffect, useRef } from 'react';
import { Icon } from '../design/Icon';
import type { Unit } from '../lib/types';
import type { Progress } from '../lib/progress';
import { lessonIds, lessonState, lessonsDone, nextLesson, stages } from '../lib/course';
import { t } from '../lib/strings';

type Props = {
  units: Unit[];
  progress: Progress;
  onStart: (lessonId: string) => void;
  onTip: (unitId: string) => void;
};

/** The whole course as chapters of lesson cards, opened at the unit being worked on. */
export function Path({ units, progress, onStart, onTip }: Props) {
  const lang = progress.lang;
  const ids = lessonIds(units);
  const next = nextLesson(units, progress);
  const current = next?.unit ?? units[units.length - 1];
  const stage = stages[current.section];
  const sectionUnits = units.filter((u) => u.section === current.section);
  const sectionLessons = sectionUnits.reduce((n, u) => n + u.lessons.length, 0);
  const done = lessonsDone(sectionUnits, progress);
  const currentRef = useRef<HTMLElement>(null);

  // Open at the current unit, once, unless it is the first one (the header is worth seeing).
  useEffect(() => {
    if (current !== units[0]) currentRef.current?.scrollIntoView({ block: 'start' });
  }, []);

  return (
    <main className={`page${next ? ' has-continue' : ''}`}>
      <header className="stage">
        <span className="stage-badge" aria-hidden="true">
          {stage.level}
        </span>
        <div>
          <p className="eyebrow">
            {t('stage', lang)} {current.section}
          </p>
          <h1 className="stage-name">{stage.name[lang]}</h1>
        </div>
      </header>

      <dl className="stat-strip">
        <div>
          <dt className="eyebrow">{t('units', lang)}</dt>
          <dd>
            <strong>{sectionUnits.length}</strong>
          </dd>
        </div>
        <div>
          <dt className="eyebrow">{t('lessons', lang)}</dt>
          <dd>
            <strong>{sectionLessons}</strong>
          </dd>
        </div>
        <div>
          <dt className="eyebrow">{t('progressLabel', lang)}</dt>
          <dd>
            <strong>{Math.round((done / sectionLessons) * 100)}%</strong>
          </dd>
        </div>
      </dl>

      {units.map((unit, u) => {
        const unitDone = unit.lessons.filter((l) => l.id in progress.done).length;
        const newSection = u > 0 && unit.section !== units[u - 1].section;
        return (
          <Fragment key={unit.id}>
            {newSection && (
              <h2 className="section-title">
                {t('stage', lang)} {unit.section}: {stages[unit.section].name[lang]} · {stages[unit.section].level}
              </h2>
            )}
            <section className="chapter" ref={unit === current ? currentRef : undefined} style={{ scrollMarginTop: 'var(--space-5)' }}>
              <header className="chapter-head">
                <span className="chapter-icon" data-tone={(u % 4) + 1} aria-hidden="true">
                  {u + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="eyebrow">
                    {t('unit', lang)} {u + 1}
                  </p>
                  <h2 className="chapter-title">{unit.title}</h2>
                </div>
                <span className="chapter-count">
                  {unitDone}/{unit.lessons.length}
                </span>
              </header>
              <ol className="chapter-lessons">
                <li>
                  <button type="button" className="tip-link pressable" onClick={() => onTip(unit.id)}>
                    <Icon name="book" size={22} />
                    <span>{t('tip', lang)}</span>
                    <Icon name="chevron-right" size={20} />
                  </button>
                </li>
                {unit.lessons.map((lesson, i) => {
                  const state = lessonState(progress, ids, lesson.id);
                  const isNext = next?.lesson.id === lesson.id;
                  return (
                    <li key={lesson.id}>
                      <button
                        type="button"
                        className="lesson-card"
                        data-state={isNext ? 'open' : state === 'open' ? 'done-open' : state}
                        disabled={state === 'locked'}
                        onClick={() => onStart(lesson.id)}
                        aria-label={`${lesson.title}, ${t(state === 'done' ? 'done' : state === 'locked' ? 'locked' : 'start', lang)}`}
                      >
                        <span className="lesson-thumb" aria-hidden="true">
                          {i + 1}
                          <span className="state-mark" data-state={state}>
                            {state === 'done' && <Icon name="check" size={14} />}
                            {state === 'locked' && <Icon name="lock" size={14} />}
                          </span>
                        </span>
                        <span className="lesson-card-title">{lesson.title}</span>
                        {isNext && <span className="pill">{t('next', lang)}</span>}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          </Fragment>
        );
      })}

      {next && (
        <button type="button" className="continue-bar" onClick={() => onStart(next.lesson.id)}>
          <span className="continue-bar-text">
            <span className="eyebrow">{t('continue', lang)}</span>
            <span className="continue-bar-title">{next.lesson.title}</span>
          </span>
          <span className="round-go" aria-hidden="true">
            <Icon name="arrow" />
          </span>
        </button>
      )}
    </main>
  );
}
