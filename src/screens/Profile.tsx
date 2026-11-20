import { Avatar, Icon, type IconName } from '../design/Icon';
import { lookColour, parseLook } from '../design/avatar';
import type { Unit } from '../lib/types';
import { currentStreak, xpToday, type Progress } from '../lib/progress';
import { t } from '../lib/strings';

type Props = { units: Unit[]; progress: Progress; today: string; onEditAvatar: () => void };

export function Profile({ units, progress, today, onEditAvatar }: Props) {
  const lang = progress.lang;
  const lessons = units.flatMap((u) => u.lessons);
  const done = lessons.filter((l) => l.id in progress.done).length;
  const { answered, firstTry } = progress.stats;
  // a learner who never picked one, or picked one of the old glyphs, gets the default look
  const look = parseLook(progress.avatar);
  const stats: [IconName, string, string][] = [
    ['star', t('xp', lang), String(progress.xp)],
    ['target', t('today', lang), `${xpToday(progress, today)} / ${progress.goal} ${t('xp', lang)}`],
    ['book', t('lessonsDone', lang), `${done} / ${lessons.length}`],
    // counted only since this counter was added, so it starts empty for an existing learner
    ['check', t('accuracy', lang), answered === 0 ? '–' : `${Math.round((firstTry / answered) * 100)} %`],
  ];
  return (
    <main className="page">
      <h1 className="page-title">{t('profile', lang)}</h1>
      <section className="profile-hero block" data-tone={lookColour(look).tone}>
        <Avatar look={look} size={88} className="avatar profile-avatar" />
        <p className="profile-streak">
          <Icon name="flame" size={26} />
          <span className="profile-streak-number">{currentStreak(progress, today)}</span> {t('streak', lang)}
        </p>
        <p className="profile-best">
          {t('bestStreak', lang)}: {progress.streak.best}
        </p>
        <button type="button" className="btn btn-small btn-secondary" onClick={onEditAvatar}>
          {t('editAvatar', lang)}
        </button>
      </section>

      <h2 className="eyebrow profile-section">{t('overview', lang)}</h2>
      <dl className="list profile-stats">
        {stats.map(([icon, label, value]) => (
          <div key={label} className="row">
            <dt className="row-label profile-stat-label">
              <span className="row-tile" aria-hidden="true">
                <Icon name={icon} size={20} />
              </span>
              {label}
            </dt>
            <dd className="row-value">{value}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
