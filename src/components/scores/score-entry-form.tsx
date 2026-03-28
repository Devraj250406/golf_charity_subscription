'use client';

import { useState } from 'react';
import { CalendarDays, Plus, Loader2, AlertCircle } from 'lucide-react';
import { SCORE_RANGE } from '@/lib/constants';
import type { Score } from '@/types';
import { formatDate } from '@/lib/utils';

interface ScoreEntryFormProps {
  onSubmit: (score: number, date: string) => Promise<void>;
  currentCount: number;
  oldestScore?: Score;
}

export function ScoreEntryForm({ onSubmit, currentCount, oldestScore }: ScoreEntryFormProps) {
  const [score, setScore] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const scoreNum = parseInt(score);
    if (isNaN(scoreNum) || scoreNum < SCORE_RANGE.min || scoreNum > SCORE_RANGE.max) {
      setError(`Score must be between ${SCORE_RANGE.min} and ${SCORE_RANGE.max}`);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(scoreNum, date);
      setScore('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Failed to save score. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 shadow-ambient">
      <div className="mb-6">
        <h2 className="text-headline-md text-on-surface mb-1">Record Your Round</h2>
        <p className="text-body-sm text-on-surface-variant">
          Input your Stableford score to update your rolling performance average.
        </p>
      </div>

      {/* Rolling info banner */}
      {currentCount >= 5 && (
        <div className="mb-6 p-4 rounded-md bg-primary-container/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-body-sm text-on-surface-variant font-medium">
              You have 5 scores recorded.
            </p>
            <p className="text-body-sm text-on-surface-variant">
              Adding a new score will automatically replace your oldest entry.
            </p>
            {oldestScore && (
              <p className="text-label-sm text-primary font-medium mt-1">
                Will replace: Score {oldestScore.score} from {formatDate(oldestScore.played_date)}
              </p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-md bg-error-container/20 text-error text-body-sm animate-fade-in">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-md bg-green-50 text-green-700 text-body-sm animate-fade-in">
            Score recorded successfully!
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label htmlFor="score-value" className="text-label-md text-label uppercase block">
              Stableford Score
            </label>
            <input
              id="score-value"
              type="number"
              min={SCORE_RANGE.min}
              max={SCORE_RANGE.max}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-md bg-surface ghost-border text-body-md text-on-surface placeholder:text-on-surface-variant/40"
              placeholder={`${SCORE_RANGE.min} – ${SCORE_RANGE.max}`}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="score-date" className="text-label-md text-label uppercase block">
              Date Played
            </label>
            <div className="relative">
              <input
                id="score-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 rounded-md bg-surface ghost-border text-body-md text-on-surface"
              />
              <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant pointer-events-none" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary-gradient px-6 py-3 rounded-md text-body-md font-medium flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none transition-all"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Submit Score
            </>
          )}
        </button>
      </form>
    </div>
  );
}
