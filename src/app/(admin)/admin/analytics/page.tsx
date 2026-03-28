import type { Metadata } from 'next';
import { getAdminStats } from '@/app/actions/admin';
import { formatCurrency } from '@/lib/utils';

export const metadata: Metadata = { title: 'Admin - Analytics' };

export default async function AdminAnalyticsPage() {
  const stats = await getAdminStats();

  const kpis = [
    { label: 'Total Users', value: stats.totalUsers },
    { label: 'Active Subscribers', value: stats.activeSubscriptions },
    { label: 'Conversion Rate', value: stats.totalUsers > 0 ? `${Math.round((stats.activeSubscriptions / stats.totalUsers) * 100)}%` : '0%' },
    { label: 'Monthly Revenue', value: formatCurrency(stats.activeSubscriptions * 9.99) },
    { label: 'Prize Pool', value: formatCurrency(stats.totalPrizePool) },
    { label: 'Total Donated', value: formatCurrency(stats.totalCharityContributions) },
    { label: 'Avg Revenue/User', value: stats.totalUsers > 0 ? formatCurrency((stats.activeSubscriptions * 9.99) / stats.totalUsers) : '$0.00' },
    { label: 'Charity Impact', value: stats.activeSubscriptions > 0 ? formatCurrency(stats.totalCharityContributions / Math.max(1, stats.activeSubscriptions)) : '$0.00' },
  ];

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-display-sm text-on-surface mb-2">Analytics</h1>
        <p className="text-body-md text-on-surface-variant">Platform performance metrics and KPIs.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-stagger">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient">
            <p className="text-label-sm text-label uppercase mb-3">{kpi.label}</p>
            <p className="text-headline-md text-on-surface font-semibold">{kpi.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
