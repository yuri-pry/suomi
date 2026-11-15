import { Icon } from './design/Icon';
import { useEffect, useState } from 'react';
import type { Unit } from './lib/types';
import { loadAllUnits, loadPlacement } from './lib/content';
import { testableUnits, type PlacementItem } from './lib/placement';
import { addMistakes, completeReview, dueExercises } from './lib/review';
import { playable } from './lib/lesson';
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
import { Path } from './screens/Path';
import { Explain } from './screens/Explain';
import { nextLesson } from './lib/course';
import { correctText } from './lib/exercise';
import type { Lang } from './lib/types';
import { Placement } from './screens/Placement';

const tabs = ['home', 'path', 'profile'] as const;
type Tab = (typeof tabs)[number];

type Screen =
  | { name: 'home' }
  | { name: 'placement' }
  | { name: 'lesson'; lessonId: string }
  | { name: 'review' }
  | { name: 'settings' }
  /** The unit's grammar tip; with lessonId it leads into that lesson. */
  | { name: 'tip'; unitId: string; lessonId?: string }
  | { name: 'result'; xpGained: number; mistakes: number; missed: { text: string; lang: Lang }[]; lessonTitle?: string };

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

  /** The first lesson of a unit opens with the unit's tip, until that lesson is done. */
  const start = (lessonId: string) => {
    const unit = units.find((u) => u.lessons.some((l) => l.id === lessonId))!;
    if (unit.lessons[0].id === lessonId && !(lessonId in progress.done)) setScreen({ name: 'tip', unitId: unit.id, lessonId });
    else setScreen({ name: 'lesson', lessonId });
  };

  // The right answers of missed items, for the result screen. A match has no short answer.
  const missedOf = (exercises: { id: string }[], wrongIds: string[]) =>
    units
      .flatMap((u) => u.lessons.flatMap((l) => l.exercises))
      .filter((e) => wrongIds.includes(e.id) && e.type !== 'match' && e.type !== 'truefalse' && exercises.some((x) => x.id === e.id))
      .map((e) => ({ text: correctText(e), lang: e.type === 'match' ? ('fi' as Lang) : e.answerLang }));

  if (screen.name === 'tip') {
    const unit = units.find((u) => u.id === screen.unitId)!;
    const back = () => setScreen({ name: 'home' });
    return (
      <SpeakerContext value={speaker}>
        <Explain
          unit={unit}
          unitNumber={units.indexOf(unit) + 1}
          lang={progress.lang}
          startsLesson={screen.lessonId !== undefined}
          onBack={back}
          onDone={() => (screen.lessonId ? setScreen({ name: 'lesson', lessonId: screen.lessonId }) : back())}
        />
      </SpeakerContext>
    );
  }

  if (screen.name === 'settings')
    return (
      <Settings
        progress={progress}
        onChange={update}
        onBack={() => setScreen({ name: 'home' })}
        onPlacement={() => setScreen({ name: 'placement' })}
      />
    );

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
          const next = { ...result.progress, review: addMistakes(result.progress.review, wrongIds, day) };
          setProgress(next);
          save(next);
          setScreen({
            name: 'result',
            xpGained: result.xpGained,
            mistakes: wrongIds.length,
            missed: missedOf(lesson.exercises, wrongIds),
            lessonTitle: lesson.title,
          });
        }}
      />
      </SpeakerContext>
    );
  }

  // Listening items wait in the deck on a device with no Finnish voice.
  const due = playable(dueExercises(units, progress.review, today), speaker !== null);

  if (screen.name === 'review' && due.length > 0)
    return (
      <SpeakerContext value={speaker}>
        <Lesson
          key="review"
          lesson={{ id: 'review', title: t('review', progress.lang), exercises: due }}
          lang={progress.lang}
          speaker={speaker}
          onQuit={() => setScreen({ name: 'home' })}
          onDone={(_total, wrongIds) => {
            const next = completeReview(progress, due.map((e) => e.id), wrongIds, localDay(new Date()));
            setProgress(next);
            save(next);
            setScreen({ name: 'result', xpGained: next.xp - progress.xp, mistakes: wrongIds.length, missed: missedOf(due, wrongIds) });
          }}
        />
      </SpeakerContext>
    );

  if (screen.name === 'result') {
    const upNext = screen.lessonTitle ? nextLesson(units, progress) : null;
    return (
      <Result
        lang={progress.lang}
        title={screen.lessonTitle ? 'lessonDone' : 'reviewDone'}
        lessonTitle={screen.lessonTitle}
        xpGained={screen.xpGained}
        mistakes={screen.mistakes}
        missed={screen.missed}
        streak={currentStreak(progress, today)}
        next={upNext?.lesson.title}
        onNext={upNext ? () => start(upNext.lesson.id) : undefined}
        onHome={() => setScreen({ name: 'home' })}
      />
    );
  }

  return (
    <div className="shell">
      {tab === 'home' && (
        <Home
          units={units}
          progress={progress}
          today={today}
          reviewDue={due.length}
          onStart={start}
          onReview={() => setScreen({ name: 'review' })}
          onPath={() => setTab('path')}
          onTip={(unitId) => setScreen({ name: 'tip', unitId })}
        />
      )}
      {tab === 'path' && <Path units={units} progress={progress} onStart={start} onTip={(unitId) => setScreen({ name: 'tip', unitId })} />}
      {tab === 'profile' && (
        <Profile units={units} progress={progress} today={today} onChange={update} onSettings={() => setScreen({ name: 'settings' })} />
      )}
      <nav className="tabbar" aria-label={t('mainNav', progress.lang)}>
        {tabs.map((name) => (
          <button key={name} type="button" className="tab" aria-current={tab === name ? 'page' : undefined} onClick={() => setTab(name)}>
            <Icon name={name} size={22} />
            {t(name, progress.lang)}
          </button>
        ))}
      </nav>
    </div>
  );
}
