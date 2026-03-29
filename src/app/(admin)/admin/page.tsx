import { getAdminStats } from '@/app/actions/admin';
import { formatCurrency } from '@/lib/utils';
import { Users, CreditCard, DollarSign, Trophy } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin Dashboard' };

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="min-h-screen bg-[#f5f5f7] px-6 py-12 font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display',sans-serif]">

      {/* Header */}
      <div className="mb-12 max-w-6xl mx-auto">
        <p className="text-xs font-semibold tracking-[0.18em] text-[#6e6e73] uppercase mb-2">
          Overview
        </p>
        <h1 className="text-[2.75rem] font-bold tracking-tight text-[#1d1d1f] leading-none">
          Admin Dashboard
        </h1>
        <p className="mt-3 text-[17px] text-[#6e6e73] font-normal tracking-[-0.01em]">
          Platform metrics and management controls
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers.toString()}
          color="blue"
          delay="0ms"
        />
        <AdminStatCard
          icon={CreditCard}
          label="Active Subscriptions"
          value={stats.activeSubscriptions.toString()}
          color="indigo"
          delay="60ms"
        />
        <AdminStatCard
          icon={DollarSign}
          label="Prize Pool"
          value={formatCurrency(stats.totalPrizePool)}
          color="green"
          delay="120ms"
          accent
        />
        <AdminStatCard
          icon={Trophy}
          label="Total Donated"
          value={formatCurrency(stats.totalCharityContributions)}
          color="orange"
          delay="180ms"
        />
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .stat-card {
          animation: fadeUp 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow:
            0 0 0 1px rgba(0,0,0,0.06),
            0 8px 32px rgba(0,0,0,0.10),
            0 2px 8px rgba(0,0,0,0.06);
        }
        .stat-card:hover .icon-ring {
          transform: scale(1.08);
        }
        .icon-ring {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}

const colorMap = {
  blue: { bg: 'rgba(0,122,255,0.10)', icon: '#007aff' },
  indigo: { bg: 'rgba(88,86,214,0.10)', icon: '#5856d6' },
  green: { bg: 'rgba(52,199,89,0.10)', icon: '#34c759' },
  orange: { bg: 'rgba(255,149,0,0.10)', icon: '#ff9500' },
};

function AdminStatCard({
  icon: Icon,
  label,
  value,
  color = 'blue',
  accent,
  delay = '0ms',
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color?: keyof typeof colorMap;
  accent?: boolean;
  delay?: string;
}) {
  const { bg, icon: iconColor } = colorMap[color];

  return (
    <div
      className="stat-card relative rounded-[20px] p-6 overflow-hidden cursor-default"
      style={{
        animationDelay: delay,
        background: 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(20px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
        boxShadow: `
          0 0 0 1px rgba(0,0,0,0.05),
          0 4px 24px rgba(0,0,0,0.07),
          0 1px 4px rgba(0,0,0,0.04)
        `,
        transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s ease',
      }}
    >
      {/* Subtle top shimmer line */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)' }}
      />

      {/* Icon */}
      <div
        className="icon-ring w-11 h-11 rounded-[12px] flex items-center justify-center mb-5"
        style={{ background: bg }}
      >
        <Icon style={{ color: iconColor, width: 20, height: 20, strokeWidth: 1.8 }} />
      </div>

      {/* Value */}
      <p
        className="font-bold tracking-tight text-[#1d1d1f] leading-none mb-1.5"
        style={{ fontSize: 'clamp(1.6rem, 3vw, 2rem)', letterSpacing: '-0.03em' }}
      >
        {value}
      </p>

      {/* Label */}
      <p
        className="text-[13px] font-medium tracking-[0.06em] uppercase"
        style={{ color: '#6e6e73' }}
      >
        {label}
      </p>

      {/* Accent glow for Prize Pool */}
      {accent && (
        <div
          className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl pointer-events-none"
          style={{ background: 'rgba(52,199,89,0.15)' }}
        />
      )}
    </div>
  );
}