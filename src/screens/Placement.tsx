import { useState, type FormEvent } from 'react';
import type { Lang, Unit } from '../lib/types';
import { BLOCK_SIZE, afterBlock, blockFor, maxBlocks, nextUnit, passes, startIndex, startSearch, type PlacementItem } from '../lib/placement';
import { emptyResponse, grade, type Response } from '../lib/exercise';
import { t } from '../lib/strings';
import { Icon } from '../design/Icon';
import { Choice } from '../exercises/Choice';
import { Fill } from '../exercises/Fill';
import { Speakable } from '../exercises/Speakable';

type Props = {
  items: PlacementItem[];
  /** The units that can be tested, in course order. */
  units: Unit[];
  lang: Lang;
  /** Called with the id of the unit to start at. */
  onDone: (unitId: string) => void;
  onQuit: () => void;
};

/** The placement test: blocks of three items, no feedback and no XP. Ends on a screen that names the start unit. */
export function Placement({ items, units, lang, onDone, onQuit }: Props) {
  const [search, setSearch] = useState(() => startSearch(units.length));
  const [at, setAt] = useState(0);
  const [right, setRight] = useState(0);
  const [asked, setAsked] = useState(0);
  const [response, setResponse] = useState<Response>(null);

  const unitIndex = nextUnit(search);
  if (unitIndex === null) {
    const unit = units[startIndex(search, units.length)];
    return (
      <div className="result">
        <main>
          <p className="result-mark" aria-hidden="true">
            <Icon name="target" size={64} />
          </p>
          <h1>{t('placementDone', lang)}</h1>
          <p className="placement-unit">
            {t('unit', lang)} {units.indexOf(unit) + 1}: {unit.title}
          </p>
          <p className="caption">{t('placementNote', lang)}</p>
        </main>
        <footer className="action">
          <button type="button" className="primary" autoFocus onClick={() => onDone(unit.id)}>
            {t('start', lang)}
          </button>
        </footer>
      </div>
    );
  }

  const block = blockFor(items, units[unitIndex].id);
  const item = block[at];
  const value = response ?? emptyResponse(item);
  const verdict = grade(item, value);
  const total = maxBlocks(units.length) * BLOCK_SIZE;

  function record(correct: boolean) {
    const nowRight = right + (correct ? 1 : 0);
    setAsked(asked + 1);
    setResponse(null);
    if (at + 1 < block.length) {
      setAt(at + 1);
      setRight(nowRight);
      return;
    }
    setSearch(afterBlock(search, passes(nowRight)));
    setAt(0);
    setRight(0);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    // a typo still shows the learner knows the form
    if (verdict !== null) record(verdict !== 'wrong');
  }

  return (
    <form className="lesson" onSubmit={submit}>
      <header className="lesson-top">
        <button type="button" className="quit" aria-label={t('quitTest', lang)} onClick={onQuit}>
          <Icon name="close" />
        </button>
        <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={asked}>
          <div className="bar-fill" style={{ transform: `scaleX(${asked / total})` }} />
        </div>
      </header>

      <main className="exercise" key={item.id}>
        <p className="instruction">{t(item.type === 'fill' ? 'typeAnswer' : 'chooseAnswer', lang)}</p>
        {item.type === 'fill' ? (
          <Fill exercise={item} value={value as string} onChange={setResponse} locked={false} label={t('typeAnswer', lang)} />
        ) : (
          <>
            <h1 className="prompt" lang={item.promptLang}>
              <Speakable text={item.prompt} lang={item.promptLang} />
            </h1>
            <Choice exercise={item} selected={value as number | null} onSelect={setResponse} locked={false} />
          </>
        )}
      </main>

      <footer className="action">
        <button type="button" className="btn btn-ghost btn-block" onClick={() => record(false)}>
          {t('dontKnow', lang)}
        </button>
        <button type="submit" className="primary" disabled={verdict === null}>
          {t('next', lang)}
        </button>
      </footer>
    </form>
  );
}
