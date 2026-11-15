import { Icon } from '../design/Icon';
import type { Lang } from '../lib/types';
import { t, type StringKey } from '../lib/strings';

type Props = {
  lang: Lang;
  title?: StringKey;
  /** The lesson just finished; absent after a review. */
  lessonTitle?: string;
  xpGained: number;
  mistakes: number;
  streak: number;
  /** The right answers of the items missed, as they will come back in review. */
  missed: { text: string; lang: Lang }[];
  /** The next lesson, when there is one to go on to. */
  next?: string;
  onNext?: () => void;
  onHome: () => void;
};

export function Result({ lang, title = 'lessonDone', lessonTitle, xpGained, mistakes, streak, missed, next, onNext, onHome }: Props) {
  return (
    <div className="screen">
      <main className="result-body">
        <p className="result-mark celebrate-mark" aria-hidden="true">
          <Icon name="star" size={44} />
        </p>
        <div>
          <h1 className="display">{t(title, lang)}</h1>
          {lessonTitle && (
            <p className="lead" style={{ marginTop: 'var(--space-2)' }}>
              {lessonTitle}
            </p>
          )}
        </div>

        <div className="summary stagger">
          <ul className="chips" aria-label={t('overview', lang)} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            <li className="chip">
              <span className="tint-xp">
                <Icon name="star" size={18} />
              </span>
              +{xpGained} {t('xp', lang)}
            </li>
            <li className="chip">
              <span className="tint-streak">
                <Icon name="flame" size={18} />
              </span>
              {streak} {t('streak', lang)}
            </li>
            <li className="chip">
              <Icon name={mistakes === 0 ? 'check' : 'target'} size={18} />
              {mistakes === 0 ? t('perfect', lang) : `${mistakes} ${t('mistakes', lang).toLowerCase()}`}
            </li>
          </ul>

          <div className="summary-line" style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--line)' }}>
            <Icon name="refresh" size={22} />
            <span>{missed.length === 0 ? t('cleanRun', lang) : t('reviewComesBack', lang)}</span>
          </div>
          {missed.length > 0 && (
            <ul className="chips" style={{ listStyle: 'none', margin: 'var(--space-3) 0 0', padding: 0 }}>
              {missed.slice(0, 8).map((m) => (
                <li key={m.text} className="chip" lang={m.lang}>
                  {m.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <footer className="action">
        {next && onNext ? (
          <>
            <button type="button" className="btn btn-primary btn-block" autoFocus onClick={onNext}>
              {t('continue', lang)} <Icon name="arrow" size={20} />
            </button>
            <button type="button" className="btn btn-ghost btn-block btn-sm" onClick={onHome}>
              {t('backHome', lang)}
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-primary btn-block" autoFocus onClick={onHome}>
            {t('backHome', lang)}
          </button>
        )}
        {next && onNext && (
          <p className="caption" style={{ textAlign: 'center' }}>
            {t('nextUp', lang)}: {next}
          </p>
        )}
      </footer>
    </div>
  );
}
