import { useContext, useMemo } from 'react';
import { Icon } from '../design/Icon';
import type { Lang, Unit } from '../lib/types';
import { tipParts, unitVocabulary } from '../lib/course';
import { haptic } from '../lib/haptics';
import { t } from '../lib/strings';
import { SpeakerContext } from '../exercises/Speakable';

type Props = {
  unit: Unit;
  unitNumber: number;
  lang: Lang;
  /** Set when the tip opens on the way into the unit's first lesson. */
  startsLesson: boolean;
  onDone: () => void;
  onBack: () => void;
};

/** The unit's grammar tip as an explanation page. Finnish in the text is highlighted and speaks when tapped. */
export function Explain({ unit, unitNumber, lang, startsLesson, onDone, onBack }: Props) {
  const speaker = useContext(SpeakerContext);
  const vocabulary = useMemo(() => unitVocabulary(unit), [unit]);
  // The Finnish tip is shown in the Finnish interface when the unit has one.
  const text = lang === 'fi' && unit.tip.fi ? unit.tip.fi : unit.tip.en;
  const paragraphs = text.split('\n\n');

  return (
    <div className="screen">
      <header className="lesson-top">
        <button type="button" className="icon-btn" aria-label={t('back', lang)} onClick={onBack}>
          <Icon name="back" />
        </button>
        <div className="lesson-heading">
          <span className="lesson-heading-title">{unit.title}</span>
          <span className="lesson-heading-count">
            {t('unit', lang)} {unitNumber}
          </span>
        </div>
        <span />
      </header>

      <main className="screen-body">
        <span className="tag">
          <Icon name="book" size={18} /> {t('grammar', lang)}
        </span>
        <h1 className="explain-title">{t('tip', lang)}</h1>
        <div className="explain-body">
          {paragraphs.map((p, i) => (
            <p key={i}>
              {tipParts(p, vocabulary).map((part, j) =>
                !part.finnish ? (
                  part.text
                ) : speaker && !part.text.startsWith('-') ? (
                  <button
                    key={j}
                    type="button"
                    className="hl"
                    lang="fi"
                    onClick={() => {
                      haptic('tap');
                      speaker.speak(part.text);
                    }}
                  >
                    {part.text}
                  </button>
                ) : (
                  <span key={j} className="hl" lang="fi">
                    {part.text}
                  </span>
                ),
              )}
            </p>
          ))}
        </div>
      </main>

      <footer className="action">
        <button type="button" className="btn btn-primary btn-block" autoFocus onClick={onDone}>
          {t(startsLesson ? 'startLesson' : 'gotIt', lang)} <Icon name={startsLesson ? 'arrow' : 'check'} size={20} />
        </button>
      </footer>
    </div>
  );
}
