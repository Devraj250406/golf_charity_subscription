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
  ChevronLeft,
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
    <>
      <style>{`
        .admin-sidebar {
          width: 240px;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          background: rgba(28, 28, 30, 0.96);
          backdrop-filter: blur(24px) saturate(1.6);
          -webkit-backdrop-filter: blur(24px) saturate(1.6);
          border-right: 1px solid rgba(255,255,255,0.07);
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
        }

        /* Logo area */
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px 16px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
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
          box-shadow: 0 2px 8px rgba(10,132,255,0.35);
        }
        .logo-text-app {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255,255,255,0.92);
          letter-spacing: -0.3px;
          line-height: 1.2;
        }
        .logo-text-role {
          font-size: 10px;
          font-weight: 500;
          color: rgba(255,255,255,0.32);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-top: 1px;
        }

        /* Back link */
        .back-link {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 10px 10px 4px;
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.35);
          text-decoration: none;
          transition: background 0.15s ease, color 0.15s ease;
          letter-spacing: 0.01em;
        }
        .back-link:hover {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.65);
        }
        .back-link svg {
          width: 13px;
          height: 13px;
          stroke-width: 2.2;
        }

        /* Section label */
        .nav-section-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.22);
          padding: 10px 16px 6px;
        }

        /* Nav */
        .sidebar-nav {
          flex: 1;
          padding: 4px 8px;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .sidebar-nav::-webkit-scrollbar { display: none; }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 450;
          color: rgba(255,255,255,0.50);
          text-decoration: none;
          margin-bottom: 1px;
          transition: background 0.15s ease, color 0.15s ease;
          letter-spacing: -0.01em;
          position: relative;
        }
        .nav-item svg {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          stroke-width: 1.75;
          transition: color 0.15s ease;
        }
        .nav-item:hover {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.80);
        }
        .nav-item.active {
          background: rgba(10,132,255,0.15);
          color: #0a84ff;
          font-weight: 550;
        }
        .nav-item.active svg {
          color: #0a84ff;
        }
        /* Active left-edge pill */
        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 16px;
          border-radius: 0 2px 2px 0;
          background: #0a84ff;
        }

        /* Divider */
        .sidebar-divider {
          height: 1px;
          margin: 4px 12px;
          background: rgba(255,255,255,0.06);
        }

        /* Bottom */
        .sidebar-bottom {
          padding: 8px 8px 16px;
        }
        .signout-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 10px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 450;
          color: rgba(255,255,255,0.35);
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          letter-spacing: -0.01em;
          transition: background 0.15s ease, color 0.15s ease;
          font-family: inherit;
        }
        .signout-btn svg {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          stroke-width: 1.75;
        }
        .signout-btn:hover {
          background: rgba(255,59,48,0.12);
          color: #ff453a;
        }
      `}</style>

      <aside className="admin-sidebar">

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-mark">P</div>
          <div>
            <div className="logo-text-app">{APP_NAME}</div>
            <div className="logo-text-role">Admin</div>
          </div>
        </div>

        {/* Back link */}
        <Link href="/dashboard" className="back-link">
          <ChevronLeft />
          Back to Dashboard
        </Link>

        <div className="sidebar-divider" />

        {/* Nav */}
        <div className="nav-section-label">Management</div>
        <nav className="sidebar-nav">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn('nav-item', isActive && 'active')}
              >
                <Icon />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="sidebar-divider" />
        <div className="sidebar-bottom">
          <button className="signout-btn" onClick={handleSignOut}>
            <LogOut />
            Sign Out
          </button>
        </div>

      </aside>
    </>
  );
}