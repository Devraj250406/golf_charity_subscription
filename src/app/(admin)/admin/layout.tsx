'use client';

import { AdminSidebar } from '@/components/layout/admin-sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
