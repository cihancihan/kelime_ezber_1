export interface Word {
  id: number;
  word: string;
  translation: string;
  partOfSpeech: string;
  synonyms: string[];
  example: string;
  distractors: string[];
  level: string | null;
  nextReview: number;
  interval: number;
  easeFactor: number;
  repetitions: number;
  streak: number;
  createdAt: number;
}

export interface Stats {
  totalWords: number;
  dueReviews: number;
  totalLearned: number;
  levels: Record<string, number>;
}
