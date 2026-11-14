import { useEffect, useState } from 'react';
import type { Unit } from './lib/types';
import { loadAllUnits } from './lib/content';
import { completeLesson, currentStreak, load, localDay, save } from './lib/progress';
import { loadSpeaker, type Speaker } from './lib/speech';
import { t } from './lib/strings';
import { Home } from './screens/Home';
import { Lesson } from './screens/Lesson';
import { Result } from './screens/Result';

type Screen =
  | { name: 'home' }
  | { name: 'lesson'; lessonId: string }
  | { name: 'result'; xpGained: number; mistakes: number };

export function App() {
  const [progress, setProgress] = useState(load);
  const [units, setUnits] = useState<Unit[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });

  const [speaker, setSpeaker] = useState<Speaker | null>(null);

  useEffect(() => {
    loadAllUnits().then(setUnits, (e) => setError(String(e)));
    loadSpeaker().then(setSpeaker);
  }, []);

  if (error) return <p role="alert">{error}</p>;
  if (!units) return <p className="loading">{t('loading', progress.lang)}</p>;

  const today = localDay(new Date());

  if (screen.name === 'lesson') {
    const lesson = units.flatMap((u) => u.lessons).find((l) => l.id === screen.lessonId)!;
    return (
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
    <Home units={units} progress={progress} today={today} onStart={(lessonId) => setScreen({ name: 'lesson', lessonId })} />
  );
}
