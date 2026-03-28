import { getAdminStats } from '@/app/actions/admin';
import { formatCurrency } from '@/lib/utils';
import { Users, CreditCard, DollarSign, Trophy } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin Dashboard' };

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-display-sm text-on-surface mb-2">Admin Dashboard</h1>
        <p className="text-body-md text-on-surface-variant">Platform overview and management controls.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-stagger">
        <AdminStatCard icon={Users} label="Total Users" value={stats.totalUsers.toString()} />
        <AdminStatCard icon={CreditCard} label="Active Subscriptions" value={stats.activeSubscriptions.toString()} />
        <AdminStatCard icon={DollarSign} label="Prize Pool" value={formatCurrency(stats.totalPrizePool)} accent />
        <AdminStatCard icon={Trophy} label="Total Donated" value={formatCurrency(stats.totalCharityContributions)} />
      </div>
    </div>
  );
}

function AdminStatCard({ icon: Icon, label, value, accent }: {
  icon: React.ElementType; label: string; value: string; accent?: boolean;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent ? 'bg-primary/10' : 'bg-surface-container-low'}`}>
          <Icon className={`w-5 h-5 ${accent ? 'text-primary' : 'text-on-surface-variant'}`} />
        </div>
      </div>
      <p className="text-display-sm text-on-surface mb-1">{value}</p>
      <p className="text-label-sm text-label uppercase">{label}</p>
    </div>
  );
}
