export type Lang = 'fi' | 'en';

/** The form a `fill` answer teaches. `case` uses Voikko's Finnish case names (osanto, omanto, ...). */
export type Form = { base: string; case?: string; person?: string; number?: string; mood?: string; tense?: string };

type Base = {
  id: string;
  /** Rule ids from content/rules.json. Vocabulary exercises have none. */
  tags?: string[];
  prompt: string;
  promptLang: Lang;
  answerLang: Lang;
};

export type Choice = Base & {
  type: 'choice';
  options: string[];
  answer: number;
  /** Indices of options that are deliberately not real Finnish words. */
  invalid?: number[];
};

export type Fill = Base & {
  type: 'fill';
  /** The prompt contains ___ where the answer goes. */
  answers: string[];
  hint?: string;
  form?: Form;
};

export type Exercise = Choice | Fill;

export type Lesson = { id: string; title: string; exercises: Exercise[] };

export type Unit = {
  id: string;
  section: number;
  title: string;
  tip: { en: string; fi?: string };
  lessons: Lesson[];
};

export type Rule = {
  id: string;
  type: 'rektio' | 'case' | 'verbtype' | 'gradation' | 'phonology' | 'object' | 'tense' | 'mood' | 'construction' | 'clitic';
  unit: string;
  title: string;
  /** rektio only: the governing word and the Voikko case name it demands. */
  verb?: string;
  requires?: string;
  /** `word` marks the governed word, checked against `requires`. */
  examples: { fi: string; en: string; word?: string }[];
};
