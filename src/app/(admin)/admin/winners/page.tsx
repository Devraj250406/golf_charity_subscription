'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPendingWinners, verifyWinner } from '@/app/actions/admin';
import { formatCurrency, formatDate, getMatchTypeLabel, cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchWinners = useCallback(async () => {
    try {
      const data = await getPendingWinners();
      setWinners(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchWinners(); }, [fetchWinners]);

  const handleVerify = async (id: string, status: 'approved' | 'rejected') => {
    setProcessing(id);
    try {
      await verifyWinner(id, status);
      await fetchWinners();
    } catch (e) { console.error(e); }
    setProcessing(null);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-display-sm text-on-surface mb-2">Winner Verification</h1>
        <p className="text-body-md text-on-surface-variant">{winners.length} pending verifications</p>
      </div>

      {winners.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl p-12 shadow-ambient text-center">
          <CheckCircle2 className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-4" />
          <h3 className="text-headline-sm text-on-surface mb-2">All caught up!</h3>
          <p className="text-body-sm text-on-surface-variant">No pending winner verifications.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {winners.map((w) => {
            const profile = w.profiles as { full_name?: string; email?: string } | null;
            const draw = w.draws as { draw_date?: string } | null;
            return (
              <div key={w.id as string} className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-body-lg text-on-surface font-medium">{profile?.full_name || profile?.email || 'Unknown'}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-body-sm text-on-surface-variant">{getMatchTypeLabel(w.match_type as string)}</span>
                      <span className="text-body-sm text-on-surface-variant">{draw?.draw_date ? formatDate(draw.draw_date) : ''}</span>
                    </div>
                    <p className="text-headline-sm text-primary font-semibold mt-2">{formatCurrency(Number(w.amount))}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVerify(w.id as string, 'approved')}
                      disabled={processing === w.id}
                      className="px-4 py-2 rounded-md bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-body-sm font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                      {processing === w.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerify(w.id as string, 'rejected')}
                      disabled={processing === w.id}
                      className="px-4 py-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-body-sm font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
