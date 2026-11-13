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

/** The Finnish `prompt` is spoken, not shown, until the answer is checked. */
export type Listen = Base & {
  type: 'listen';
  promptLang: 'fi';
  options: string[];
  answer: number;
  invalid?: number[];
};

export type Exercise = Choice | Fill | Listen;

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
  type:
    | 'rektio'
    | 'case'
    | 'verbtype'
    | 'wordtype'
    | 'gradation'
    | 'phonology'
    | 'object'
    | 'tense'
    | 'mood'
    | 'sentence'
    | 'construction'
    | 'clitic';
  unit: string;
  title: string;
  /**
   * rektio only: the governing word (verb, adjective or noun) and what it demands.
   * `requires` is a Voikko case name (sisaeronto, osanto, ...). `requiresMood` is a
   * Voikko infinitive (A-infinitive, MA-infinitive). "mennä uimaan" needs both:
   * MA-infinitive in sisatulento.
   */
  verb?: string;
  requires?: string;
  requiresMood?: string;
  /** Further reading for the Rules screen. */
  ref?: string;
  /** `word` marks the governed word, checked against `requires`. */
  examples: { fi: string; en: string; word?: string }[];
};
