import type { Unit } from '../lib/types';
import { currentStreak, xpToday, type Progress } from '../lib/progress';
import { t } from '../lib/strings';

type Props = { units: Unit[]; progress: Progress; today: string };

export function Profile({ units, progress, today }: Props) {
  const lang = progress.lang;
  const lessons = units.flatMap((u) => u.lessons);
  const done = lessons.filter((l) => l.id in progress.done).length;
  const { answered, firstTry } = progress.stats;
  const stats: [string, string][] = [
    [t('xp', lang), String(progress.xp)],
    [t('today', lang), `${xpToday(progress, today)} / ${progress.goal} ${t('xp', lang)}`],
    [t('streak', lang), String(currentStreak(progress, today))],
    [t('bestStreak', lang), String(progress.streak.best)],
    [t('lessonsDone', lang), `${done} / ${lessons.length}`],
    // counted only since this counter was added, so it starts empty for an existing learner
    [t('accuracy', lang), answered === 0 ? '–' : `${Math.round((firstTry / answered) * 100)} %`],
  ];
  return (
    <main className="page">
      <h1 className="page-title">{t('profile', lang)}</h1>
      <dl className="stat-grid">
        {stats.map(([label, value]) => (
          <div key={label} className="stat-tile">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
