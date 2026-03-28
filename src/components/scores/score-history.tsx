'use client';

import { TrendingUp, TrendingDown, Minus, Trash2 } from 'lucide-react';
import { Score } from '@/types';
import { formatDate, cn } from '@/lib/utils';

interface ScoreHistoryProps {
  scores: Score[];
  onDelete?: (id: string) => void;
}

export function ScoreHistory({ scores, onDelete }: ScoreHistoryProps) {
  if (scores.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-8 shadow-ambient text-center">
        <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-7 h-7 text-on-surface-variant/40" />
        </div>
        <h3 className="text-headline-sm text-on-surface mb-2">No Scores Yet</h3>
        <p className="text-body-sm text-on-surface-variant">
          Record your first round to start tracking your performance.
        </p>
      </div>
    );
  }

  const average =
    scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b.score, 0) / scores.length) * 10) / 10
      : 0;

  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 shadow-ambient">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-headline-md text-on-surface">Rolling History</h2>
          <p className="text-label-md text-label uppercase mt-1">
            Stableford System
          </p>
        </div>
        <div className="text-right">
          <p className="text-label-sm text-label uppercase">Average</p>
          <p className="text-display-sm text-on-surface">{average}</p>
        </div>
      </div>

      <div className="space-y-0">
        {scores.map((score, index) => {
          const prev = scores[index + 1];
          const trend = prev
            ? score.score > prev.score
              ? 'up'
              : score.score < prev.score
              ? 'down'
              : 'stable'
            : 'stable';

          return (
            <div
              key={score.id}
              className={cn(
                'flex items-center justify-between py-4 group',
                'hover:bg-surface-container-low/50 -mx-4 px-4 rounded-md transition-colors'
              )}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-md bg-surface-container-low flex items-center justify-center">
                  <span className="text-headline-sm text-on-surface font-semibold">
                    {score.score}
                  </span>
                </div>
                <div>
                  <p className="text-body-md text-on-surface">{formatDate(score.played_date)}</p>
                  <p className="text-label-sm text-on-surface-variant">
                    Round {scores.length - index} of {scores.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {trend === 'up' && (
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-label-sm">+{score.score - (prev?.score || 0)}</span>
                  </div>
                )}
                {trend === 'down' && (
                  <div className="flex items-center gap-1 text-red-500">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-label-sm">{score.score - (prev?.score || 0)}</span>
                  </div>
                )}
                {trend === 'stable' && (
                  <Minus className="w-4 h-4 text-on-surface-variant/40" />
                )}

                {onDelete && (
                  <button
                    onClick={() => onDelete(score.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-error-container/20 text-on-surface-variant hover:text-error transition-all"
                    aria-label="Delete score"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-outline-variant/10">
        <p className="text-body-sm text-on-surface-variant">
          Your ranking is calculated based on your {scores.length} most recent round{scores.length !== 1 ? 's' : ''}.
          {scores.length >= 5 && ' Entering a new score will automatically phase out your oldest entry.'}
        </p>
      </div>
    </div>
  );
}
