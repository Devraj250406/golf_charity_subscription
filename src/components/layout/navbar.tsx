'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import { NAV_LINKS, APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass">
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-md btn-primary-gradient flex items-center justify-center text-sm font-bold text-on-primary">
              P
            </div>
            <span className="text-headline-sm text-on-surface tracking-tight">
              {APP_NAME}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-body-sm transition-colors duration-200',
                  pathname === link.href
                    ? 'text-primary font-medium'
                    : 'text-on-surface-variant hover:text-on-surface'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-body-sm text-on-surface-variant hover:text-on-surface transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="btn-primary-gradient text-body-sm px-5 py-2.5 rounded-md font-medium flex items-center gap-1.5"
            >
              Get Started
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-on-surface-variant"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'px-4 py-3 rounded-md text-body-md transition-colors',
                    pathname === link.href
                      ? 'text-primary bg-primary-container/30 font-medium'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 pt-4 border-t border-outline-variant/15 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-md text-body-md text-on-surface-variant text-center"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary-gradient text-body-md px-4 py-3 rounded-md font-medium text-center"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
