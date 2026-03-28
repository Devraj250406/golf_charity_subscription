export const APP_NAME = 'Parity Wealth';
export const APP_TAGLINE = 'Premium Golf & Charitable Giving';
export const APP_DESCRIPTION = 'A subscription-driven platform combining golf performance tracking, charity fundraising, and monthly prize draws.';

export const PLANS = {
  monthly: {
    name: 'Monthly',
    price: 9.99,
    priceDisplay: '$9.99',
    interval: 'month' as const,
    priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || 'price_monthly_placeholder',
    features: [
      'Enter up to 5 golf scores',
      'Monthly draw entry',
      'Support your chosen charity',
      'Performance analytics',
      'Winner notifications',
    ],
  },
  yearly: {
    name: 'Yearly',
    price: 99.99,
    priceDisplay: '$99.99',
    interval: 'year' as const,
    priceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID || 'price_yearly_placeholder',
    savings: '17%',
    features: [
      'Everything in Monthly',
      'Priority draw entries',
      'Extended performance history',
      'Exclusive charity events',
      'Premium support',
    ],
  },
} as const;

export const DRAW_TIERS = {
  '5-match': { label: '5-Number Match', percentage: 40, isJackpot: true },
  '4-match': { label: '4-Number Match', percentage: 35, isJackpot: false },
  '3-match': { label: '3-Number Match', percentage: 25, isJackpot: false },
} as const;

export const SCORE_RANGE = { min: 1, max: 45 };
export const MAX_SCORES = 5;
export const MIN_CHARITY_PERCENTAGE = 10;

export const NAV_LINKS = [
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Charities', href: '/charities' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
] as const;

export const DASHBOARD_NAV = [
  { label: 'Overview', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Scores', href: '/scores', icon: 'Target' },
  { label: 'Draws', href: '/draws', icon: 'Trophy' },
  { label: 'Charity', href: '/charity', icon: 'Heart' },
  { label: 'Winnings', href: '/winnings', icon: 'Wallet' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
] as const;

export const ADMIN_NAV = [
  { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
  { label: 'Users', href: '/admin/users', icon: 'Users' },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: 'CreditCard' },
  { label: 'Draws', href: '/admin/draws', icon: 'Trophy' },
  { label: 'Charities', href: '/admin/charities', icon: 'Heart' },
  { label: 'Winners', href: '/admin/winners', icon: 'Award' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'BarChart3' },
] as const;
