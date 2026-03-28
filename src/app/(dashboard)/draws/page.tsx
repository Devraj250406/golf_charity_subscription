import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Trophy, Calendar, DollarSign } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Draws' };

export default async function DrawsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [drawsRes, entriesRes] = await Promise.all([
    supabase.from('draws').select('*').eq('status', 'published').order('draw_date', { ascending: false }).limit(12),
    supabase.from('draw_entries').select('*, draws(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
  ]);

  const draws = drawsRes.data || [];
  const entries = entriesRes.data || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-display-sm text-on-surface mb-2">Prize Draws</h1>
        <p className="text-body-md text-on-surface-variant">
          View past results and your draw entries.
        </p>
      </div>

      {/* My Entries */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient mb-8">
        <h2 className="text-headline-sm text-on-surface mb-5">My Entries</h2>
        {entries.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant py-6 text-center">
            No entries yet. Active subscribers are automatically entered into draws.
          </p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-3 hover:bg-surface-container-low/50 -mx-3 px-3 rounded-md transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-body-md text-on-surface">
                      {entry.draws?.draw_date ? formatDate(entry.draws.draw_date) : 'Draw'}
                    </p>
                    <p className="text-label-sm text-on-surface-variant">
                      Scores: {entry.entry_scores?.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Published Draws */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient">
        <h2 className="text-headline-sm text-on-surface mb-5">Published Results</h2>
        {draws.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant py-6 text-center">
            No draws have been published yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {draws.map((draw) => (
              <div key={draw.id} className="p-5 rounded-lg bg-surface-container-low">
                <div className="flex items-center gap-3 mb-3">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="text-body-md text-on-surface font-medium">{formatDate(draw.draw_date)}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-label-sm text-label uppercase">Jackpot</p>
                    <p className="text-body-md text-on-surface font-semibold">{formatCurrency(Number(draw.jackpot_pool))}</p>
                  </div>
                  <div>
                    <p className="text-label-sm text-label uppercase">4-Match</p>
                    <p className="text-body-md text-on-surface font-semibold">{formatCurrency(Number(draw.four_match_pool))}</p>
                  </div>
                  <div>
                    <p className="text-label-sm text-label uppercase">3-Match</p>
                    <p className="text-body-md text-on-surface font-semibold">{formatCurrency(Number(draw.three_match_pool))}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-label-sm text-on-surface-variant">
                  <DollarSign className="w-3.5 h-3.5" />
                  Total Pool: {formatCurrency(Number(draw.total_pool))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
