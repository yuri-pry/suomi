import { useState } from 'react';
import { Avatar, Icon, avatars } from '../design/Icon';
import { haptic } from '../lib/haptics';
import type { Unit } from '../lib/types';
import { currentStreak, xpToday, type Progress } from '../lib/progress';
import { nextLesson, stages, streakWeek } from '../lib/course';
import { t, weekdays } from '../lib/strings';

type Props = {
  units: Unit[];
  progress: Progress;
  today: string;
  onChange: (patch: Partial<Progress>) => void;
  onSettings: () => void;
};

export function Profile({ units, progress, today, onChange, onSettings }: Props) {
  const lang = progress.lang;
  const [picking, setPicking] = useState(false);
  const lessons = units.flatMap((u) => u.lessons);
  const done = lessons.filter((l) => l.id in progress.done).length;
  const { answered, firstTry } = progress.stats;
  const streak = currentStreak(progress, today);
  const week = streakWeek(progress, today);
  const unit = nextLesson(units, progress)?.unit ?? units[units.length - 1];
  const stage = stages[unit.section];
  const avatar = (avatars.find((a) => a.id === progress.avatar) ?? avatars[0]).id;

  const stats: [string, string][] = [
    [t('xp', lang), String(progress.xp)],
    [t('today', lang), `${xpToday(progress, today)} / ${progress.goal}`],
    [t('bestStreak', lang), String(progress.streak.best)],
    [t('lessonsDone', lang), `${done} / ${lessons.length}`],
    // counted only since this counter was added, so it starts empty for an existing learner
    [t('accuracy', lang), answered === 0 ? '–' : `${Math.round((firstTry / answered) * 100)}%`],
    [t('inReview', lang), String(Object.keys(progress.review).length)],
  ];

  return (
    <main className="page">
      <header className="page-head">
        <h1 className="greeting">{t('profile', lang)}</h1>
        <button type="button" className="icon-btn" aria-label={t('settings', lang)} onClick={onSettings}>
          <Icon name="settings" />
        </button>
      </header>

      <div className="profile-id">
        <button
          type="button"
          className="avatar-option"
          aria-expanded={picking}
          aria-label={t('changeAvatar', lang)}
          onClick={() => setPicking(!picking)}
        >
          <Avatar id={avatar} size={72} className="avatar" />
        </button>
        <div style={{ display: 'grid', gap: 'var(--space-2)', justifyItems: 'start' }}>
          <span className="page-title">{t('learner', lang)}</span>
          <span className="level-tag">
            {stage.level} · {stage.name[lang]}
          </span>
        </div>
      </div>

      {picking && (
        <div className="avatar-grid card" role="radiogroup" aria-label={t('avatar', lang)} style={{ marginBottom: 'var(--space-5)' }}>
          {avatars.map((a) => (
            <button
              key={a.id}
              type="button"
              role="radio"
              className="avatar-option"
              aria-checked={avatar === a.id}
              aria-label={a.label}
              onClick={() => {
                haptic('tap');
                onChange({ avatar: a.id });
                setPicking(false);
              }}
            >
              <Avatar id={a.id} size={52} className="avatar" />
            </button>
          ))}
        </div>
      )}

      <section className="card" aria-labelledby="streak-title">
        <div className="streak-head">
          <div>
            <h2 className="chapter-title" id="streak-title">
              {t('streakTitle', lang)}
            </h2>
            <p className="caption">{streak > 0 ? t('keepGoing', lang) : t('streakStart', lang)}</p>
          </div>
          <p className="streak-count">
            <span className="tint-streak">
              <Icon name="flame" size={32} />
            </span>
            {streak}
            <small>{t(streak === 1 ? 'day' : 'days', lang)}</small>
          </p>
        </div>
        <ol className="week" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {week.map((d, i) => (
            <li key={d.day} className="week-day" data-on={d.on || undefined} data-today={d.today || undefined}>
              <span className="week-dot">{d.on && <Icon name="check" size={18} />}</span>
              {weekdays[lang][i]}
            </li>
          ))}
        </ol>
      </section>

      <h2 className="section-title">{t('overview', lang)}</h2>
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
