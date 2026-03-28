import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate, getMatchTypeLabel } from '@/lib/utils';
import { Trophy, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Winnings' };

export default async function WinningsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: winnings } = await supabase
    .from('winnings')
    .select('*, draws(draw_date)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const data = winnings || [];
  const totalApproved = data.filter(w => w.verification_status === 'approved').reduce((sum, w) => sum + Number(w.amount), 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-display-sm text-on-surface mb-2">My Winnings</h1>
        <p className="text-body-md text-on-surface-variant">
          Track your prize history, verification status, and payouts.
        </p>
      </div>

      {/* Summary */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <Trophy className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="text-label-sm text-label uppercase">Total Verified Winnings</p>
            <p className="text-display-sm text-on-surface">{formatCurrency(totalApproved)}</p>
          </div>
        </div>
      </div>

      {/* Winnings List */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient">
        <h2 className="text-headline-sm text-on-surface mb-5">History</h2>
        {data.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant py-8 text-center">
            No winnings yet. Keep playing and entering draws!
          </p>
        ) : (
          <div className="space-y-4">
            {data.map((w) => (
              <div key={w.id} className="flex items-center justify-between py-4 hover:bg-surface-container-low/50 -mx-3 px-3 rounded-md transition-colors">
                <div className="flex items-center gap-4">
                  <StatusIcon status={w.verification_status} />
                  <div>
                    <p className="text-body-md text-on-surface font-medium">{getMatchTypeLabel(w.match_type)}</p>
                    <p className="text-label-sm text-on-surface-variant">
                      {w.draws?.draw_date ? formatDate(w.draws.draw_date) : 'Draw'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-headline-sm text-on-surface font-semibold">{formatCurrency(Number(w.amount))}</p>
                  <p className={cn(
                    'text-label-sm capitalize',
                    w.verification_status === 'approved' ? 'text-green-600' : w.verification_status === 'rejected' ? 'text-red-500' : 'text-amber-600'
                  )}>
                    {w.verification_status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'approved') return <CheckCircle2 className="w-10 h-10 p-2 rounded-md bg-green-50 text-green-600" />;
  if (status === 'rejected') return <XCircle className="w-10 h-10 p-2 rounded-md bg-red-50 text-red-500" />;
  return <Clock className="w-10 h-10 p-2 rounded-md bg-amber-50 text-amber-600" />;
}
