import { Metadata } from 'next';
import Link from 'next/link';
import { Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Forgot Password | Parity Wealth',
  description: 'Reset your password to regain access to your Parity Wealth account.',
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-surface p-4 relative overflow-hidden">
      {/* Background gradients aligned with login/signup */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full mix-blend-multiply opacity-70" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 blur-[120px] rounded-full mix-blend-multiply opacity-70" />

      <div className="w-full max-w-md bg-surface-container-lowest/80 backdrop-blur-xl p-8 rounded-3xl shadow-ambient relative z-10 border border-outline/10">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block mb-8">
            <span className="text-display-sm text-primary font-bold tracking-tight">Parity</span>
          </Link>
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-headline-md text-on-surface mb-2">Forgot Password?</h1>
          <p className="text-body-md text-on-surface-variant">
            Enter the email associated with your account and we'll send you a link to reset your password.
          </p>
        </div>

        <form className="space-y-5" action="/api/auth/reset-password" method="POST">
          <div className="space-y-2">
            <label htmlFor="email" className="text-label-md text-on-surface font-medium block">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 bg-surface-container rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/50"
              placeholder="Enter your email"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-medium shadow-sm hover:opacity-90 hover:shadow-md transition-all pt-1 mt-6"
          >
            Send Reset Link
          </button>
        </form>

        <div className="mt-8 text-center pb-2">
          <Link href="/login" className="text-body-md text-on-surface-variant hover:text-primary transition-colors font-medium">
            &larr; Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
