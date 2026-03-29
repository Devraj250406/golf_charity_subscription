'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createPortalSession } from '@/app/actions/subscriptions';
import { useRouter } from 'next/navigation';
import { Loader2, Settings, User, CreditCard, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const [profile, setProfile] = useState<{ full_name: string; email: string; subStatus: string } | null>(null);
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [portalPending, startPortalTransition] = useTransition();
  const supabase = createClient();
  const router = useRouter();

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const [profileRes, subRes] = await Promise.all([
      supabase.from('profiles').select('full_name, email').eq('id', user.id).single(),
      supabase.from('subscriptions').select('status').eq('user_id', user.id).single(),
    ]);

    if (profileRes.data) {
      setProfile({
        ...profileRes.data,
        subStatus: subRes.data?.status || 'inactive'
      });
      setFullName(profileRes.data.full_name || '');
    }
  }, [supabase]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update({ full_name: fullName, updated_at: new Date().toISOString() }).eq('id', user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleManageSubscription = () => {
    startPortalTransition(async () => {
      await createPortalSession();
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!profile) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const isActive = profile.subStatus === 'active';

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-display-sm text-on-surface mb-2">Settings</h1>
        <p className="text-body-md text-on-surface-variant">Manage your account and preferences.</p>
      </div>

      {/* Profile Section */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient mb-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-headline-sm text-on-surface">Profile</h2>
        </div>
        <div className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="text-label-md text-label uppercase block">Email</label>
            <p className="px-4 py-3 rounded-md bg-surface-container-low text-body-md text-on-surface-variant">{profile.email}</p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="settings-name" className="text-label-md text-label uppercase block">Full Name</label>
            <input
              id="settings-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-surface ghost-border text-body-md text-on-surface"
            />
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary-gradient px-6 py-2.5 rounded-md text-body-sm font-medium flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Subscription Section */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient mb-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-5 h-5 text-primary" />
          <h2 className="text-headline-sm text-on-surface">Subscription</h2>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-green-500/10 text-green-500' : 'bg-surface-container-high text-on-surface-variant'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <p className="text-body-sm text-on-surface-variant mb-4">
          {isActive 
            ? 'Manage your subscription, update payment methods, or cancel through the Stripe customer portal.'
            : 'You are currently not subscribed. An active subscription is required to access the platform.'}
        </p>
        {isActive ? (
          <button
            onClick={handleManageSubscription}
            disabled={portalPending}
            className="px-6 py-2.5 rounded-md bg-surface-container-low ghost-border text-body-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {portalPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Manage Subscription
          </button>
        ) : (
          <button
            onClick={() => router.push('/dashboard/billing')}
            className="btn-primary-gradient px-6 py-2.5 rounded-md text-body-sm font-medium flex items-center gap-2"
          >
            Upgrade Plan
          </button>
        )}
      </div>

      {/* Sign Out */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient">
        <button onClick={handleSignOut} className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-error-container/10 text-error hover:bg-error-container/20 transition-colors text-body-sm font-medium">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
