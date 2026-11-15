import { Avatar, avatars } from '../design/Icon';
import { haptic } from '../lib/haptics';
import type { Unit } from '../lib/types';
import { currentStreak, xpToday, type Progress } from '../lib/progress';
import { t } from '../lib/strings';

type Props = { units: Unit[]; progress: Progress; today: string; onChange: (patch: Partial<Progress>) => void };

export function Profile({ units, progress, today, onChange }: Props) {
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
      <div className="avatar-grid" role="radiogroup" aria-label={t('avatar', lang)}>
        {avatars.map((a) => (
          <button
            key={a.id}
            type="button"
            role="radio"
            className="avatar-option"
            // a learner who never picked one is shown the first
            aria-checked={(progress.avatar || avatars[0].id) === a.id}
            aria-label={a.label}
            onClick={() => {
              haptic('tap');
              onChange({ avatar: a.id });
            }}
          >
            <Avatar id={a.id} size={52} className="avatar" />
          </button>
        ))}
      </div>
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
