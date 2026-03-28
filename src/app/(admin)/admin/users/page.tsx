import { getAllUsers } from '@/app/actions/admin';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin - Users' };

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-display-sm text-on-surface mb-2">User Management</h1>
        <p className="text-body-md text-on-surface-variant">{users.length} registered users</p>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-ambient overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="text-left text-label-sm text-label uppercase px-6 py-4">Name</th>
                <th className="text-left text-label-sm text-label uppercase px-6 py-4">Email</th>
                <th className="text-left text-label-sm text-label uppercase px-6 py-4">Role</th>
                <th className="text-left text-label-sm text-label uppercase px-6 py-4">Subscription</th>
                <th className="text-left text-label-sm text-label uppercase px-6 py-4">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const activeSub = Array.isArray(user.subscriptions) 
                  ? user.subscriptions.find((s: { status: string }) => s.status === 'active')
                  : null;
                return (
                  <tr key={user.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4 text-body-md text-on-surface">{user.full_name || '—'}</td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'px-2 py-1 rounded-md text-label-sm',
                        user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-surface-container-low text-on-surface-variant'
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'px-2 py-1 rounded-md text-label-sm',
                        activeSub ? 'bg-green-50 text-green-700' : 'bg-surface-container-low text-on-surface-variant'
                      )}>
                        {activeSub ? activeSub.plan_type : 'None'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{formatDate(user.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
