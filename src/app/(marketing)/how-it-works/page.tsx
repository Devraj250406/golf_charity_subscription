import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { UserPlus, Target, Trophy, Heart } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'How It Works' };

const steps = [
  { icon: UserPlus, title: 'Sign Up & Subscribe', description: 'Create your account and choose a monthly or yearly plan. Your subscription funds the prize pool and supports a charity of your choice.' },
  { icon: Target, title: 'Log Your Scores', description: 'Record your Stableford golf scores after each round. We maintain a rolling average of your 5 most recent scores for ranking purposes.' },
  { icon: Trophy, title: 'Enter Monthly Draws', description: 'Active subscribers are automatically entered into monthly prize draws. Prizes are awarded for 5-match (Jackpot), 4-match, and 3-match tiers.' },
  { icon: Heart, title: 'Support Charities', description: 'A minimum of 10% of your subscription goes directly to your chosen charity partner. Increase your contribution percentage at any time.' },
];

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-display-md text-on-surface mb-4">How It Works</h1>
            <p className="text-headline-sm text-on-surface-variant font-normal max-w-2xl mx-auto">
              Four simple steps to elevate your game and amplify your impact.
            </p>
          </div>

          <div className="space-y-0">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="flex gap-6 pb-12 relative">
                  {/* Line */}
                  {i < steps.length - 1 && (
                    <div className="absolute left-7 top-16 bottom-0 w-px bg-outline-variant/20" />
                  )}
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 relative z-10">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  {/* Content */}
                  <div className="pt-1">
                    <p className="text-label-sm text-label uppercase mb-1">Step {i + 1}</p>
                    <h3 className="text-headline-sm text-on-surface mb-2">{step.title}</h3>
                    <p className="text-body-md text-on-surface-variant leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
