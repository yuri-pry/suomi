import { useContext, useState } from 'react';
import type { Lang } from '../lib/types';
import { t, type StringKey } from '../lib/strings';
import { Icon } from '../design/Icon';
import { SpeakerContext } from '../exercises/Speakable';

type Props = { lang: Lang; onBeginner: () => void; onTest: () => void };

// The Finnish line is the same in both interface languages: reading it is part of choosing.
const levels: { label: StringKey; fi: string; gloss: StringKey }[] = [
  { label: 'levelNone', fi: 'En osaa vielä suomea.', gloss: 'levelNoneGloss' },
  { label: 'levelFew', fi: 'Osaan muutaman sanan.', gloss: 'levelFewGloss' },
  { label: 'levelSome', fi: 'Puhun vähän suomea.', gloss: 'levelSomeGloss' },
  { label: 'levelMuch', fi: 'Puhun suomea joka päivä.', gloss: 'levelMuchGloss' },
];

/** First launch: the learner says how much Finnish they have. Only a beginner skips the placement test. */
export function Welcome({ lang, onBeginner, onTest }: Props) {
  const speaker = useContext(SpeakerContext);
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="welcome">
      <main className="page">
        <h1 className="page-title">{t('welcomeTitle', lang)}</h1>
        <p className="caption">{t('welcomeSub', lang)}</p>
        <div className="level-list" role="radiogroup" aria-label={t('welcomeTitle', lang)}>
          {levels.map((level, i) => (
            <div key={level.label} className="level-card" data-selected={picked === i || undefined}>
              <button type="button" role="radio" aria-checked={picked === i} className="level-card-main" onClick={() => setPicked(i)}>
                <span className="level-meter">
                  <span className="level-dots" aria-hidden="true">
                    {[1, 2, 3].map((dot) => (
                      <span key={dot} className="level-dot" data-on={dot <= i || undefined} />
                    ))}
                  </span>
                  <span className="level-meter-label">{t(level.label, lang)}</span>
                </span>
                <span className="level-card-text">
                  <span className="level-card-title" lang="fi">{level.fi}</span>
                  <span className="level-card-sub">{t(level.gloss, lang)}</span>
                </span>
              </button>
              {speaker && (
                <button type="button" className="icon-btn" aria-label={`${t('hear', lang)}: ${level.fi}`} onClick={() => speaker.speak(level.fi)}>
                  <Icon name="speaker" />
                </button>
              )}
            </div>
          ))}
        </div>
        {picked !== null && picked > 0 && <p className="caption">{t('testNote', lang)}</p>}
      </main>
      <footer className="action">
        <button type="button" className="primary" disabled={picked === null} onClick={picked === 0 ? onBeginner : onTest}>
          {t(picked === 0 || picked === null ? 'levelStart' : 'levelTest', lang)}
        </button>
      </footer>
    </div>
  );
}
