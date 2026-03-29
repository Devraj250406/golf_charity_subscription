'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { APP_NAME } from '@/lib/constants';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !user) {
        setError(authError?.message || 'Login failed');
        return;
      }

      // Check role and subscription for correct initial redirect
      const [profileRes, subRes] = await Promise.all([
        supabase.from('profiles').select('role').eq('id', user.id).single(),
        supabase.from('subscriptions').select('status').eq('user_id', user.id).single()
      ]);

      const role = profileRes.data?.role || 'user';
      const status = subRes.data?.status || 'inactive';

      if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push(status === 'active' ? '/dashboard' : '/dashboard/billing');
      }
      
      router.refresh();
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-10">
        <div className="w-12 h-12 rounded-lg btn-primary-gradient flex items-center justify-center text-lg font-bold text-on-primary mx-auto mb-6">
          P
        </div>
        <h1 className="text-display-sm text-on-surface mb-2">Welcome back</h1>
        <p className="text-body-md text-on-surface-variant">
          Sign in to your {APP_NAME} account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 rounded-md bg-error-container/20 text-error text-body-sm animate-fade-in">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="login-email" className="text-label-md text-label uppercase block">
            Email Address
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-md bg-surface-container-lowest ghost-border text-body-md text-on-surface placeholder:text-on-surface-variant/40"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="login-password" className="text-label-md text-label uppercase block">
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 pr-12 rounded-md bg-surface-container-lowest ghost-border text-body-md text-on-surface placeholder:text-on-surface-variant/40"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary-gradient px-6 py-3.5 rounded-md text-body-md font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-body-sm text-on-surface-variant mt-8">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-primary font-medium hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
