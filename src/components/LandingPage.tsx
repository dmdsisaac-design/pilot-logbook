import React from 'react';
import {
  Plane, Clock, Shield, Download, Upload, Filter,
  CheckCircle, ChevronRight, Star, Smartphone, Cloud,
  BarChart3, Zap, ArrowRight
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
  return (
    <div className="min-h-screen bg-base-300">
      {/* Nav */}
      <nav className="navbar bg-base-100/80 backdrop-blur-md sticky top-0 z-50 border-b border-base-content/5">
        <div className="max-w-6xl mx-auto w-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane size={28} className="text-primary" />
            <span className="text-xl font-bold">MyFlightLog</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost btn-sm" onClick={onSignIn}>
              Sign In
            </button>
            <button className="btn btn-primary btn-sm" onClick={onGetStarted}>
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Zap size={14} />
            Digital pilot logbook — always with you
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Your Flight Time.{' '}
            <span className="text-primary">Logged Right.</span>
          </h1>
          <p className="text-lg md:text-xl text-base-content/60 max-w-2xl mx-auto mb-8">
            Stop wrestling with paper logbooks and spreadsheets. Log flights in seconds,
            track currency, export to CSV, and access your hours from any device.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button className="btn btn-primary btn-lg gap-2 shadow-lg shadow-primary/25" onClick={onGetStarted}>
              Start Logging Free <ArrowRight size={18} />
            </button>
            <p className="text-sm text-base-content/40">No credit card required · 25 flights free</p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-base-100 border-y border-base-content/5 py-8">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-primary">✈️</div>
            <div className="text-sm text-base-content/60 mt-1">Log any aircraft type</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">📱</div>
            <div className="text-sm text-base-content/60 mt-1">Works on any device</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">☁️</div>
            <div className="text-sm text-base-content/60 mt-1">Cloud synced & backed up</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Everything a pilot needs</h2>
            <p className="text-base-content/60 max-w-xl mx-auto">
              Built by pilots, for pilots. All the features of a traditional logbook, plus the power of digital.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Clock size={24} />}
              title="Detailed Flight Logging"
              description="PIC, SIC, dual received, dual given, solo, cross-country, night, instrument — every category tracked."
            />
            <FeatureCard
              icon={<Shield size={24} />}
              title="Currency Tracking"
              description="Stay current with automatic tracking of day/night landing currency, instrument currency, and flight reviews."
            />
            <FeatureCard
              icon={<BarChart3 size={24} />}
              title="Totals & Statistics"
              description="Instant totals across all time categories. See your hours at a glance, filtered by date or aircraft."
            />
            <FeatureCard
              icon={<Filter size={24} />}
              title="Smart Filtering"
              description="Filter by date range, aircraft type, or any combination. Find exactly the flights you need."
            />
            <FeatureCard
              icon={<Download size={24} />}
              title="CSV Export"
              description="Export your entire logbook to CSV anytime. Your data is always yours — no lock-in."
            />
            <FeatureCard
              icon={<Upload size={24} />}
              title="CSV Import"
              description="Switching from another logbook? Import your existing flights from CSV in seconds."
            />
            <FeatureCard
              icon={<Cloud size={24} />}
              title="Cloud Sync"
              description="Your flights are securely stored in the cloud and synced across all your devices."
            />
            <FeatureCard
              icon={<Smartphone size={24} />}
              title="Install as App"
              description="Add to your home screen for a native app experience. Works offline too."
            />
            <FeatureCard
              icon={<Zap size={24} />}
              title="Lightning Fast"
              description="No bloat. No ads. Just a clean, fast logbook that gets out of your way."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-base-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Simple, honest pricing</h2>
            <p className="text-base-content/60">Start free. Upgrade when you need more.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <div className="card bg-base-200 border border-base-content/10">
              <div className="card-body">
                <h3 className="text-lg font-bold">Free</h3>
                <div className="my-3">
                  <span className="text-4xl font-extrabold">$0</span>
                  <span className="text-base-content/50 ml-1">forever</span>
                </div>
                <p className="text-sm text-base-content/60 mb-4">Perfect for student pilots and occasional flyers.</p>
                <ul className="space-y-2 mb-6">
                  <PricingItem text="25 flight entries" />
                  <PricingItem text="Full flight logging" />
                  <PricingItem text="Currency tracking" />
                  <PricingItem text="CSV export & import" />
                  <PricingItem text="Cloud sync" />
                  <PricingItem text="Install as app" />
                </ul>
                <button className="btn btn-outline btn-block" onClick={onGetStarted}>
                  Get Started
                </button>
              </div>
            </div>

            {/* Pro */}
            <div className="card bg-primary/5 border-2 border-primary relative">
              <div className="absolute -top-3 right-4">
                <span className="badge badge-primary badge-sm gap-1">
                  <Star size={10} /> Most Popular
                </span>
              </div>
              <div className="card-body">
                <h3 className="text-lg font-bold">Pro</h3>
                <div className="my-3">
                  <span className="text-4xl font-extrabold">$4.99</span>
                  <span className="text-base-content/50 ml-1">/month</span>
                </div>
                <p className="text-sm text-base-content/60 mb-4">For active pilots who need unlimited logging.</p>
                <ul className="space-y-2 mb-6">
                  <PricingItem text="Unlimited flight entries" highlight />
                  <PricingItem text="Everything in Free" />
                  <PricingItem text="Priority support" />
                  <PricingItem text="Cancel anytime" />
                </ul>
                <button className="btn btn-primary btn-block" onClick={onGetStarted}>
                  Start Free, Upgrade Later
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Plane size={48} className="text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to ditch the paper logbook?</h2>
          <p className="text-base-content/60 mb-8 text-lg">
            Join pilots who've made the switch to digital. Your first 25 flights are on us.
          </p>
          <button className="btn btn-primary btn-lg gap-2 shadow-lg shadow-primary/25" onClick={onGetStarted}>
            Create Free Account <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-base-100 border-t border-base-content/5 py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Plane size={18} className="text-primary" />
            <span className="font-semibold">MyFlightLog</span>
          </div>
          <p className="text-sm text-base-content/40">
            © {new Date().getFullYear()} MyFlightLog. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-base-content/50">
            <a href="mailto:support@myflightlog.site" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({
  icon, title, description,
}) => (
  <div className="card bg-base-100 border border-base-content/5 hover:border-primary/30 transition-colors">
    <div className="card-body p-5">
      <div className="text-primary mb-2">{icon}</div>
      <h3 className="font-bold text-sm">{title}</h3>
      <p className="text-sm text-base-content/60">{description}</p>
    </div>
  </div>
);

const PricingItem: React.FC<{ text: string; highlight?: boolean }> = ({ text, highlight }) => (
  <li className="flex items-center gap-2 text-sm">
    <CheckCircle size={16} className={highlight ? 'text-primary' : 'text-success'} />
    <span className={highlight ? 'font-semibold' : ''}>{text}</span>
  </li>
);
