'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getStripeClient } from '@/lib/stripe/client';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

export async function getSubscription() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return data;
}

export async function createCheckoutSession(planType: 'monthly' | 'yearly') {
  let sessionUrl: string | null = null;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    let priceId = '';
    if (planType === 'monthly') {
      priceId = process.env.STRIPE_MONTHLY_PRICE_ID || '';
    } else if (planType === 'yearly') {
      priceId = process.env.STRIPE_YEARLY_PRICE_ID || '';
    }

    if (!priceId || priceId.includes('your_monthly_price_id') || priceId.includes('your_yearly_price_id')) {
      console.error('Stripe Price ID is invalid or missing. Evaluated:', priceId);
      redirect('/pricing?error=invalid_price_id');
    }

    const stripe = getStripeClient();
    if (!stripe) {
      console.error('Stripe client initialization failed due to missing API keys.');
      redirect('/pricing?error=stripe_configuration_missing');
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Check if user already has a Stripe customer
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .not('stripe_customer_id', 'is', null)
      .limit(1)
      .single();

    let customerId = existingSub?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
      metadata: {
        supabase_user_id: user.id,
        plan_type: planType,
      },
    });

    sessionUrl = session.url;
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error('Error creating checkout session:', error);
    redirect('/pricing?error=checkout_failed');
  }

  if (sessionUrl) {
    redirect(sessionUrl);
  }
}

export async function createPortalSession() {
  let sessionUrl: string | null = null;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .not('stripe_customer_id', 'is', null)
      .limit(1)
      .single();

    if (!sub?.stripe_customer_id) throw new Error('No subscription found');

    const stripe = getStripeClient();
    if (!stripe) {
      console.error('Stripe client initialization failed due to missing API keys.');
      redirect('/settings?error=stripe_configuration_missing');
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${appUrl}/settings`,
    });

    sessionUrl = session.url;
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error('Error creating portal session:', error);
    redirect('/settings?error=portal_failed');
  }

  if (sessionUrl) {
    redirect(sessionUrl);
  }
}
