'use client';

import { useFormStatus } from 'react-dom';
import { ArrowRight, Loader2 } from 'lucide-react';

interface CheckoutButtonProps {
  className?: string;
  showIcon?: boolean;
}

export function CheckoutButton({ className, showIcon }: CheckoutButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full ${className} ${pending ? 'opacity-70 pointer-events-none' : ''}`}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Processing...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          Get Started
          {showIcon && <ArrowRight className="w-4 h-4" />}
        </span>
      )}
    </button>
  );
}
