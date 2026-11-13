import type { Unit } from '../lib/types';
import { currentStreak, isUnlocked, type Progress } from '../lib/progress';
import { t } from '../lib/strings';

type Props = { units: Unit[]; progress: Progress; today: string; onStart: (lessonId: string) => void };

export function Home({ units, progress, today, onStart }: Props) {
  const lang = progress.lang;
  // Lessons unlock in one line across units until checkpoints exist (task 11).
  const ids = units.flatMap((u) => u.lessons.map((l) => l.id));
  return (
    <div className="home">
      <header className="stats">
        <strong className="brand">{t('appName', lang)}</strong>
        <span className="stat">
          <span aria-hidden="true">🔥</span> {currentStreak(progress, today)} {t('streak', lang)}
        </span>
        <span className="stat">
          <span aria-hidden="true">★</span> {progress.xp} {t('xp', lang)}
        </span>
      </header>

      <main>
        {units.map((unit) => (
          <section key={unit.id}>
          <h1 className="unit-title">{unit.title}</h1>
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
                      {done ? '✓' : open ? i + 1 : '🔒'}
                    </span>
                    <span className="node-title">{lesson.title}</span>
                    <span className="node-state">{t(done ? 'done' : open ? 'start' : 'locked', lang)}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          </section>
        ))}
      </main>
    </div>
  );
}
