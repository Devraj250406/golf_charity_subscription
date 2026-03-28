import Stripe from 'stripe';

export const getStripeClient = () => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey || stripeSecretKey.includes('your_stripe_secret_key')) {
    console.error('Missing or invalid STRIPE_SECRET_KEY. Cannot initialize Stripe client.');
    return null;
  }
  
  return new Stripe(stripeSecretKey, {
    typescript: true,
  });
};
