import type { Lang } from './types';

const S = {
  appName: { en: 'Suomi', fi: 'Suomi' },
  xp: { en: 'XP', fi: 'XP' },
  streak: { en: 'day streak', fi: 'päivän putki' },
  tip: { en: 'Grammar tip', fi: 'Kielioppivinkki' },
  locked: { en: 'Locked', fi: 'Lukittu' },
  done: { en: 'Done', fi: 'Tehty' },
  start: { en: 'Start', fi: 'Aloita' },
  check: { en: 'Check', fi: 'Tarkista' },
  continue: { en: 'Continue', fi: 'Jatka' },
  quit: { en: 'Quit lesson', fi: 'Lopeta oppitunti' },
  correct: { en: 'Correct', fi: 'Oikein' },
  typo: { en: 'Correct, with a typo', fi: 'Oikein, pieni kirjoitusvirhe' },
  wrong: { en: 'Not quite', fi: 'Ei aivan' },
  answerIs: { en: 'Correct answer:', fi: 'Oikea vastaus:' },
  typeAnswer: { en: 'Type the missing word', fi: 'Kirjoita puuttuva sana' },
  chooseAnswer: { en: 'Choose the right answer', fi: 'Valitse oikea vastaus' },
  lessonDone: { en: 'Lesson complete', fi: 'Oppitunti valmis' },
  perfect: { en: 'No mistakes', fi: 'Ei virheitä' },
  mistakes: { en: 'Mistakes', fi: 'Virheitä' },
  earned: { en: 'earned', fi: 'ansaittu' },
  backHome: { en: 'Back to lessons', fi: 'Takaisin oppitunteihin' },
  loading: { en: 'Loading…', fi: 'Ladataan…' },
} as const;

export type StringKey = keyof typeof S;

export const t = (key: StringKey, lang: Lang) => S[key][lang];
