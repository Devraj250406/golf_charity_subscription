'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
