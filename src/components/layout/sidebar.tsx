'use client';

import { useEffect, useState } from 'react';
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
  PanelLeftClose,
  PanelLeftOpen,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard, color: '#0a84ff', bg: 'rgba(10,132,255,0.12)' },
  { label: 'Scores', href: '/scores', icon: Target, color: '#30d158', bg: 'rgba(48,209,88,0.12)' },
  { label: 'Draws', href: '/draws', icon: Trophy, color: '#ff9f0a', bg: 'rgba(255,159,10,0.12)' },
  { label: 'Charity', href: '/charity', icon: Heart, color: '#ff375f', bg: 'rgba(255,55,95,0.12)' },
  { label: 'Winnings', href: '/winnings', icon: Wallet, color: '#5e5ce6', bg: 'rgba(94,92,230,0.12)' },
  { label: 'Settings', href: '/settings', icon: Settings, color: '#8e8e93', bg: 'rgba(142,142,147,0.12)' },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchRole = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user && mounted) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (data?.role === 'admin' && mounted) {
          setIsAdmin(true);
        }
      }
    };
    fetchRole();
    return () => { mounted = false; };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>
      <style>{`
        .user-sidebar {
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(24px) saturate(1.8);
          -webkit-backdrop-filter: blur(24px) saturate(1.8);
          border-right: 1px solid rgba(0,0,0,0.07);
          transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
        }

        .logo-area {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px 14px 16px;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          flex-shrink: 0;
        }
        .logo-mark {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: linear-gradient(145deg, #0a84ff, #0055d4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.5px;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(10,132,255,0.30);
        }
        .logo-name {
          font-size: 15px;
          font-weight: 650;
          color: #1d1d1f;
          letter-spacing: -0.4px;
          white-space: nowrap;
          overflow: hidden;
          opacity: 1;
          transition: opacity 0.2s ease, max-width 0.3s ease;
          max-width: 160px;
        }
        .logo-name.hidden-text {
          opacity: 0;
          max-width: 0;
        }

        /* nav section label */
        .nav-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #aeaeb2;
          padding: 10px 14px 4px;
          white-space: nowrap;
          overflow: hidden;
          opacity: 1;
          transition: opacity 0.15s ease;
        }
        .nav-label.hidden-text { opacity: 0; }

        .sidebar-nav {
          flex: 1;
          padding: 4px 8px;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: none;
        }
        .sidebar-nav::-webkit-scrollbar { display: none; }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 450;
          color: #6e6e73;
          text-decoration: none;
          margin-bottom: 2px;
          position: relative;
          transition: background 0.15s ease, color 0.15s ease;
          white-space: nowrap;
          letter-spacing: -0.01em;
        }
        .nav-item:hover {
          background: rgba(0,0,0,0.04);
          color: #1d1d1f;
        }
        .nav-item.active {
          background: var(--item-bg);
          color: var(--item-color);
          font-weight: 580;
        }
        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 16px;
          border-radius: 0 2px 2px 0;
          background: var(--item-color);
        }

        .icon-wrap {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.15s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
          background: transparent;
        }
        .nav-item.active .icon-wrap {
          background: var(--item-bg);
          /* already set on item, so this is a no-op unless we want double */
        }
        .nav-item:hover .icon-wrap { transform: scale(1.08); }

        .nav-item svg {
          width: 16px;
          height: 16px;
          stroke-width: 1.75;
          flex-shrink: 0;
          color: inherit;
          transition: color 0.15s ease;
        }
        .nav-item.active svg { color: var(--item-color); }

        .item-label {
          flex: 1;
          overflow: hidden;
          transition: max-width 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease;
          max-width: 160px;
          opacity: 1;
        }
        .item-label.hidden-text {
          max-width: 0;
          opacity: 0;
        }

        /* Tooltip for collapsed */
        .nav-item[data-tooltip]:hover::after {
          content: attr(data-tooltip);
          position: absolute;
          left: calc(100% + 10px);
          top: 50%;
          transform: translateY(-50%);
          background: rgba(28,28,30,0.92);
          color: rgba(255,255,255,0.92);
          font-size: 12px;
          font-weight: 500;
          padding: 5px 10px;
          border-radius: 8px;
          white-space: nowrap;
          pointer-events: none;
          z-index: 50;
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
          letter-spacing: 0;
        }

        .sidebar-divider {
          height: 1px;
          margin: 4px 12px;
          background: rgba(0,0,0,0.06);
          flex-shrink: 0;
        }

        .sidebar-bottom {
          padding: 6px 8px 14px;
          flex-shrink: 0;
        }

        .bottom-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 10px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 450;
          color: #6e6e73;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          letter-spacing: -0.01em;
          transition: background 0.15s ease, color 0.15s ease;
          white-space: nowrap;
          margin-bottom: 2px;
        }
        .bottom-btn:hover { background: rgba(0,0,0,0.04); color: #1d1d1f; }
        .bottom-btn.danger:hover { background: rgba(255,59,48,0.10); color: #ff3b30; }
        .bottom-btn svg {
          width: 16px;
          height: 16px;
          stroke-width: 1.75;
          flex-shrink: 0;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .bottom-btn:hover svg { transform: scale(1.1); }
      `}</style>

      <aside
        className="user-sidebar"
        style={{ width: collapsed ? 64 : 240 }}
      >
        {/* Logo */}
        <div className="logo-area" style={{ justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '20px 0 16px' : undefined }}>
          <div className="logo-mark">P</div>
          <span className={cn('logo-name', collapsed && 'hidden-text')}>
            {APP_NAME}
          </span>
        </div>

        {/* Nav section label */}
        <div className={cn('nav-label', collapsed && 'hidden-text')}>Menu</div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn('nav-item', isActive && 'active')}
                style={{
                  '--item-color': item.color,
                  '--item-bg': item.bg,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '8px 0' : undefined,
                } as React.CSSProperties}
                data-tooltip={collapsed ? item.label : undefined}
                title={undefined}
              >
                <div className="icon-wrap">
                  <Icon />
                </div>
                <span className={cn('item-label', collapsed && 'hidden-text')}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-divider" />

        {/* Bottom */}
        <div className="sidebar-bottom">
          {isAdmin && (
            <Link
              href="/admin"
              className="bottom-btn"
              style={{ justifyContent: collapsed ? 'center' : 'flex-start', color: '#ff9f0a' }}
              title={collapsed ? 'Back to Admin' : undefined}
            >
              <ShieldAlert />
              <span className={cn('item-label', collapsed && 'hidden-text')}>Back to Admin</span>
            </Link>
          )}
          {onToggle && (
            <button
              className="bottom-btn"
              onClick={onToggle}
              style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
              title={collapsed ? 'Expand' : undefined}
            >
              {collapsed
                ? <PanelLeftOpen />
                : <><PanelLeftClose /><span className={cn('item-label', collapsed && 'hidden-text')}>Collapse</span></>
              }
            </button>
          )}
          <button
            className="bottom-btn danger"
            onClick={handleSignOut}
            style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut />
            <span className={cn('item-label', collapsed && 'hidden-text')}>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}