'use client';

import { useState, useEffect, useCallback } from 'react';
import { ScoreEntryForm } from '@/components/scores/score-entry-form';
import { ScoreHistory } from '@/components/scores/score-history';
import { createClient } from '@/lib/supabase/client';
import type { Score } from '@/types';

export default function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchScores = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .order('played_date', { ascending: false });

    setScores(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  const handleAddScore = async (score: number, date: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.from('scores').insert({
      user_id: user.id,
      score,
      played_date: date,
    });

    if (error) throw new Error(error.message);
    await fetchScores();
  };

  const handleDeleteScore = async (id: string) => {
    const { error } = await supabase.from('scores').delete().eq('id', id);
    if (error) throw new Error(error.message);
    await fetchScores();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-display-sm text-on-surface mb-2">Score Management</h1>
        <p className="text-body-md text-on-surface-variant">
          Track your Stableford scores. Your rolling 5-score average determines your draw entries.
        </p>
      </div>

      <div className="space-y-8">
        <ScoreEntryForm onSubmit={handleAddScore} currentCount={scores.length} oldestScore={scores.length >= 5 ? scores[scores.length - 1] : undefined} />
        <ScoreHistory scores={scores} onDelete={handleDeleteScore} />
      </div>
    </div>
  );
}
