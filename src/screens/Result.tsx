import { Icon } from '../design/Icon';
import type { Lang } from '../lib/types';
import { t } from '../lib/strings';

type Props = { lang: Lang; xpGained: number; mistakes: number; streak: number; onHome: () => void };

export function Result({ lang, xpGained, mistakes, streak, onHome }: Props) {
  return (
    <div className="result">
      <main>
        <p className="result-mark" aria-hidden="true">
          <Icon name="star" size={64} />
        </p>
        <h1>{t('lessonDone', lang)}</h1>
        <dl className="result-stats">
          <div>
            <dt>{t('xp', lang)}</dt>
            <dd>
              +{xpGained} {t('earned', lang)}
            </dd>
          </div>
          <div>
            <dt>{t('mistakes', lang)}</dt>
            <dd>{mistakes === 0 ? t('perfect', lang) : mistakes}</dd>
          </div>
          <div>
            <dt><Icon name="flame" /></dt>
            <dd>
              {streak} {t('streak', lang)}
            </dd>
          </div>
        </dl>
      </main>
      <footer className="action">
        <button type="button" className="primary" autoFocus onClick={onHome}>
          {t('backHome', lang)}
        </button>
      </footer>
    </div>
  );
}
