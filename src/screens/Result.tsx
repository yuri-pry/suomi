import { Icon } from '../design/Icon';
import type { Lang } from '../lib/types';
import { t, type StringKey } from '../lib/strings';

type Props = { lang: Lang; title?: StringKey; xpGained: number; mistakes: number; streak: number; onHome: () => void };

export function Result({ lang, title = 'lessonDone', xpGained, mistakes, streak, onHome }: Props) {
  return (
    <div className="result">
      <main>
        <p className="celebrate celebrate-mark" aria-hidden="true">
          <Icon name="star" size={64} />
        </p>
        <h1>{t(title, lang)}</h1>
        <dl className="stat-grid stagger">
          <div className="stat-tile">
            <dt>{t('xp', lang)}</dt>
            <dd>
              +{xpGained} {t('earned', lang)}
            </dd>
          </div>
          <div className="stat-tile">
            <dt>{t('mistakes', lang)}</dt>
            <dd>{mistakes === 0 ? t('perfect', lang) : mistakes}</dd>
          </div>
          <div className="stat-tile">
            <dt><Icon name="flame" /></dt>
            <dd>
              {streak} {t('streak', lang)}
            </dd>
          </div>
        </dl>
      </main>
      <footer className="action">
        <button type="button" className="btn btn-primary btn-block" autoFocus onClick={onHome}>
          {t('backHome', lang)}
        </button>
      </footer>
    </div>
  );
}
