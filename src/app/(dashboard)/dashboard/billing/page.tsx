import { Check, AlertCircle } from 'lucide-react';
import { PLANS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/app/actions/subscriptions';
import { CheckoutButton } from '@/components/pricing/checkout-button';
import { VerificationHandler } from '@/components/pricing/verification-handler';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Billing & Subscription' };
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

export default async function BillingPage(props: { searchParams: Promise<{ error?: string; session_id?: string }> }) {
  const searchParams = await props.searchParams;
  const error = searchParams?.error;
  const sessionId = searchParams?.session_id;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const handleMonthlyCheckout = createCheckoutSession.bind(null, 'monthly');
  const handleYearlyCheckout = createCheckoutSession.bind(null, 'yearly');

  // Strictly evaluate current subscription status dynamically
  let isActive = false;
  if (user) {
    const { data: sub } = await supabase.from('subscriptions').select('status').eq('user_id', user.id).single();
    isActive = sub?.status === 'active';
  }

  // Pre-evict active users unless they have a session_id explicitly pending API validation sync
  if (isActive && !sessionId) {
    redirect('/dashboard');
  }

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-display-sm text-on-surface mb-4">
            {isActive ? 'Manage Subscription' : sessionId ? 'Finalizing Setup' : 'Upgrade to Access the Platform'}
          </h1>
          <p className="text-body-lg text-on-surface-variant font-normal max-w-2xl mx-auto">
            {!sessionId && (isActive 
              ? 'You have an active subscription. You can manage your billing directly from the settings page.' 
              : 'Choose a subscription plan to access scoring, draws, and charitable giving.')}
          </p>
          {error && !sessionId && (
            <div className="mt-8 mx-auto max-w-lg p-4 bg-error-container/20 border border-error/20 text-error rounded-lg text-body-sm flex items-start gap-3 text-left">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>
                {error === 'stripe_configuration_missing' 
                  ? 'Payment system is currently unconfigured. Please check back later or contact support.'
                  : error === 'invalid_price_id' 
                  ? 'The selected plan is not configured properly.'
                  : error === 'checkout_failed'
                  ? 'An error occurred during checkout setup. Please try again.'
                  : 'An unexpected error occurred.'}
              </p>
            </div>
          )}
        </div>

        {/* Dynamic State Evaluation */}
        {sessionId ? (
          <div className="max-w-3xl mx-auto">
            <VerificationHandler sessionId={sessionId} />
          </div>
        ) : !isActive && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Monthly */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 transition-colors hover:border-outline-variant">
              <h3 className="text-headline-sm text-on-surface mb-1">{PLANS.monthly.name}</h3>
              <p className="text-label-sm text-label uppercase mb-6">Billed monthly</p>
              <div className="mb-6">
                <span className="text-display-md text-on-surface">{PLANS.monthly.priceDisplay}</span>
                <span className="text-body-md text-on-surface-variant">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {PLANS.monthly.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-body-sm text-on-surface-variant">
                    <Check className="w-4 h-4 text-primary shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <form action={handleMonthlyCheckout}>
                <CheckoutButton
                  className="block text-center px-6 py-3.5 rounded-md bg-surface-container border border-outline-variant/30 text-body-md font-medium text-on-surface hover:bg-surface-container-high transition-colors w-full"
                 />
              </form>
            </div>

            {/* Yearly */}
            <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-ambient-lg ring-2 ring-primary relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full btn-primary-gradient text-label-sm font-medium">
                Save {PLANS.yearly.savings}
              </div>
              <h3 className="text-headline-sm text-on-surface mb-1">{PLANS.yearly.name}</h3>
              <p className="text-label-sm text-label uppercase mb-6">Billed annually</p>
              <div className="mb-6">
                <span className="text-display-md text-on-surface">{PLANS.yearly.priceDisplay}</span>
                <span className="text-body-md text-on-surface-variant">/year</span>
              </div>
              <ul className="space-y-3 mb-8">
                {PLANS.yearly.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-body-sm text-on-surface-variant">
                    <Check className="w-4 h-4 text-primary shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <form action={handleYearlyCheckout}>
                <CheckoutButton
                  showIcon
                  className="block w-full text-center btn-primary-gradient px-6 py-3.5 rounded-md text-body-md font-medium"
                 />
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
