import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateLong(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function getScoreTrend(scores: number[]): 'up' | 'down' | 'stable' {
  if (scores.length < 2) return 'stable';
  const recent = scores[0];
  const previous = scores[1];
  if (recent > previous) return 'up';
  if (recent < previous) return 'down';
  return 'stable';
}

export function calculateAverage(scores: number[]): number {
  if (scores.length === 0) return 0;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
}

export function getSubscriptionStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'text-green-600 bg-green-50';
    case 'inactive': return 'text-gray-500 bg-gray-50';
    case 'cancelled': return 'text-red-600 bg-red-50';
    case 'past_due': return 'text-amber-600 bg-amber-50';
    default: return 'text-gray-500 bg-gray-50';
  }
}

export function getMatchTypeLabel(type: string): string {
  switch (type) {
    case '5-match': return '5-Number Match (Jackpot)';
    case '4-match': return '4-Number Match';
    case '3-match': return '3-Number Match';
    default: return type;
  }
}

export function getMatchTypePercentage(type: string): number {
  switch (type) {
    case '5-match': return 40;
    case '4-match': return 35;
    case '3-match': return 25;
    default: return 0;
  }
}
