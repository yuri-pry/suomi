import { Avatar, Icon, type IconName } from '../design/Icon';
import { accessories, animals, bgStyles, colours, expressions, lookColour, lookString, parseLook, type Look } from '../design/avatar';
import { haptic } from '../lib/haptics';
import type { Lang, Unit } from '../lib/types';
import { currentStreak, xpToday, type Progress } from '../lib/progress';
import { t, type StringKey } from '../lib/strings';

type Props = { units: Unit[]; progress: Progress; today: string; onChange: (patch: Partial<Progress>) => void };

export function Profile({ units, progress, today, onChange }: Props) {
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
      <div className="avatar-editor card">
        {pickers.map(([field, label, table]) => (
          <div key={field} className="avatar-picker">
            <h3 className="avatar-picker-label">{t(label, lang)}</h3>
            <div className="avatar-grid" role="radiogroup" aria-label={t(label, lang)}>
              {Object.entries(table).map(([key, option]) => {
                // each choice previews the current look with only that part changed
                const next = { ...look, [field]: key };
                return (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    className="avatar-option"
                    // colour '' is the animal's own, so that swatch shows as chosen
                    aria-checked={(field === 'colour' ? look.colour || animals[look.animal].bg : look[field]) === key}
                    aria-label={option.label[lang]}
                    onClick={() => {
                      haptic('tap');
                      onChange({ avatar: lookString(next) });
                    }}
                  >
                    <Avatar look={next} size={52} className="avatar" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

const pickers = [
  ['animal', 'avatarAnimal', animals],
  ['colour', 'avatarColour', colours],
  ['style', 'avatarStyle', bgStyles],
  ['expression', 'avatarExpression', expressions],
  ['accessory', 'avatarAccessory', accessories],
] as const satisfies readonly (readonly [keyof Look, StringKey, Record<string, { label: Record<Lang, string> }>])[];
