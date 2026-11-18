import { Icon } from '../design/Icon';
import type { Lang } from '../lib/types';
import { t, type StringKey } from '../lib/strings';

type Props = {
  lang: Lang;
  title?: StringKey;
  xpGained: number;
  mistakes: number;
  streak: number;
  /** Set after a unit checkpoint: the score replaces the mistakes tile and a failed one says what is needed. */
  checkpoint?: { score: number; total: number; passed: boolean };
  onHome: () => void;
};

export function Result({ lang, title = 'lessonDone', xpGained, mistakes, streak, checkpoint, onHome }: Props) {
  const failed = checkpoint !== undefined && !checkpoint.passed;
  return (
    <div className="result">
      <main>
        <p className="celebrate block" data-tone="2" aria-hidden="true">
          <span className="celebrate-mark">
            <Icon name={failed ? 'target' : 'star'} size={64} />
          </span>
          <span className="celebrate-burst">
            {Array.from({ length: 8 }, (_, i) => (
              <i key={i} />
            ))}
          </span>
        </p>
        <h1>{t(title, lang)}</h1>
        {checkpoint && <p className="result-note">{t(failed ? 'checkpointNeed' : 'checkpointOpened', lang)}</p>}
        <dl className="stat-grid stagger">
          <div className="stat-tile block" data-tone="1">
            <dt>{t('xp', lang)}</dt>
            <dd>
              +{xpGained} {t('earned', lang)}
            </dd>
          </div>
          <div className="stat-tile block" data-tone="3">
            <dt>{t(checkpoint ? 'score' : 'mistakes', lang)}</dt>
            <dd>{checkpoint ? `${checkpoint.score} / ${checkpoint.total}` : mistakes === 0 ? t('perfect', lang) : mistakes}</dd>
          </div>
          <div className="stat-tile block" data-tone="4">
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
