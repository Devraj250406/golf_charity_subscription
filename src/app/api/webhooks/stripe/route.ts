import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/admin';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe configuration missing' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const planType = session.metadata?.plan_type;

        if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          ) as unknown as Record<string, unknown>;

          const periodStart = subscription.current_period_start as number;
          const periodEnd = subscription.current_period_end as number;

          await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id as string,
            plan_type: planType || 'monthly',
            status: 'active',
            current_period_start: new Date(periodStart * 1000).toISOString(),
            current_period_end: new Date(periodEnd * 1000).toISOString(),
          }, {
            onConflict: 'stripe_subscription_id',
          });

          await supabase
            .from('profiles')
            .update({ onboarding_complete: true })
            .eq('id', userId);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as unknown as Record<string, unknown>;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId) as unknown as Record<string, unknown>;
          const periodStart = subscription.current_period_start as number;
          const periodEnd = subscription.current_period_end as number;

          await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              current_period_start: new Date(periodStart * 1000).toISOString(),
              current_period_end: new Date(periodEnd * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId);

          // Process charity donation
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', subscriptionId)
            .single();

          if (sub) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('charity_id, charity_percentage')
              .eq('id', sub.user_id)
              .single();

            if (profile?.charity_id) {
              const amountPaid = (invoice.amount_paid as number) || 0;
              const amount = (amountPaid / 100) * (profile.charity_percentage / 100);
              await supabase.from('donations').insert({
                user_id: sub.user_id,
                charity_id: profile.charity_id,
                amount,
                subscription_id: sub.user_id,
                period_start: new Date(periodStart * 1000).toISOString(),
                period_end: new Date(periodEnd * 1000).toISOString(),
              });
            }
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as unknown as Record<string, unknown>;
        const subStatus = subscription.status as string;
        const status = subStatus === 'active' ? 'active'
          : subStatus === 'past_due' ? 'past_due'
          : subStatus === 'canceled' ? 'cancelled'
          : 'inactive';

        const periodStart = subscription.current_period_start as number;
        const periodEnd = subscription.current_period_end as number;

        await supabase
          .from('subscriptions')
          .update({
            status,
            current_period_start: new Date(periodStart * 1000).toISOString(),
            current_period_end: new Date(periodEnd * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id as string);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }
    }
  } catch (err) {
    console.error('Error processing webhook:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
