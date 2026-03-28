import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Target, Trophy, Heart, Wallet, TrendingUp, Calendar } from 'lucide-react';
import { formatCurrency, calculateAverage, formatDate } from '@/lib/utils';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [profileRes, scoresRes, subRes, winningsRes, donationsRes] = await Promise.all([
    supabase.from('profiles').select('*, charities(name)').eq('id', user.id).single(),
    supabase.from('scores').select('*').eq('user_id', user.id).order('played_date', { ascending: false }).limit(5),
    supabase.from('subscriptions').select('*').eq('user_id', user.id).eq('status', 'active').limit(1).single(),
    supabase.from('winnings').select('amount').eq('user_id', user.id).eq('verification_status', 'approved'),
    supabase.from('donations').select('amount').eq('user_id', user.id),
  ]);

  const profile = profileRes.data;
  const scores = scoresRes.data || [];
  const subscription = subRes.data;
  const totalWinnings = winningsRes.data?.reduce((s, w) => s + Number(w.amount), 0) || 0;
  const totalDonated = donationsRes.data?.reduce((s, d) => s + Number(d.amount), 0) || 0;
  const average = calculateAverage(scores.map(s => s.score));

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-display-sm text-on-surface mb-2">
          Welcome back, {profile?.full_name || 'Golfer'}
        </h1>
        <p className="text-body-md text-on-surface-variant">
          {subscription ? 'Your membership is active.' : 'Subscribe to unlock all features.'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10 animate-stagger">
        <StatCard icon={Target} label="Average Score" value={average.toString()} sub={`${scores.length} round${scores.length !== 1 ? 's' : ''}`} />
        <StatCard icon={Trophy} label="Total Winnings" value={formatCurrency(totalWinnings)} sub="All time" />
        <StatCard icon={Heart} label="Total Donated" value={formatCurrency(totalDonated)} sub={profile?.charities?.name || 'No charity selected'} />
        <StatCard icon={Wallet} label="Subscription" value={subscription?.plan_type ? subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1) : 'None'} sub={subscription ? 'Active' : 'Inactive'} accent={!!subscription} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Scores */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-headline-sm text-on-surface">Recent Scores</h2>
            <Link href="/scores" className="text-label-sm text-primary hover:underline uppercase">View All</Link>
          </div>
          {scores.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant py-8 text-center">No scores yet. Record your first round!</p>
          ) : (
            <div className="space-y-3">
              {scores.slice(0, 4).map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-surface-container-low flex items-center justify-center">
                      <span className="text-headline-sm text-on-surface font-semibold">{s.score}</span>
                    </div>
                    <span className="text-body-sm text-on-surface-variant">{formatDate(s.played_date)}</span>
                  </div>
                  <TrendingUp className="w-4 h-4 text-on-surface-variant/40" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient">
          <h2 className="text-headline-sm text-on-surface mb-5">Quick Actions</h2>
          <div className="space-y-3">
            <QuickLink href="/scores" icon={Target} label="Record a Score" desc="Log your latest round" />
            <QuickLink href="/draws" icon={Calendar} label="View Draws" desc="Check upcoming and past draws" />
            <QuickLink href="/charity" icon={Heart} label="Manage Charity" desc="Choose or update your charity" />
            <QuickLink href="/winnings" icon={Trophy} label="My Winnings" desc="View prize history and status" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, accent }: {
  icon: React.ElementType; label: string; value: string; sub: string; accent?: boolean;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 shadow-ambient">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-md flex items-center justify-center ${accent ? 'bg-primary/10' : 'bg-surface-container-low'}`}>
          <Icon className={`w-5 h-5 ${accent ? 'text-primary' : 'text-on-surface-variant'}`} />
        </div>
        <span className="text-label-sm text-label uppercase">{label}</span>
      </div>
      <p className="text-headline-md text-on-surface mb-0.5">{value}</p>
      <p className="text-label-sm text-on-surface-variant">{sub}</p>
    </div>
  );
}

function QuickLink({ href, icon: Icon, label, desc }: {
  href: string; icon: React.ElementType; label: string; desc: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-4 p-3 rounded-md hover:bg-surface-container-low transition-colors group">
      <div className="w-10 h-10 rounded-md bg-surface-container-low flex items-center justify-center group-hover:bg-primary/10 transition-colors">
        <Icon className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
      </div>
      <div>
        <p className="text-body-md text-on-surface font-medium">{label}</p>
        <p className="text-label-sm text-on-surface-variant">{desc}</p>
      </div>
    </Link>
  );
}
