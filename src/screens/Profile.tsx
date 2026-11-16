import { Avatar, Icon, avatars, type IconName } from '../design/Icon';
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
  // a learner who never picked one is shown the first
  const avatar = avatars.find((a) => a.id === progress.avatar) ?? avatars[0];
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
      <section className="profile-hero block" data-tone={avatar.tone}>
        <Avatar id={avatar.id} size={88} className="avatar profile-avatar" />
        <p className="profile-streak">
          <Icon name="flame" size={26} />
          <span className="profile-streak-number">{currentStreak(progress, today)}</span> {t('streak', lang)}
        </p>
        <p className="profile-best">
          {t('bestStreak', lang)}: {progress.streak.best}
        </p>
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

      <h2 className="eyebrow profile-section">{t('avatar', lang)}</h2>
      <div className="avatar-grid card" role="radiogroup" aria-label={t('avatar', lang)}>
        {avatars.map((a) => (
          <button
            key={a.id}
            type="button"
            role="radio"
            className="avatar-option"
            aria-checked={avatar.id === a.id}
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
    </main>
  );
}
