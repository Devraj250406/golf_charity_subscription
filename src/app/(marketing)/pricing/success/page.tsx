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
    let attempts = 0;
    const maxAttempts = 20; // max 30 seconds at 1.5s interval

    const checkSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus('error');
        clearInterval(pollInterval.current!);
        return;
      }

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .single();

      if (sub?.status === 'active') {
        setStatus('success');
        if (pollInterval.current) clearInterval(pollInterval.current);
        
        // Short delay for UX before redirect
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        attempts++;
        if (attempts >= maxAttempts) {
          setStatus('error');
          if (pollInterval.current) clearInterval(pollInterval.current);
        }
      }
    };

    // Initial check
    checkSubscription();

    // Setup polling
    pollInterval.current = setInterval(checkSubscription, 1500);

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [supabase, router]);

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
            <div className="w-16 h-16 bg-error-container/20 rounded-full flex items-center justify-center mb-6">
              <div className="text-error text-2xl font-bold">!</div>
            </div>
            <h1 className="text-display-sm text-on-surface mb-3">Verification Timeout</h1>
            <p className="text-body-md text-on-surface-variant mb-6">
              We haven't received confirmation from Stripe yet. It might still be processing.
            </p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="btn-primary-gradient px-6 py-3 rounded-md text-body-md font-medium"
            >
              Continue to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
