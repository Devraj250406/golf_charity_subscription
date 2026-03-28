'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function PricingSuccessPage() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const router = useRouter();
  const supabase = createClient();
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let mounted = true;

    const verifySession = async () => {
      // Small delay on mount to let user see "Verifying" message
      await new Promise(resolve => setTimeout(resolve, 800));

      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');

      if (!sessionId) {
        if (mounted) setStatus('error');
        return;
      }

      try {
        const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'active' || data.verified) {
            if (mounted) {
              setStatus('success');
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
        console.error('Verification failed', err);
        if (mounted) setStatus('error');
      }
    };

    verifySession();

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="bg-surface-container-lowest rounded-2xl shadow-ambient max-w-md w-full p-8 text-center">
        {status === 'verifying' && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-16 h-16 bg-primary-container/30 rounded-full flex items-center justify-center mb-6">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h1 className="text-display-sm text-on-surface mb-3">Verifying Payment</h1>
            <p className="text-body-md text-on-surface-variant">
              Please wait while we confirm your subscription with Stripe. This usually takes just a few seconds.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-display-sm text-on-surface mb-3">Payment Successful!</h1>
            <p className="text-body-md text-on-surface-variant">
              Your subscription is active. Taking you to the dashboard...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-display-sm text-on-surface mb-3">Almost There!</h1>
            <p className="text-body-md text-on-surface-variant mb-6">
              Your payment was successful but is still syncing with our database. You can safely head over to your dashboard.
            </p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-primary text-on-primary rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
