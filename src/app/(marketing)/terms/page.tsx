import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Terms of Service',
};

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-display-md text-on-surface mb-8">Terms of Service</h1>
          <div className="prose prose-lg text-on-surface-variant space-y-8">
            <section>
              <h2 className="text-headline-sm text-on-surface mb-4">1. Agreement to Terms</h2>
              <p>By accessing or using our platform, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.</p>
            </section>
            
            <section>
              <h2 className="text-headline-sm text-on-surface mb-4">2. Subscription and Billing</h2>
              <p>You agree to pay all fees or charges to your account in accordance with the fees, charges, and billing terms in effect at the time a fee or charge is due and payable. Your subscription will renew automatically unless canceled before the next billing cycle. Prize distributions are conducted through automated draws based on score entries matching the generated winning numbers.</p>
            </section>
            
            <section>
              <h2 className="text-headline-sm text-on-surface mb-4">3. Accounts</h2>
              <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
            </section>
            
            <section>
              <h2 className="text-headline-sm text-on-surface mb-4">4. Limitation of Liability</h2>
              <p>In no event shall Parity Wealth, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
