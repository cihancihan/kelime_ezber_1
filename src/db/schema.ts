import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const words = sqliteTable('words', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  word: text('word').notNull(),
  translation: text('translation').notNull(),
  partOfSpeech: text('part_of_speech').notNull(),
  synonyms: text('synonyms', { mode: 'json' }).$type<string[]>(),
  example: text('example'),
  distractors: text('distractors', { mode: 'json' }).$type<string[]>(),
  level: text('level'),
  nextReview: integer('next_review').notNull(),
  interval: integer('interval').notNull().default(0),
  easeFactor: integer('ease_factor').notNull().default(2500), // stored as int * 1000
  repetitions: integer('repetitions').notNull().default(0),
  streak: integer('streak').notNull().default(0),
  createdAt: integer('created_at').notNull().$defaultFn(() => Date.now())
});
