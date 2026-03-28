export const STRIPE_PLANS = {
  monthly: {
    name: 'Monthly Membership',
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID || '',
    price: 999, // in cents
    interval: 'month' as const,
  },
  yearly: {
    name: 'Yearly Membership',
    priceId: process.env.STRIPE_YEARLY_PRICE_ID || '',
    price: 9999, // in cents
    interval: 'year' as const,
  },
} as const;

export type PlanType = keyof typeof STRIPE_PLANS;
