import { useEffect, useState } from 'react';
import type { Unit } from './lib/types';
import { loadUnit } from './lib/content';
import { completeLesson, currentStreak, load, localDay, save } from './lib/progress';
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
  const [unit, setUnit] = useState<Unit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });

  useEffect(() => {
    loadUnit('u01').then(setUnit, (e) => setError(String(e)));
  }, []);

  if (error) return <p role="alert">{error}</p>;
  if (!unit) return <p className="loading">{t('loading', progress.lang)}</p>;

  const today = localDay(new Date());

  if (screen.name === 'lesson') {
    const lesson = unit.lessons.find((l) => l.id === screen.lessonId)!;
    return (
      <Lesson
        key={lesson.id}
        lesson={lesson}
        lang={progress.lang}
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
    <Home unit={unit} progress={progress} today={today} onStart={(lessonId) => setScreen({ name: 'lesson', lessonId })} />
  );
}
