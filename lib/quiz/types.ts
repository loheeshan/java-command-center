export type Difficulty = "easy" | "medium" | "hard";

interface QuestionBase {
  id: string;
  prompt: string;
  lessonId: string;
  concept: string;
  difficulty: Difficulty;
  /** Shown after answering (correct or not). */
  explanation: string;
  /** The underlying misconception, shown after a wrong answer. */
  misconception?: string;
  hint?: string;
  /** Eligible for the spaced-review queue. Default true. */
  review?: boolean;
  /** Optional Java code shown with the prompt. */
  code?: string;
}

export interface McqQuestion extends QuestionBase {
  type: "mcq" | "concept";
  options: string[];
  answer: number;
}

export interface MultiQuestion extends QuestionBase {
  type: "multi";
  options: string[];
  answers: number[];
}

export interface PredictQuestion extends QuestionBase {
  type: "predict";
  code: string;
  /** Exact expected console output. Comparison ignores trailing whitespace and line-ending style. */
  output: string;
  /** If true, the learner can verify by running the code on the real JDK. */
  runnable?: boolean;
}

export interface FindErrorQuestion extends QuestionBase {
  type: "find-error";
  code: string;
  /** 1-based line number containing the error. */
  line: number;
}

export interface CompletionQuestion extends QuestionBase {
  type: "completion";
  /** Code containing exactly one "____" blank. */
  code: string;
  /** Accepted answers; compared after whitespace normalisation. Only for short, unambiguous tokens. */
  accept: string[];
}

export interface OrderQuestion extends QuestionBase {
  type: "order";
  /** Items in the CORRECT order; the UI shuffles them. */
  items: string[];
}

export type Question = McqQuestion | MultiQuestion | PredictQuestion | FindErrorQuestion | CompletionQuestion | OrderQuestion;

export type Answer =
  | { type: "mcq"; choice: number }
  | { type: "multi"; choices: number[] }
  | { type: "predict"; text: string }
  | { type: "find-error"; line: number }
  | { type: "completion"; text: string }
  | { type: "order"; items: string[] };
