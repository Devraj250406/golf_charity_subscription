import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { createClient } from '@/lib/supabase/server';
import { Heart } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Charities' };

export default async function CharitiesPage() {
  const supabase = await createClient();
  const { data: charities } = await supabase
    .from('charities')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-display-md text-on-surface mb-4">Our Charity Partners</h1>
            <p className="text-headline-sm text-on-surface-variant font-normal max-w-2xl mx-auto">
              A portion of every subscription is donated to these incredible organizations. Choose yours when you sign up.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(charities || []).map((charity) => (
              <div key={charity.id} className="bg-surface-container-lowest rounded-2xl p-8 shadow-ambient hover:shadow-ambient-lg hover:-translate-y-1 transition-all duration-300">
                {charity.is_featured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-label-sm mb-4">
                    Featured Partner
                  </span>
                )}
                <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center mb-5">
                  <Heart className="w-6 h-6 text-on-surface-variant" />
                </div>
                <h3 className="text-headline-sm text-on-surface mb-3">{charity.name}</h3>
                <p className="text-body-md text-on-surface-variant leading-relaxed mb-4">{charity.description}</p>
                {charity.category && (
                  <span className="text-label-sm text-label uppercase">{charity.category}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
