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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-stagger mb-12">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient">
            <p className="text-label-sm text-label uppercase mb-3">{kpi.label}</p>
            <p className="text-headline-md text-on-surface font-semibold">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        <h2 className="text-headline-sm text-on-surface border-b border-outline-variant pb-3">Detailed Reports</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-ambient">
            <h3 className="text-body-lg font-medium text-on-surface mb-6">Subscription Breakdown</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-surface-container/50 p-4 rounded-lg">
                <span className="text-body-md text-on-surface-variant">Active Auto-Renewing</span>
                <span className="text-headline-sm font-semibold text-primary">{stats.activeSubscriptions}</span>
              </div>
              <div className="flex justify-between items-center bg-surface-container/50 p-4 rounded-lg">
                <span className="text-body-md text-on-surface-variant">Unsubscribed / Inactive</span>
                <span className="text-headline-sm font-semibold text-on-surface-variant">{stats.totalUsers - stats.activeSubscriptions}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-ambient">
            <h3 className="text-body-lg font-medium text-on-surface mb-6">Financial Distribution</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-surface-container/50 p-4 rounded-lg">
                <span className="text-body-md text-on-surface-variant">Allocated to Prize Pool (70%)</span>
                <span className="text-headline-sm font-semibold text-emerald-500">{formatCurrency(stats.totalPrizePool)}</span>
              </div>
              <div className="flex justify-between items-center bg-surface-container/50 p-4 rounded-lg">
                <span className="text-body-md text-on-surface-variant">Allocated to Charity (30%)</span>
                <span className="text-headline-sm font-semibold text-secondary">{formatCurrency(stats.totalCharityContributions)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
