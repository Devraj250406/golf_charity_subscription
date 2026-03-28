import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Check, ArrowRight, AlertCircle } from 'lucide-react';
import { PLANS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/app/actions/subscriptions';
import { CheckoutButton } from '@/components/pricing/checkout-button';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Pricing' };

export default async function PricingPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;
  const error = searchParams?.error;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const handleMonthlyCheckout = createCheckoutSession.bind(null, 'monthly');
  const handleYearlyCheckout = createCheckoutSession.bind(null, 'yearly');

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-display-md text-on-surface mb-4">Simple, transparent pricing</h1>
              <p className="text-headline-sm text-on-surface-variant font-normal max-w-2xl mx-auto">
                One membership. Full access to scoring, draws, and charitable giving. Choose your billing cycle.
              </p>
              {error && (
                <div className="mt-8 mx-auto max-w-lg p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-body-sm flex items-start gap-3 text-left">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>
                    {error === 'stripe_configuration_missing' 
                      ? 'Payment system is currently unconfigured. Please check back later or contact support.'
                      : error === 'invalid_price_id' 
                      ? 'The selected plan is not configured properly.'
                      : 'An error occurred during checkout setup. Please try again.'}
                  </p>
                </div>
              )}
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Monthly */}
            <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-ambient">
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
              {user ? (
                <form action={handleMonthlyCheckout}>
                  <CheckoutButton
                    className="block text-center px-6 py-3.5 rounded-md bg-surface-container-low ghost-border text-body-md font-medium text-on-surface hover:bg-surface-container-high transition-colors"
                  />
                </form>
              ) : (
                <Link href="/signup" className="block text-center px-6 py-3.5 rounded-md bg-surface-container-low ghost-border text-body-md font-medium text-on-surface hover:bg-surface-container-high transition-colors">
                  Get Started
                </Link>
              )}
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
              {user ? (
                <form action={handleYearlyCheckout}>
                  <CheckoutButton
                    showIcon
                    className="block text-center btn-primary-gradient px-6 py-3.5 rounded-md text-body-md font-medium"
                  />
                </form>
              ) : (
                <Link href="/signup" className="block text-center btn-primary-gradient px-6 py-3.5 rounded-md text-body-md font-medium flex items-center justify-center gap-2">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
