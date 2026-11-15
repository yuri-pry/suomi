import { Icon } from './design/Icon';
import { useEffect, useState } from 'react';
import type { Unit } from './lib/types';
import { loadAllUnits, loadPlacement } from './lib/content';
import { testableUnits, type PlacementItem } from './lib/placement';
import { completeLesson, currentStreak, load, localDay, save, type Progress } from './lib/progress';
import { loadSpeaker, type Speaker } from './lib/speech';
import { setHaptics } from './lib/haptics';
import { t } from './lib/strings';
import { SpeakerContext } from './exercises/Speakable';
import { Home } from './screens/Home';
import { Profile } from './screens/Profile';
import { Settings } from './screens/Settings';
import { Lesson } from './screens/Lesson';
import { Result } from './screens/Result';
import { Welcome } from './screens/Welcome';
import { Placement } from './screens/Placement';

const tabs = ['home', 'profile', 'settings'] as const;
type Tab = (typeof tabs)[number];

type Screen =
  | { name: 'home' }
  | { name: 'placement' }
  | { name: 'lesson'; lessonId: string }
  | { name: 'result'; xpGained: number; mistakes: number };

export function App() {
  const [progress, setProgress] = useState(load);
  const [units, setUnits] = useState<Unit[] | null>(null);
  const [bank, setBank] = useState<PlacementItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [tab, setTab] = useState<Tab>('home');

  const [speaker, setSpeaker] = useState<Speaker | null>(null);

  useEffect(() => {
    loadAllUnits().then(setUnits, (e) => setError(String(e)));
    loadSpeaker().then(setSpeaker);
  }, []);

  // Fetched only once the test is opened; an empty bank shows the loading line below.
  const testing = screen.name === 'placement';
  useEffect(() => {
    if (testing) loadPlacement().then(setBank, (e) => setError(String(e)));
  }, [testing]);

  // 'auto' leaves the attribute off, so the system colour scheme decides
  useEffect(() => {
    if (progress.theme === 'auto') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = progress.theme;
  }, [progress.theme]);

  if (error) return <p role="alert">{error}</p>;
  if (!units) return <p className="loading">{t('loading', progress.lang)}</p>;

  const today = localDay(new Date());

  setHaptics(progress.haptics);

  const update = (patch: Partial<Progress>) => {
    const next = { ...progress, ...patch };
    setProgress(next);
    save(next);
  };

  if (screen.name === 'placement') {
    if (bank.length === 0) return <p className="loading">{t('loading', progress.lang)}</p>;
    const tested = testableUnits(bank);
    return (
      <SpeakerContext value={speaker}>
        <Placement
          items={bank}
          units={units.filter((u) => tested.includes(u.id))}
          lang={progress.lang}
          onQuit={() => setScreen({ name: 'home' })}
          onDone={(unitId) => {
            update({ testedOutBefore: unitId });
            setTab('home');
            setScreen({ name: 'home' });
          }}
        />
      </SpeakerContext>
    );
  }

  // First launch only: a save with finished lessons has already chosen by playing.
  if (progress.testedOutBefore === null && Object.keys(progress.done).length === 0)
    return (
      <SpeakerContext value={speaker}>
        <Welcome
          lang={progress.lang}
          onBeginner={() => update({ testedOutBefore: units[0].id })}
          onTest={() => setScreen({ name: 'placement' })}
        />
      </SpeakerContext>
    );

  if (screen.name === 'lesson') {
    const lesson = units.flatMap((u) => u.lessons).find((l) => l.id === screen.lessonId)!;
    return (
      <SpeakerContext value={speaker}>
      <Lesson
        key={lesson.id}
        lesson={lesson}
        lang={progress.lang}
        speaker={speaker}
        onQuit={() => setScreen({ name: 'home' })}
        onDone={(total, wrongIds) => {
          const result = completeLesson(progress, lesson.id, total, wrongIds, localDay(new Date()));
          setProgress(result.progress);
          save(result.progress);
          setScreen({ name: 'result', xpGained: result.xpGained, mistakes: wrongIds.length });
        }}
      />
      </SpeakerContext>
    );
  }

  if (screen.name === 'result')
    return (
      <Result
        lang={progress.lang}
        xpGained={screen.xpGained}
        mistakes={screen.mistakes}
        streak={currentStreak(progress, today)}
        onHome={() => setScreen({ name: 'home' })}
      />
    );

  return (
    <div className="shell">
      {tab === 'home' && (
        <Home units={units} progress={progress} today={today} onStart={(lessonId) => setScreen({ name: 'lesson', lessonId })} />
      )}
      {tab === 'profile' && <Profile units={units} progress={progress} today={today} onChange={update} />}
      {tab === 'settings' && <Settings progress={progress} onChange={update} onPlacement={() => setScreen({ name: 'placement' })} />}
      <nav className="tabbar" aria-label={t('mainNav', progress.lang)}>
        {tabs.map((name) => (
          <button key={name} type="button" className="tab" aria-current={tab === name ? 'page' : undefined} onClick={() => setTab(name)}>
            <span className="tab-icon">
              <Icon name={name} />
            </span>
            {t(name, progress.lang)}
          </button>
        ))}
      </nav>
    </div>
  );
}
