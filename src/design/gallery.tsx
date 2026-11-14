// Review page for the design system. Dev only: open /src/design/gallery.html under `npm run dev`.
import { StrictMode, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { Avatar, Icon, avatars, iconNames, type AvatarId, type IconName } from './Icon';
import './tokens.css';
import './motion.css';
import './components.css';

type Theme = 'auto' | 'light' | 'dark';

const colours: [string, string[]][] = [
  ['Surfaces', ['bg', 'surface', 'surface-2', 'line', 'line-strong']],
  ['Text', ['text', 'muted']],
  ['Brand', ['accent', 'accent-strong', 'accent-soft', 'accent-text']],
  ['Feedback', ['right', 'right-bg', 'wrong', 'wrong-bg', 'typo', 'typo-bg', 'danger', 'danger-strong', 'danger-text']],
  ['States', ['locked-fg', 'locked-bg', 'open-fg', 'open-bg', 'done-fg', 'done-bg']],
  ['Marks', ['streak', 'xp', 'goal']],
  ['Mastery scale', ['mastery-0', 'mastery-1', 'mastery-2', 'mastery-3', 'mastery-4']],
  ['Avatar tones', [1, 2, 3, 4].flatMap((n) => [`tone-${n}-bg`, `tone-${n}-fg`])],
];

// [text token, background token]: the pairs the components actually use
const pairs = [
  ['text', 'bg'], ['muted', 'bg'], ['text', 'surface'], ['muted', 'surface'], ['muted', 'surface-2'],
  ['accent', 'surface'], ['accent', 'accent-soft'], ['accent-text', 'accent'], ['right', 'right-bg'],
  ['wrong', 'wrong-bg'], ['typo', 'typo-bg'], ['danger-text', 'danger'], ['streak', 'surface'], ['xp', 'surface'],
];

const typeScale = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
const spaces = [1, 2, 3, 4, 5, 6, 7, 8];
const motionTokens = ['dur-fast', 'dur-press', 'dur-sheet', 'dur-collapse', 'dur-progress', 'dur-enter', 'dur-celebrate', 'stagger-step', 'ease-out', 'ease-in-out', 'ease-drawer'];
const tabs: [IconName, string][] = [['home', 'Home'], ['book', 'Rules'], ['profile', 'Profile'], ['settings', 'Settings']];

const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Ring({ percent, label, done, size }: { percent: number; label: ReactNode; done?: boolean; size?: string }) {
  return (
    <div className="ring" data-done={done} style={size ? ({ '--ring-size': size } as CSSProperties) : undefined}>
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <circle className="ring-track" cx="18" cy="18" r="15" pathLength="100" />
        <circle className="ring-value" cx="18" cy="18" r="15" pathLength="100" strokeDashoffset={100 - percent} />
      </svg>
      <span className="ring-label">{label}</span>
    </div>
  );
}

function Module({ title, meta, state, children }: { title: string; meta: string; state: 'open' | 'done' | 'locked'; children?: ReactNode }) {
  const [open, setOpen] = useState(state === 'open');
  const id = `module-${title}`;
  return (
    <section className="module" data-state={state}>
      <h3 className="module-heading">
        <button type="button" className="module-head" aria-expanded={open} aria-controls={id} disabled={state === 'locked'} onClick={() => setOpen(!open)}>
          <span className="state-badge" data-state={state}>
            <Icon name={state === 'done' ? 'check' : state === 'locked' ? 'lock' : 'path'} size={20} />
          </span>
          <span className="module-title">
            {title}
            <span className="module-meta">{meta}</span>
          </span>
          {state !== 'locked' && <Icon name="chevron-down" className="module-chevron" />}
        </button>
      </h3>
      <div className="collapse" id={id} data-open={open}>
        <div className="collapse-inner">
          <div className="module-body">{children}</div>
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  const [theme, setTheme] = useState<Theme>('auto');
  const [tab, setTab] = useState('Home');
  const [sound, setSound] = useState(true);
  const [haptics, setHaptics] = useState(false);
  const [goal, setGoal] = useState(20);
  const [avatar, setAvatar] = useState<AvatarId>('kuusi');
  const [sheet, setSheet] = useState(false);
  const [xp, setXp] = useState(12);
  const [replay, setReplay] = useState(0);
  // re-read the swatch values when the OS theme flips while the gallery is on "auto"
  const [, setOsFlips] = useState(0);
  useEffect(() => {
    const query = matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setOsFlips((n) => n + 1);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  function pickTheme(next: Theme) {
    // set before rendering, so the swatch values below are read in the new theme
    if (next === 'auto') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = next;
    setTheme(next);
  }

  return (
    <div className="g-page">
      <header className="g-top">
        <h1>Suomi design gallery</h1>
        <div className="segmented" role="radiogroup" aria-label="Theme">
          {(['auto', 'light', 'dark'] as const).map((t) => (
            <button key={t} type="button" role="radio" aria-checked={theme === t} onClick={() => pickTheme(t)}>
              {t === 'light' && <Icon name="sun" size={18} />}
              {t === 'dark' && <Icon name="moon" size={18} />}
              {t}
            </button>
          ))}
        </div>
      </header>

      <Section title="Colour">
        {colours.map(([group, names]) => (
          <div key={group}>
            <h3>{group}</h3>
            <div className="g-grid">
              {names.map((name) => (
                <div className="g-swatch" key={name}>
                  <i style={{ background: `var(--${name})` }} />
                  <span>
                    --{name}
                    <br />
                    <code>{token(name)}</code>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <h3>Text on background</h3>
        <div className="g-grid">
          {pairs.map(([fg, bg]) => (
            <div className="g-pair" key={fg + bg} style={{ color: `var(--${fg})`, background: `var(--${bg})` }}>
              {fg} on {bg}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type">
        {typeScale.map((size) => (
          <p key={size} style={{ margin: '0 0 0.25rem', fontSize: `var(--text-${size})`, lineHeight: 'var(--leading-snug)' }}>
            --text-{size} · Hyvää päivää, mitä kuuluu?
          </p>
        ))}
        <p className="display">Display: Oppitunti valmis</p>
        <p className="caption">Caption: 12 of 30 rules mastered</p>
      </Section>

      <Section title="Spacing, radii, elevation, motion">
        <h3>Spacing</h3>
        {spaces.map((n) => (
          <div className="g-row" key={n} style={{ marginBottom: 4 }}>
            <code style={{ width: '5.5rem' }}>--space-{n}</code>
            <div className="g-bar" style={{ width: `var(--space-${n})` }} />
          </div>
        ))}
        <h3>Radii</h3>
        <div className="g-row">
          {['sm', 'md', 'lg', 'full'].map((r) => (
            <div className="g-box" key={r} style={{ borderRadius: `var(--radius-${r})` }}>
              {r}
            </div>
          ))}
        </div>
        <h3>Elevation</h3>
        <div className="g-row" style={{ gap: '2rem', padding: '1rem 0' }}>
          {[1, 2, 3].map((n) => (
            <div className="g-box" key={n} style={{ borderRadius: 'var(--radius-md)', borderColor: 'transparent', boxShadow: `var(--shadow-${n})` }}>
              shadow-{n}
            </div>
          ))}
        </div>
        <h3>Motion tokens</h3>
        <ul className="list">
          {motionTokens.map((name) => (
            <li className="row" key={name}>
              <span className="row-label">--{name}</span>
              <span className="row-value">{token(name)}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={`Icons (${iconNames.length})`}>
        <div className="g-grid">
          {iconNames.map((name) => (
            <div className="g-icon" key={name}>
              <Icon name={name} />
              {name}
            </div>
          ))}
        </div>
        <h3>Sizes 16, 20, 24, 32, 48 and a labelled icon</h3>
        <div className="g-row">
          {[16, 20, 24, 32, 48].map((size) => (
            <Icon key={size} name="flame" size={size} className="tint-streak" />
          ))}
          <Icon name="star" title="Experience points" className="tint-xp" />
        </div>
      </Section>

      <Section title={`Avatars (${avatars.length})`}>
        <div className="g-grid">
          {avatars.map((a) => (
            <div className="g-icon" key={a.id}>
              <Avatar id={a.id} size={64} className="avatar" />
              {a.id} · {a.label}
            </div>
          ))}
        </div>
        <h3>Picker (.avatar-grid, .avatar-option)</h3>
        <div className="avatar-grid" role="radiogroup" aria-label="Avatar" style={{ maxWidth: '20rem' }}>
          {avatars.map((a) => (
            <button key={a.id} type="button" role="radio" className="avatar-option" aria-checked={avatar === a.id} aria-label={a.label} onClick={() => setAvatar(a.id)}>
              <Avatar id={a.id} size={52} className="avatar" />
            </button>
          ))}
        </div>
      </Section>

      <Section title="Buttons">
        <div className="g-row">
          <button type="button" className="btn btn-primary">Primary</button>
          <button type="button" className="btn btn-secondary">Secondary</button>
          <button type="button" className="btn btn-ghost">Ghost</button>
          <button type="button" className="btn btn-danger">Danger</button>
        </div>
        <h3>Disabled</h3>
        <div className="g-row">
          <button type="button" className="btn btn-primary" disabled>Primary</button>
          <button type="button" className="btn btn-secondary" disabled>Secondary</button>
          <button type="button" className="btn btn-ghost" disabled>Ghost</button>
          <button type="button" className="btn btn-danger" disabled>Danger</button>
        </div>
        <h3>With icon, block, icon button</h3>
        <div className="g-stack">
          <button type="button" className="btn btn-primary btn-block">Check</button>
          <button type="button" className="btn btn-secondary btn-block">
            <Icon name="refresh" size={20} /> Practice mistakes
          </button>
          <div className="g-row">
            <button type="button" className="icon-btn" aria-label="Back"><Icon name="back" /></button>
            <button type="button" className="icon-btn" aria-label="Close"><Icon name="close" /></button>
            <button type="button" className="icon-btn" aria-label="Menu"><Icon name="menu" /></button>
          </div>
        </div>
      </Section>

      <Section title="Tappable word">
        <p style={{ fontSize: 'var(--text-2xl)', lineHeight: 'var(--leading-snug)', margin: 0 }} lang="fi">
          <button type="button" className="word">Minä</button> <button type="button" className="word">pidän</button>{' '}
          <button type="button" className="word" aria-pressed="true">kahvista</button> <button type="button" className="word">ja</button>{' '}
          <button type="button" className="word">teestä</button>.
        </p>
        <p className="caption">Third word shown pressed. Underline is the affordance; the touch target is 44 px.</p>
        <div className="g-row" lang="fi">
          <button type="button" className="word-chip"><Icon name="speaker" size={18} /> kahvi</button>
          <button type="button" className="word-chip" aria-pressed="true"><Icon name="speaker" size={18} /> järvi</button>
          <button type="button" className="word-chip"><Icon name="speaker" size={18} /> hyvää yötä</button>
        </div>
      </Section>

      <Section title="Controls">
        <div className="g-stack">
          <ul className="list">
            <li className="row">
              <Icon name="volume" className="row-icon" />
              <span className="row-label">Sound<span className="row-hint">Speak Finnish words aloud</span></span>
              <button type="button" role="switch" className="switch" aria-checked={sound} aria-label="Sound" onClick={() => setSound(!sound)} />
            </li>
            <li className="row">
              <Icon name="vibrate" className="row-icon" />
              <span className="row-label">Vibration</span>
              <button type="button" role="switch" className="switch" aria-checked={haptics} aria-label="Vibration" onClick={() => setHaptics(!haptics)} />
            </li>
            <li className="row">
              <Icon name="lock" className="row-icon" />
              <span className="row-label">Disabled switch</span>
              <button type="button" role="switch" className="switch" aria-checked="true" aria-label="Disabled" disabled />
            </li>
            <li>
              <button type="button" className="row row-action">
                <Icon name="download" className="row-icon" />
                <span className="row-label">Export progress</span>
                <Icon name="chevron-right" className="row-icon" />
              </button>
            </li>
            <li>
              <button type="button" className="row row-action">
                <Icon name="globe" className="row-icon" />
                <span className="row-label">Language</span>
                <span className="row-value">English</span>
              </button>
            </li>
          </ul>
          <div className="segmented" role="radiogroup" aria-label="Daily goal">
            {[10, 20, 30].map((g) => (
              <button key={g} type="button" role="radio" aria-checked={goal === g} onClick={() => setGoal(g)}>
                {g} XP
              </button>
            ))}
          </div>
          <input className="input" type="search" placeholder="Search rules" aria-label="Search rules" enterKeyHint="search" />
        </div>
      </Section>

      <Section title="Cards, stats, progress">
        <div className="g-stack">
          <div className="card">Card: plain surface with a hairline.</div>
          <div className="card card-raised">Card raised: shadow-2 instead of the border.</div>
          <div className="stat-grid">
            <div className="stat-tile">
              <span className="stat-tile-value"><Icon name="flame" className="tint-streak" /> 7</span>
              <span className="stat-tile-label">Day streak</span>
            </div>
            <div className="stat-tile">
              <span className="stat-tile-value"><Icon name="star" className="tint-xp" /> 340</span>
              <span className="stat-tile-label">Total XP</span>
            </div>
            <div className="stat-tile">
              <span className="stat-tile-value"><Icon name="trophy" className="tint-goal" /> 2.4</span>
              <span className="stat-tile-label">Level of 5</span>
            </div>
            <div className="stat-tile">
              <span className="stat-tile-value">12/30</span>
              <span className="stat-tile-label">Rules mastered</span>
            </div>
          </div>
          <div className="g-row">
            <Ring percent={0} label="0/20" />
            <Ring percent={(xp / 20) * 100} label={`${xp}/20`} />
            <Ring percent={100} done label={<Icon name="check" size={20} title="Daily goal reached" />} />
            <button type="button" className="btn btn-ghost" onClick={() => setXp(xp >= 20 ? 0 : xp + 4)}>+4 XP</button>
          </div>
          <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={(xp / 20) * 100} aria-label="Lesson progress">
            <div className="progress-fill" style={{ transform: `scaleX(${xp / 20})` }} />
          </div>
          <div>
            <h3>Mastery levels 0 to 4</h3>
            {[0, 1, 2, 3, 4].map((level) => (
              <div className="g-row" key={level} style={{ marginBottom: 8 }}>
                <div className="progress progress-thin" style={{ flex: 1 }}>
                  <div className="progress-fill" data-level={level} style={{ transform: `scaleX(${[0, 0.3, 0.5, 0.7, 0.9][level]})` }} />
                </div>
                <span className="row-value">{[0, 30, 50, 70, 90][level]}%</span>
              </div>
            ))}
          </div>
          <div className="g-row">
            <span className="state-badge" data-state="locked"><Icon name="lock" size={20} /></span>
            <span className="state-badge" data-state="open">3</span>
            <span className="state-badge" data-state="done"><Icon name="check" size={20} /></span>
            <span className="caption">locked · open · done</span>
          </div>
        </div>
      </Section>

      <Section title="Screen: app bar, modules, tab bar, sheet">
        <div className="g-phone">
          <div className="g-phone-scroll">
            <div className="app">
              <header className="appbar">
                <h1 className="appbar-title">Suomi</h1>
                <span className="appbar-stat tint-streak"><Icon name="flame" size={20} /> 7</span>
                <span className="appbar-stat tint-xp"><Icon name="star" size={20} /> 340</span>
                <Ring percent={60} label="12" size="2.5rem" />
              </header>
              <main className="screen has-tabbar screen-enter" key={tab}>
                {tab !== 'Home' && <p className="caption">{tab} tab (.screen-enter fades in)</p>}
                <div className="g-lessons stagger" key={replay}>
                  <Module title="1. Tervetuloa" meta="4 of 4 lessons" state="done">
                    <p className="caption" style={{ margin: 0 }}>Finished unit, closed by default.</p>
                  </Module>
                  <Module title="2. Minä ja sinä" meta="1 of 4 lessons" state="open">
                    <ul className="list">
                      <li className="row">
                        <span className="state-badge" data-state="done"><Icon name="check" size={20} /></span>
                        <span className="row-label">Personal pronouns</span>
                      </li>
                      <li>
                        <button type="button" className="row row-action">
                          <span className="state-badge">2</span>
                          <span className="row-label">olla: to be</span>
                          <Icon name="chevron-right" className="row-icon" />
                        </button>
                      </li>
                      <li className="row">
                        <span className="state-badge" data-state="locked"><Icon name="lock" size={20} /></span>
                        <span className="row-label caption">Questions with -ko</span>
                      </li>
                    </ul>
                  </Module>
                  <Module title="3. Kahvilassa" meta="Pass unit 2 to open" state="locked" />
                  <button type="button" className="btn btn-secondary btn-block" onClick={() => setSheet(true)}>Open bottom sheet</button>
                  <button type="button" className="btn btn-ghost btn-block" onClick={() => setReplay(replay + 1)}>Replay list stagger</button>
                </div>
              </main>
            </div>
          </div>
          <nav className="tabbar" aria-label="Main">
            {tabs.map(([icon, label]) => (
              <button key={label} type="button" className="tab" aria-current={tab === label ? 'page' : undefined} onClick={() => setTab(label)}>
                <span className="tab-icon"><Icon name={icon} /></span>
                {label}
              </button>
            ))}
          </nav>
          <div className="scrim" data-open={sheet} onClick={() => setSheet(false)} />
          <div className="sheet" role="dialog" aria-modal="true" aria-label="Daily goal" data-open={sheet}>
            <h2 className="sheet-title">Daily goal</h2>
            <p className="caption">Slides up in 200 ms; cross-fades under reduced motion.</p>
            <button type="button" className="btn btn-primary btn-block" onClick={() => setSheet(false)}>Done</button>
          </div>
        </div>
      </Section>

      <Section title="Celebration (result screen only)">
        <div className="g-row" style={{ padding: '4rem 2rem 1rem' }}>
          <div className="celebrate" key={replay}>
            <span className="celebrate-burst" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></span>
            <Icon name="star" size={72} className="celebrate-mark" />
          </div>
          <button type="button" className="btn btn-ghost" onClick={() => setReplay(replay + 1)}>Replay</button>
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
