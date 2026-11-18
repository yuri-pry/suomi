import { Icon } from './design/Icon';
import { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as NativeApp } from '@capacitor/app';
import type { Exercise, Rule, Unit } from './lib/types';
import { loadAllUnits, loadPlacement } from './lib/content';
import { testableUnits, type PlacementItem } from './lib/placement';
import { addMistakes, finishReview, reviewSession } from './lib/review';
import { level, scoreAnswers } from './lib/mastery';
import rulesJson from '../content/rules.json';
import { drawCheckpoint, playable } from './lib/lesson';
import { completeCheckpoint, completeLesson, currentStreak, load, localDay, save, type Progress } from './lib/progress';
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

const rules = rulesJson as Rule[];

const tabs = ['home', 'profile', 'settings'] as const;
type Tab = (typeof tabs)[number];

type Screen =
  | { name: 'home' }
  | { name: 'placement' }
  | { name: 'lesson'; lessonId: string }
  | { name: 'checkpoint'; unitId: string; exercises: Exercise[] }
  | { name: 'review' }
  | { name: 'result'; xpGained: number; mistakes: number; review?: true; checkpoint?: { score: number; total: number; passed: boolean } };

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

  // The phone's back button, wired here for every screen. The lesson's own quit sheet and its
  // X button are driven through the DOM so the "quit now or ask first" rule stays in Lesson.
  const back = useRef(() => {});
  back.current = () => {
    if (screen.name === 'lesson' || screen.name === 'checkpoint' || screen.name === 'review') {
      const sheet = document.querySelector<HTMLDialogElement>('dialog.confirm[open]');
      if (sheet) sheet.close();
      else document.querySelector<HTMLElement>('[data-quit]')?.click();
    } else if (screen.name !== 'home' || tab !== 'home') {
      setScreen({ name: 'home' });
      setTab('home');
    } else void NativeApp.minimizeApp();
  };
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const listener = NativeApp.addListener('backButton', () => back.current());
    return () => void listener.then((l) => l.remove());
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
          const day = localDay(new Date());
          const result = completeLesson(progress, lesson.id, total, wrongIds, day);
          const played = playable(lesson.exercises, speaker !== null);
          const next = scoreAnswers({ ...result.progress, review: addMistakes(result.progress.review, wrongIds, day) }, rules, played, wrongIds, units);
          setProgress(next);
          save(next);
          setScreen({ name: 'result', xpGained: result.xpGained, mistakes: wrongIds.length });
        }}
      />
      </SpeakerContext>
    );
  }

  if (screen.name === 'checkpoint') {
    const { unitId, exercises } = screen;
    return (
      <SpeakerContext value={speaker}>
        <Lesson
          key={`${unitId}-cp`}
          lesson={{ id: `${unitId}-cp`, title: t('checkpoint', progress.lang), exercises }}
          lang={progress.lang}
          speaker={speaker}
          onQuit={() => setScreen({ name: 'home' })}
          onDone={(total, wrongIds) => {
            const day = localDay(new Date());
            const result = completeCheckpoint(progress, unitId, total, wrongIds, day);
            const next = scoreAnswers({ ...result.progress, review: addMistakes(result.progress.review, wrongIds, day) }, rules, exercises, wrongIds, units);
            setProgress(next);
            save(next);
            setScreen({ name: 'result', xpGained: result.xpGained, mistakes: wrongIds.length, checkpoint: { score: result.score, total, passed: result.passed } });
          }}
        />
      </SpeakerContext>
    );
  }

  const { due, weak, session } = reviewSession(units, rules, progress, today, speaker !== null);

  if (screen.name === 'review' && session.length > 0)
    return (
      <SpeakerContext value={speaker}>
        <Lesson
          key="review"
          lesson={{ id: 'review', title: t('review', progress.lang), exercises: session }}
          lang={progress.lang}
          speaker={speaker}
          onQuit={() => setScreen({ name: 'home' })}
          onDone={(_total, wrongIds) => {
            const next = finishReview(progress, { due, weak, session }, wrongIds, units, rules, localDay(new Date()));
            setProgress(next);
            save(next);
            setScreen({ name: 'result', xpGained: next.xp - progress.xp, mistakes: wrongIds.length, review: true });
          }}
        />
      </SpeakerContext>
    );

  if (screen.name === 'result')
    return (
      <Result
        lang={progress.lang}
        title={screen.review ? 'reviewDone' : screen.checkpoint ? (screen.checkpoint.passed ? 'checkpointPassed' : 'checkpointFailed') : 'lessonDone'}
        xpGained={screen.xpGained}
        mistakes={screen.mistakes}
        checkpoint={screen.checkpoint}
        streak={currentStreak(progress, today)}
        onHome={() => setScreen({ name: 'home' })}
      />
    );

  return (
    <div className="shell">
      {tab === 'home' && (
        <Home
          units={units}
          progress={progress}
          today={today}
          reviewDue={due.length}
          practice={weak.length}
          level={level(progress, rules, units)}
          onStart={(lessonId) => setScreen({ name: 'lesson', lessonId })}
          onCheckpoint={(unit) => setScreen({ name: 'checkpoint', unitId: unit.id, exercises: drawCheckpoint(unit, speaker !== null) })}
          onReview={() => setScreen({ name: 'review' })}
        />
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
