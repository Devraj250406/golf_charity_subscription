import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  try {
    const stripe = getStripeClient();
    if (!stripe) {
      console.error('Stripe client initialization failed.');
      return NextResponse.json({ error: 'Stripe configuration error' }, { status: 500 });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // If the payment succeeded (or subscription is active via this session)
    if (session.payment_status === 'paid' && session.metadata?.supabase_user_id) {
      const supabaseAdmin = createAdminClient();
      const userId = session.metadata.supabase_user_id;
      const planType = session.metadata.plan_type || 'monthly';
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      // Update the user's subscription in Supabase instantly
      const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'active',
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan_type: planType,
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to immediately update subscription status:', error);
      } else {
        console.log(`Successfully verified and activated subscription for user: ${userId}`);
      }
      
      return NextResponse.json({ status: 'active', verified: true });
    }

    return NextResponse.json({ status: 'pending', verified: false });

  } catch (err: any) {
    console.error('Error verifying checkout session:', err.message);
    return NextResponse.json({ error: 'Failed to verify session' }, { status: 500 });
  }
}
