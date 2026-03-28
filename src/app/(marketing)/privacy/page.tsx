import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-display-md text-on-surface mb-8">Privacy Policy</h1>
          <div className="prose prose-lg text-on-surface-variant space-y-8">
            <section>
              <h2 className="text-headline-sm text-on-surface mb-4">1. Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, items requested, delivery notes, and other information you choose to provide.</p>
            </section>
            
            <section>
              <h2 className="text-headline-sm text-on-surface mb-4">2. How We Use Your Information</h2>
              <p>We may use the information we collect about you to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Provide, maintain, and improve our Services;</li>
                <li>Process and facilitate transactions and payments;</li>
                <li>Send you related information, including confirmations and invoices;</li>
                <li>Provide customer support;</li>
                <li>Send you technical notices, updates, security alerts, and support messages.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-headline-sm text-on-surface mb-4">3. Data Security</h2>
              <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. Your payment information is securely processed by our third-party payment partner (Stripe).</p>
            </section>
            
            <section>
              <h2 className="text-headline-sm text-on-surface mb-4">4. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at privacy@paritywealth.com.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
