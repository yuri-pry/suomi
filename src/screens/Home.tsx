import { Icon } from '../design/Icon';
import type { Lang, Unit } from '../lib/types';
import { currentStreak, xpToday, type Progress } from '../lib/progress';
import { lessonIds, lessonState, lessonsDone, nextLesson, stages, streakWeek } from '../lib/course';
import { t, weekdays } from '../lib/strings';
import { Ring } from '../design/Ring';

type Props = {
  units: Unit[];
  progress: Progress;
  today: string;
  /** Exercises due for review that this device can play. */
  reviewDue: number;
  onStart: (lessonId: string) => void;
  onReview: () => void;
  onPath: () => void;
  onTip: (unitId: string) => void;
};

const greeting = (lang: Lang, hour: number) => t(hour < 10 ? 'goodMorning' : hour < 18 ? 'goodDay' : 'goodEvening', lang);

/** The dashboard: what to do next, what is due, and how today is going. The full course is on the Path tab. */
export function Home({ units, progress, today, reviewDue, onStart, onReview, onPath, onTip }: Props) {
  const lang = progress.lang;
  const next = nextLesson(units, progress);
  const ids = lessonIds(units);
  const unit = next?.unit ?? units[units.length - 1];
  const stage = stages[unit.section];
  const sectionUnits = units.filter((u) => u.section === unit.section);
  const sectionLessons = sectionUnits.reduce((n, u) => n + u.lessons.length, 0);
  const unitNumber = units.indexOf(unit) + 1;
  const gained = xpToday(progress, today);
  const goalPct = Math.min(100, Math.round((gained / progress.goal) * 100));
  const week = streakWeek(progress, today);
  const date = new Date().toLocaleDateString(lang === 'fi' ? 'fi-FI' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <main className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">{date}</p>
          <h1 className="greeting" lang="fi">
            {greeting('fi', new Date().getHours())}
          </h1>
        </div>
      </header>

      <div className="stat-pills" style={{ marginBottom: 'var(--space-5)' }}>
        <span className="stat-pill">
          <span className="tint-streak">
            <Icon name="flame" size={18} />
          </span>
          {currentStreak(progress, today)} <span className="caption">{t('streak', lang)}</span>
        </span>
        <span className="stat-pill">
          <span className="tint-xp">
            <Icon name="star" size={18} />
          </span>
          {progress.xp} <span className="caption">{t('xp', lang)}</span>
        </span>
      </div>

      <div className="bento stagger">
        {next ? (
          <button type="button" className="tile tile-wide tile-button" data-tone="night" data-action="continue" onClick={() => onStart(next.lesson.id)}>
            <span className="eyebrow">
              {t('continue', lang)} · {t('unit', lang)} {unitNumber}
            </span>
            <span className="tile-title">{next.lesson.title}</span>
            <span className="tile-sub">{next.unit.title}</span>
            <span className="tile-foot">
              <span className="caption" style={{ color: 'var(--tone-muted)' }}>
                {next.index + 1} / {next.unit.lessons.length}
              </span>
              <span className="round-go" aria-hidden="true">
                <Icon name="arrow" />
              </span>
            </span>
          </button>
        ) : (
          <div className="tile tile-wide" data-tone="night">
            <span className="eyebrow">{t('yourPath', lang)}</span>
            <span className="tile-title">{t('lessonDone', lang)}</span>
            <span className="tile-sub">{t('courseDone', lang)}</span>
          </div>
        )}

        <section className="tile" data-tone="lake" aria-labelledby="review-title">
          <span className="eyebrow" id="review-title">
            {t('review', lang)}
          </span>
          <span className="tile-count">{reviewDue}</span>
          <span className="tile-sub">{reviewDue === 0 ? t('reviewClear', lang) : t('reviewDue', lang)}</span>
          {reviewDue > 0 && (
            <span className="tile-foot">
              <button type="button" className="btn btn-on-tone" onClick={onReview}>
                {t('reviewStart', lang)} <Icon name="arrow" size={18} />
              </button>
            </span>
          )}
          <span className="tile-art" aria-hidden="true">
            <Icon name="layers" size={96} />
          </span>
        </section>

        <section className="tile" data-tone="sun" aria-labelledby="goal-title">
          <span className="eyebrow" id="goal-title">
            {t('dailyGoal', lang)}
          </span>
          <Ring value={goalPct} label={`${gained}/${progress.goal}`} style={{ '--ring-color': 'var(--tone-sun-fg)', '--ring-track': 'var(--tone-sun-soft)', margin: 'var(--space-2) 0' }} />
          <span className="tile-sub">{gained >= progress.goal ? t('goalDone', lang) : `${progress.goal - gained} ${t('goalLeft', lang)}`}</span>
          <span className="tile-foot" style={{ paddingTop: 'var(--space-3)' }}>
            <span className="week-dots" role="img" aria-label={`${t('streak', lang)}: ${week.flatMap((d, i) => (d.on ? [weekdays[lang][i]] : [])).join(', ')}`}>
              {week.map((d) => (
                <span key={d.day} data-on={d.on || undefined} data-today={d.today || undefined} />
              ))}
            </span>
          </span>
        </section>

        <button type="button" className="tile tile-wide tile-button" onClick={onPath}>
          <span className="eyebrow">{t('yourPath', lang)}</span>
          <span className="tile-title">
            {stage.name[lang]} · {stage.level}
          </span>
          {next && (
            <span className="tile-sub">
              {t('nextUp', lang)}: {next.lesson.title}
            </span>
          )}
          <span className="tile-foot">
            <span className="trail" aria-hidden="true">
              {unit.lessons.map((l) => (
                <i key={l.id} data-state={lessonState(progress, ids, l.id)} />
              ))}
            </span>
            <span className="caption">
              {lessonsDone(sectionUnits, progress)} / {sectionLessons} {t('lessonsWord', lang)}
            </span>
          </span>
        </button>

        <button type="button" className="tile tile-wide tile-button" data-tone="mint" style={{ minHeight: 0 }} onClick={() => onTip(unit.id)}>
          <span className="eyebrow">
            {t('grammar', lang)} · {t('unit', lang)} {unitNumber}
          </span>
          <span className="tile-title" style={{ fontSize: 'var(--text-xl)' }}>
            {unit.title}
          </span>
          <span className="tile-sub">{t('grammarSub', lang)}</span>
          <span className="tile-art" aria-hidden="true">
            <Icon name="book" size={88} />
          </span>
        </button>
      </div>
    </main>
  );
}
