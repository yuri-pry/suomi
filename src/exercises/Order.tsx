import { Speakable } from './Speakable';
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { Lang, Order as OrderExercise } from '../lib/types';
import { dropIndex, moveTile, tilesFor } from '../lib/exercise';
import { shuffle } from '../lib/lesson';
import { t } from '../lib/strings';

type Props = {
  exercise: OrderExercise;
  onChange: (words: string[]) => void;
  locked: boolean;
  lang: Lang;
};

/** Below this much pointer travel a press is still a tap. */
const TAP_SLOP = 6;

type Drag = {
  id: number;
  /** Where the chip was in the answer row, or -1 when it came from the bank. */
  from: number;
  /** Pointer position, and the grab point inside the chip, in viewport pixels. */
  x: number;
  y: number;
  dx: number;
  dy: number;
  w: number;
  h: number;
  /** Insertion index in the row without the dragged chip; null while the pointer is away from the row. */
  to: number | null;
};

export function Order({ exercise, onChange, locked, lang }: Props) {
  // Shuffled once per mount; the parent remounts on each new attempt.
  const tiles = useMemo(() => {
    const words = tilesFor(exercise);
    return shuffle(words.map((_, i) => i)).map((i) => ({ id: i, word: words[i] }));
  }, [exercise]);
  // Tile ids, not words: a word can appear twice.
  const [placed, setPlaced] = useState<number[]>([]);
  const [drag, setDrag] = useState<Drag | null>(null);
  const row = useRef<HTMLDivElement>(null);
  // Mirrors state for the window listeners, which outlive a render.
  const live = useRef({ drag, placed });
  live.current = { drag, placed };
  const pending = useRef<{ id: number; from: number; px: number; py: number; rect: DOMRect } | null>(null);
  const moved = useRef(false);

  const word = (id: number) => tiles.find((tile) => tile.id === id)!.word;

  function update(next: number[]) {
    setPlaced(next);
    onChange(next.map(word));
  }

  function target(x: number, y: number, id: number) {
    const box = row.current;
    if (!box) return null;
    const r = box.getBoundingClientRect();
    const pad = 24;
    if (x < r.left - pad || x > r.right + pad || y < r.top - pad || y > r.bottom + pad) return null;
    const chips = [...box.querySelectorAll<HTMLElement>('[data-chip]')]
      .filter((c) => Number(c.dataset.chip) !== id)
      .map((c) => c.getBoundingClientRect());
    return dropIndex(chips, x, y);
  }

  function onDown(e: ReactPointerEvent<HTMLElement>, id: number, from: number) {
    if (locked || e.button !== 0 || !e.isPrimary) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pending.current = { id, from, px: e.clientX, py: e.clientY, rect: e.currentTarget.getBoundingClientRect() };
    moved.current = false;
  }

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const p = pending.current;
      if (!p) return;
      if (!live.current.drag && Math.hypot(e.clientX - p.px, e.clientY - p.py) < TAP_SLOP) return;
      moved.current = true;
      setDrag({
        id: p.id,
        from: p.from,
        x: e.clientX,
        y: e.clientY,
        dx: p.px - p.rect.left,
        dy: p.py - p.rect.top,
        w: p.rect.width,
        h: p.rect.height,
        to: target(e.clientX, e.clientY, p.id),
      });
    }
    function onUp() {
      const { drag: d, placed: now } = live.current;
      pending.current = null;
      if (!d) return;
      setDrag(null);
      // a drop away from the row leaves everything where it was
      if (d.to !== null) update(moveTile(now, d.id, d.to));
      // the click that may follow a drag must not also count as a tap
      setTimeout(() => (moved.current = false));
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, []);

  const tap = (next: number[]) => () => {
    if (!moved.current) update(next);
  };

  // While dragging, the chip leaves the row and a slot of its size marks where it would land.
  const shown = drag ? placed.filter((id) => id !== drag.id) : placed;
  const slotAt = drag ? (drag.to ?? (drag.from >= 0 ? drag.from : null)) : null;
  const slot = <span key="slot" className="tile-slot" style={{ width: drag?.w, height: drag?.h }} aria-hidden="true" />;

  return (
    <>
      <h1 className="prompt" lang={exercise.promptLang}>
        <Speakable text={exercise.prompt} lang={exercise.promptLang} />
      </h1>
      <div ref={row} className="tiles built" role="group" aria-label={t('yourSentence', lang)} lang={exercise.answerLang}>
        {shown.flatMap((id, i) => [
          i === slotAt && slot,
          <button
            key={id}
            type="button"
            className="tile tile-drag-source"
            data-chip={id}
            disabled={locked}
            onPointerDown={(e) => onDown(e, id, placed.indexOf(id))}
            onClick={tap(placed.filter((p) => p !== id))}
          >
            {word(id)}
          </button>,
        ])}
        {slotAt !== null && slotAt >= shown.length && slot}
      </div>
      <div className="tiles" role="group" aria-label={t('words', lang)} lang={exercise.answerLang}>
        {tiles.map(({ id, word: w }) =>
          placed.includes(id) || drag?.id === id ? (
            // keeps the pool from reflowing; the tile reads as moved to the sentence
            <span key={id} className="tile-gap" aria-hidden="true" />
          ) : (
            <button
              key={id}
              type="button"
              className="tile tile-drag-source"
              disabled={locked}
              onPointerDown={(e) => onDown(e, id, -1)}
              onClick={tap([...placed, id])}
            >
              {w}
            </button>
          ),
        )}
      </div>
      {drag && (
        <span className="tile tile-float" aria-hidden="true" style={{ left: drag.x - drag.dx, top: drag.y - drag.dy, width: drag.w, height: drag.h }}>
          {word(drag.id)}
        </span>
      )}
    </>
  );
}
