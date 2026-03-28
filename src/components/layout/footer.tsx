import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-surface-container-low mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-md btn-primary-gradient flex items-center justify-center text-sm font-bold text-on-primary">
                P
              </div>
              <span className="text-headline-sm text-on-surface tracking-tight">
                {APP_NAME}
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant leading-relaxed">
              Advanced analytics for the modern investor. Precision in every round, clarity in every trade.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-label-md text-label uppercase mb-4">Resources</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/how-it-works" className="text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/charities" className="text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                  Charities
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-label-md text-label uppercase mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-label-md text-label uppercase mb-4">Contact</h4>
            <p className="text-body-sm text-on-surface-variant">
              support@paritywealth.com
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-outline-variant/10">
          <p className="text-label-sm text-on-surface-variant/60 text-center">
            © {new Date().getFullYear()} {APP_NAME} Management. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
