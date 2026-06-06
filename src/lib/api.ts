import { Word, Stats } from '../types';

export async function addWord(word: string): Promise<Word> {
  const res = await fetch('/api/words', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getDueReviews(): Promise<Word[]> {
  const res = await fetch('/api/reviews');
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function submitReview(id: number, isCorrect: boolean): Promise<Word> {
  const res = await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, isCorrect })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getStats(): Promise<Stats> {
  const res = await fetch('/api/stats');
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
