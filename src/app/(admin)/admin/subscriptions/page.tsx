'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDate, formatCurrency, cn } from '@/lib/utils';

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('subscriptions')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false });
    setSubs(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-display-sm text-on-surface mb-2">Subscriptions</h1>
        <p className="text-body-md text-on-surface-variant">{subs.length} total subscriptions</p>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-ambient overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="text-left text-label-sm text-label uppercase px-6 py-4">User</th>
                <th className="text-left text-label-sm text-label uppercase px-6 py-4">Plan</th>
                <th className="text-left text-label-sm text-label uppercase px-6 py-4">Status</th>
                <th className="text-left text-label-sm text-label uppercase px-6 py-4">Period End</th>
                <th className="text-left text-label-sm text-label uppercase px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((sub) => {
                const profile = sub.profiles as { full_name?: string; email?: string } | null;
                return (
                  <tr key={sub.id as string} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-body-md text-on-surface">{profile?.full_name || '—'}</p>
                      <p className="text-label-sm text-on-surface-variant">{profile?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-on-surface capitalize">{sub.plan_type as string || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'px-2 py-1 rounded-md text-label-sm',
                        sub.status === 'active' ? 'bg-green-50 text-green-700' :
                        sub.status === 'past_due' ? 'bg-amber-50 text-amber-700' :
                        'bg-red-50 text-red-600'
                      )}>
                        {sub.status as string}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">
                      {sub.current_period_end ? formatDate(sub.current_period_end as string) : '—'}
                    </td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{formatDate(sub.created_at as string)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
