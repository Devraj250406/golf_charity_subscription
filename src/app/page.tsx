import Link from 'next/link';
import { ArrowRight, Target, Trophy, Heart } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-surface -z-10" />
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[600px] bg-primary/20 blur-[120px] rounded-full point-events-none -z-10" />
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[500px] bg-secondary/10 blur-[100px] rounded-full point-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/20 mb-8 animate-fade-in">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-label-sm text-on-surface uppercase tracking-wider">
                  The New Standard in Golf Charity
                </span>
              </div>
              
              <h1 className="text-display-lg text-on-surface mb-6 animate-fade-in [animation-delay:100ms]">
                Elevate your game. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  Amplify your impact.
                </span>
              </h1>
              
              <p className="text-headline-sm text-on-surface-variant mb-10 leading-relaxed font-normal animate-fade-in [animation-delay:200ms]">
                A premium subscription platform connecting golf performance with charitable giving. Track your scores, compete in monthly draws, and support causes that matter.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in [animation-delay:300ms]">
                <Link
                  href="/signup"
                  className="btn-primary-gradient px-8 py-4 rounded-md text-body-lg font-medium flex items-center justify-center gap-2 group transition-all hover:shadow-[0_0_20px_rgba(0,85,255,0.4)]"
                >
                  Join the Club
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/how-it-works"
                  className="px-8 py-4 rounded-md bg-surface-container-lowest text-on-surface border border-outline-variant/20 text-body-lg font-medium flex items-center justify-center hover:bg-surface-container-low transition-colors"
                >
                  How it Works
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-2xl bg-surface-container-low shadow-ambient group">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-headline-sm text-on-surface mb-3">Performance Tracking</h3>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Log your rounds using the Stableford system. Your rolling 5-score average automatically determines your ranking in the monthly draws.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-2xl bg-surface-container-low shadow-ambient group">
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Trophy className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="text-headline-sm text-on-surface mb-3">Monthly Prize Draws</h3>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Compete for massive cash pools including Jackpots and tiered matching prizes based on your verified performance algorithms.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-2xl bg-surface-container-low shadow-ambient group">
                <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Heart className="w-7 h-7 text-emerald-500" />
                </div>
                <h3 className="text-headline-sm text-on-surface mb-3">Charitable Giving</h3>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  A portion of your monthly subscription is automatically directed to the partnered charity of your choice, making every round count.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
