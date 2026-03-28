'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Trophy,
  Heart,
  Award,
  BarChart3,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';

const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { label: 'Draws', href: '/admin/draws', icon: Trophy },
  { label: 'Charities', href: '/admin/charities', icon: Heart },
  { label: 'Winners', href: '/admin/winners', icon: Award },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="bg-inverse-surface h-screen sticky top-0 flex flex-col w-[260px]">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 h-16">
        <div className="w-9 h-9 rounded-md bg-inverse-primary flex items-center justify-center text-sm font-bold text-inverse-surface shrink-0">
          P
        </div>
        <div className="flex flex-col">
          <span className="text-body-md text-surface-container-lowest font-semibold tracking-tight truncate">
            {APP_NAME}
          </span>
          <span className="text-label-sm text-surface-container-high uppercase tracking-widest">
            Admin
          </span>
        </div>
      </div>

      {/* Back to User Dashboard */}
      <div className="px-3 py-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-body-sm text-surface-container-high hover:bg-surface-container-highest/10 hover:text-surface-container-lowest transition-colors"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-surface-container-highest/15 my-1" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-body-sm transition-all duration-200',
                    isActive
                      ? 'bg-inverse-primary/20 text-inverse-primary font-medium'
                      : 'text-surface-container-high hover:bg-surface-container-highest/10 hover:text-surface-container-lowest'
                  )}
                >
                  <Icon className={cn('w-5 h-5 shrink-0', isActive && 'text-inverse-primary')} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-body-sm text-surface-container-high hover:bg-error-container/20 hover:text-error transition-colors w-full"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
