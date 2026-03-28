import type { Metadata } from 'next';
import { SignupForm } from '@/components/auth/signup-form';

export const metadata: Metadata = {
  title: 'Create Account',
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <SignupForm />
    </div>
  );
}
