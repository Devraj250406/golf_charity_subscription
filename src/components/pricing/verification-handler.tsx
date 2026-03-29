'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export function VerificationHandler({ sessionId }: { sessionId: string }) {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const verifySession = async () => {
      // Small artificial delay so the UI doesn't visually glitch instantly
      await new Promise((resolve) => setTimeout(resolve, 800));

      try {
        const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'active' || data.verified) {
            if (mounted) {
              setStatus('success');
              // CRITICAL: Force cache invalidation before navigating
              router.refresh();
              setTimeout(() => {
                router.push('/dashboard');
              }, 1200);
            }
          } else {
            if (mounted) setStatus('error');
          }
        } else {
          if (mounted) setStatus('error');
        }
      } catch (err) {
        console.error('Session verification failed:', err);
        if (mounted) setStatus('error');
      }
    };

    verifySession();

    return () => {
      mounted = false;
    };
  }, [sessionId, router]);

  if (status === 'verifying') {
    return (
      <div className="flex flex-col items-center animate-fade-in bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-12 text-center shadow-ambient max-w-lg mx-auto">
        <div className="w-16 h-16 bg-primary-container/30 rounded-full flex items-center justify-center mb-6">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <h1 className="text-display-sm text-on-surface mb-3">Verifying Payment</h1>
        <p className="text-body-md text-on-surface-variant max-w-xs mx-auto">
          Please wait while we confirm your subscription with Stripe.
        </p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center animate-fade-in bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-12 text-center shadow-ambient max-w-lg mx-auto">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="text-display-sm text-on-surface mb-3">Payment Successful!</h1>
        <p className="text-body-md text-on-surface-variant">
          Your subscription is active. Taking you to the dashboard...
        </p>
      </div>
    );
  }

  // Error state
  return (
    <div className="flex flex-col items-center animate-fade-in bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-12 text-center shadow-ambient max-w-lg mx-auto">
      <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-display-sm text-on-surface mb-3">Almost There!</h1>
      <p className="text-body-md text-on-surface-variant mb-6">
        Your payment was successful but is still syncing with our database. You can safely head over to your dashboard.
      </p>
      <button
        onClick={() => {
          router.refresh();
          router.push('/dashboard');
        }}
        className="px-6 py-3 btn-primary-gradient rounded-xl font-medium hover:opacity-90 transition-opacity"
      >
        Go to Dashboard
      </button>
    </div>
  );
}
