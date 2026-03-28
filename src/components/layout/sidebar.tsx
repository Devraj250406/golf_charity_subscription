'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Target,
  Trophy,
  Heart,
  Wallet,
  Settings,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Scores', href: '/scores', icon: Target },
  { label: 'Draws', href: '/draws', icon: Trophy },
  { label: 'Charity', href: '/charity', icon: Heart },
  { label: 'Winnings', href: '/winnings', icon: Wallet },
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside
      className={cn(
        'bg-surface-container-low h-screen sticky top-0 flex flex-col transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 h-16">
        <div className="w-9 h-9 rounded-md btn-primary-gradient flex items-center justify-center text-sm font-bold text-on-primary shrink-0">
          P
        </div>
        {!collapsed && (
          <span className="text-headline-sm text-on-surface tracking-tight truncate">
            {APP_NAME}
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-body-sm transition-all duration-200',
                    isActive
                      ? 'bg-surface-container-lowest text-primary font-medium shadow-ambient'
                      : 'text-on-surface-variant hover:bg-surface-container-lowest/60 hover:text-on-surface'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={cn('w-5 h-5 shrink-0', isActive && 'text-primary')} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 space-y-1">
        {onToggle && (
          <button
            onClick={onToggle}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-body-sm text-on-surface-variant hover:bg-surface-container-lowest/60 transition-colors w-full"
          >
            <ChevronLeft
              className={cn(
                'w-5 h-5 shrink-0 transition-transform duration-300',
                collapsed && 'rotate-180'
              )}
            />
            {!collapsed && <span>Collapse</span>}
          </button>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-body-sm text-on-surface-variant hover:bg-error-container/20 hover:text-error transition-colors w-full"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
