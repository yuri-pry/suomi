// Review page for the design system. Dev only: open /src/design/gallery.html under `npm run dev`.
import { StrictMode, useEffect, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { Avatar, Icon, avatars, iconNames } from './Icon';
import { Ring } from './Ring';
import './tokens.css';
import './components.css';
import './motion.css';

type Theme = 'auto' | 'light' | 'dark';

const colours: [string, string[]][] = [
  ['Surfaces', ['bg', 'surface', 'surface-2', 'chip', 'line', 'line-strong']],
  ['Text', ['text', 'muted', 'subtle']],
  ['Ink and accent', ['ink', 'ink-text', 'accent', 'accent-strong', 'accent-soft']],
  ['Feedback', ['right', 'right-bg', 'wrong', 'wrong-bg', 'typo', 'typo-bg']],
  ['Card tones', ['tone-night-bg', 'tone-lake-bg', 'tone-sun-bg', 'tone-mint-bg']],
  ['Marks', ['streak', 'xp']],
  ['Mastery scale', ['mastery-0', 'mastery-1', 'mastery-2', 'mastery-3', 'mastery-4']],
];

// [text, background, minimum ratio]: every pair the components use. 3 is for large or bold text only.
const pairs: [string, string, number][] = [
  ['text', 'bg', 4.5], ['muted', 'bg', 4.5], ['muted', 'surface', 4.5], ['muted', 'surface-2', 4.5], ['subtle', 'surface', 3],
  ['ink-text', 'ink', 4.5], ['accent', 'surface', 4.5], ['accent', 'accent-soft', 4.5], ['accent-text', 'accent', 4.5], ['text', 'chip', 4.5],
  ['right', 'right-bg', 4.5], ['wrong', 'wrong-bg', 4.5], ['typo', 'typo-bg', 4.5],
  ['tone-night-fg', 'tone-night-bg', 4.5], ['tone-night-muted', 'tone-night-bg', 4.5], ['tone-lake-fg', 'tone-lake-bg', 4.5],
  ['tone-sun-fg', 'tone-sun-bg', 4.5], ['tone-mint-fg', 'tone-mint-bg', 4.5], ['streak', 'surface', 3], ['xp', 'surface', 3],
];

const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();

function luminance(hex: string) {
  const n = hex.replace('#', '');
  if (n.length !== 6) return null;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: string, b: string) {
  const [la, lb] = [luminance(a), luminance(b)];
  if (la === null || lb === null) return null;
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginTop: 'var(--space-7)' }}>
      <h2 className="section-title">{title}</h2>
      {children}
    </section>
  );
}

function Gallery() {
  const [theme, setTheme] = useState<Theme>('auto');
  const [, redraw] = useState(0);
  useEffect(() => {
    if (theme === 'auto') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = theme;
    redraw((n) => n + 1);
  }, [theme]);

  return (
    <div className="g-page">
      <header className="g-top">
        <strong>Suomi design system</strong>
        <div className="segmented">
          {(['auto', 'light', 'dark'] as Theme[]).map((t) => (
            <label key={t} className="segment">
              <input type="radio" name="theme" checked={theme === t} onChange={() => setTheme(t)} />
              <span>{t}</span>
            </label>
          ))}
        </div>
      </header>

      <Section title="Colour">
        {colours.map(([group, names]) => (
          <div key={group} style={{ marginBottom: 'var(--space-4)' }}>
            <p className="eyebrow" style={{ marginBottom: 'var(--space-2)' }}>
              {group}
            </p>
            <div className="g-grid">
              {names.map((n) => (
                <div key={n} className="g-swatch">
                  <i style={{ background: `var(--${n})` }} />
                  <span>
                    --{n}
                    <br />
                    <code>{token(n)}</code>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <p className="eyebrow" style={{ margin: 'var(--space-5) 0 var(--space-2)' }}>
          Contrast of the pairs in use
        </p>
        <div className="g-grid">
          {pairs.map(([fg, bg, min]) => {
            const r = ratio(token(fg), token(bg));
            return (
              <div key={fg + bg} className="g-pair" style={{ color: `var(--${fg})`, background: `var(--${bg})`, outline: r !== null && r < min ? '3px solid red' : undefined }}>
                {fg} on {bg}
                <br />
                {r === null ? 'n/a' : `${r.toFixed(2)} : 1`} (min {min})
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Type">
        <div className="g-stack" style={{ maxWidth: '34rem' }}>
          <p className="eyebrow">Eyebrow · Chapter 1</p>
          <p className="display">You reached the end of the lesson.</p>
          <p className="page-title">Page title</p>
          <p className="tile-title">Card title</p>
          <p className="prompt" style={{ margin: 0 }}>
            <button type="button" className="word">Mitä</button> <button type="button" className="word">teit</button> <button type="button" className="word">eilen</button>?
          </p>
          <p className="lead">Lead text for a screen, quieter than the headline.</p>
          <div className="explain-body">
            <p>
              An <span className="hl">i</span> before the person ending makes the past: <span className="hl">puhun</span> becomes <span className="hl">puhuin</span>.
            </p>
          </div>
          <p className="caption">Caption and counters</p>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="g-row">
          <button type="button" className="btn btn-primary">Check</button>
          <button type="button" className="btn btn-primary">
            Next <Icon name="arrow" size={20} />
          </button>
          <button type="button" className="btn btn-accent">Accent</button>
          <button type="button" className="btn btn-secondary">Secondary</button>
          <button type="button" className="btn btn-ghost">Ghost</button>
          <button type="button" className="btn btn-primary" disabled>
            Disabled
          </button>
          <button type="button" className="icon-btn" aria-label="Close">
            <Icon name="close" />
          </button>
          <span className="round-go">
            <Icon name="arrow" />
          </span>
          <span className="pill">Next</span>
          <span className="tag">
            <Icon name="book" size={18} /> Grammar
          </span>
        </div>
      </Section>

      <Section title="Answer options">
        <div className="g-stack">
          {[
            ['A', 'to sleep', undefined, false],
            ['B', 'to rest', undefined, true],
            ['C', 'to do', 'wrong', false],
            ['D', 'bus', 'right', false],
          ].map(([key, text, verdict, checked]) => (
            <button key={key as string} type="button" role="radio" aria-checked={checked as boolean} className="option" data-verdict={verdict as string | undefined}>
              <span className="option-key">{key as string}</span>
              <span className="option-text">{text as string}</span>
              {verdict && (
                <span className="option-mark">
                  <Icon name={verdict === 'right' ? 'check' : 'cross'} size={16} />
                </span>
              )}
            </button>
          ))}
          {(['right', 'typo', 'wrong'] as const).map((v) => (
            <div key={v} className="feedback-card" data-verdict={v} style={{ marginTop: 0 }}>
              <p className="feedback-title">
                <Icon name={v === 'wrong' ? 'cross' : 'check'} size={22} /> {v === 'right' ? 'Correct' : v === 'typo' ? 'Correct, with a typo' : 'Not quite'}
              </p>
              {v !== 'right' && (
                <p className="feedback-text">
                  Correct answer: <strong>levätä</strong>
                </p>
              )}
            </div>
          ))}
          <div className="steps">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} className="step" data-state={i < 7 ? 'done' : i === 7 ? 'current' : undefined} />
            ))}
          </div>
          <div className="tiles built">
            <button type="button" className="tile-word">Minä</button>
            <button type="button" className="tile-word">puhun</button>
          </div>
          <div className="tiles">
            <span className="tile-gap" />
            <span className="tile-gap" />
            <button type="button" className="tile-word">suomea</button>
          </div>
        </div>
      </Section>

      <Section title="Path">
        <div className="g-stack">
          {(['done', 'open', 'locked'] as const).map((s, i) => (
            <button key={s} type="button" className="lesson-card" data-state={s} disabled={s === 'locked'}>
              <span className="lesson-thumb">
                {i + 1}
                <span className="state-mark" data-state={s}>
                  {s === 'done' && <Icon name="check" size={14} />}
                  {s === 'locked' && <Icon name="lock" size={14} />}
                </span>
              </span>
              <span className="lesson-card-title">{['Greetings', 'To be', 'Numbers'][i]}</span>
              {s === 'open' && <span className="pill">Next</span>}
            </button>
          ))}
          <dl className="stat-strip">
            {[['Units', '6'], ['Lessons', '30'], ['Progress', '7%']].map(([k, v]) => (
              <div key={k}>
                <dt className="eyebrow">{k}</dt>
                <dd>
                  <strong>{v}</strong>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section title="Home tiles">
        <div className="bento" style={{ maxWidth: '26rem' }}>
          <div className="tile tile-wide" data-tone="night">
            <span className="eyebrow">Continue · Unit 1</span>
            <span className="tile-title">Numbers and vowels</span>
          </div>
          <div className="tile" data-tone="lake">
            <span className="eyebrow">Review</span>
            <span className="tile-count">4</span>
            <span className="tile-foot">
              <button type="button" className="btn btn-on-tone">Review now</button>
            </span>
          </div>
          <div className="tile" data-tone="sun">
            <span className="eyebrow">Daily goal</span>
            <Ring value={75} label="15/20" style={{ '--ring-color': 'var(--tone-sun-fg)', '--ring-track': 'var(--tone-sun-soft)' }} />
          </div>
          <div className="tile tile-wide" data-tone="mint" style={{ minHeight: 0 }}>
            <span className="eyebrow">Grammar</span>
            <span className="tile-title">Hello</span>
          </div>
        </div>
      </Section>

      <Section title="Icons and avatars">
        <div className="g-row">
          {iconNames.map((n) => (
            <span key={n} className="g-icon" title={n}>
              <Icon name={n} />
              <small>{n}</small>
            </span>
          ))}
        </div>
        <div className="g-row" style={{ marginTop: 'var(--space-4)' }}>
          {avatars.map((a) => (
            <Avatar key={a.id} id={a.id} size={52} className="avatar" />
          ))}
        </div>
      </Section>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Gallery />
  </StrictMode>,
);
