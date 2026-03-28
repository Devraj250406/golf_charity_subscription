import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Shield, Zap, Users } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-display-md text-on-surface mb-4">About Parity Wealth</h1>
            <p className="text-headline-sm text-on-surface-variant font-normal max-w-2xl mx-auto">
              We believe golf should be a force for good. Our platform unifies competitive play with meaningful charity contributions.
            </p>
          </div>

          <div className="prose prose-lg max-w-none mb-20">
            <div className="bg-surface-container-lowest rounded-2xl p-10 shadow-ambient mb-12">
              <h2 className="text-headline-md text-on-surface mb-4">Our Mission</h2>
              <p className="text-body-lg text-on-surface-variant leading-relaxed">
                Parity Wealth Management was founded with a singular vision: to create a platform where the thrill of golf competition meets the power of collective philanthropy. Every subscriber contributes to a shared prize pool while simultaneously supporting the charitable causes closest to their heart.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-headline-sm text-on-surface mb-2">Transparent</h3>
              <p className="text-body-sm text-on-surface-variant">Every draw is verifiable. Every charity donation is tracked and reported.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="text-headline-sm text-on-surface mb-2">Fair</h3>
              <p className="text-body-sm text-on-surface-variant">Our algorithm-based draw system ensures equal opportunity for every active member.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="text-headline-sm text-on-surface mb-2">Community</h3>
              <p className="text-body-sm text-on-surface-variant">Built by golfers, for golfers. Join a growing community of impact-driven players.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
