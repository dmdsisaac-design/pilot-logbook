import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Sun, Moon, Cloud, AlertTriangle } from 'lucide-react';
import { FlightEntry } from '../types';

interface CurrencyTrackerProps {
  flights: FlightEntry[];
}

interface CurrencyItem {
  label: string;
  description: string;
  icon: React.ReactNode;
  current: number;
  required: number;
  unit: string;
  expiresDate: string | null;
  status: 'current' | 'warning' | 'expired';
  regulation: string;
}

function addDays(dateStr: string, days: number): Date {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(dateStr: string, months: number): Date {
  const d = new Date(dateStr + 'T00:00:00');
  d.setMonth(d.getMonth() + months);
  return d;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysUntil(d: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function computeCurrencies(flights: FlightEntry[]): CurrencyItem[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const today = now.toISOString().split('T')[0];

  // Sort flights by date descending
  const sorted = [...flights].sort((a, b) => b.date.localeCompare(a.date));

  // --- Day Landing Currency (FAR 61.57(a)) ---
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const ninetyStr = ninetyDaysAgo.toISOString().split('T')[0];

  const recentDayLandings = sorted
    .filter(f => f.date >= ninetyStr && f.date <= today)
    .reduce((sum, f) => sum + f.day_landings, 0);

  let dayLandingDates: string[] = [];
  for (const f of sorted) {
    for (let i = 0; i < f.day_landings; i++) {
      dayLandingDates.push(f.date);
    }
  }
  const dayExpiry = dayLandingDates.length >= 3 ? addDays(dayLandingDates[2], 90) : null;
  const dayDaysLeft = dayExpiry ? daysUntil(dayExpiry) : -1;

  const dayCurrency: CurrencyItem = {
    label: 'Day Passenger Currency',
    description: '3 takeoffs & landings in preceding 90 days',
    icon: <Sun size={20} />,
    current: Math.min(recentDayLandings, 3),
    required: 3,
    unit: 'landings',
    expiresDate: dayExpiry && dayDaysLeft > 0 ? formatDate(dayExpiry) : null,
    status: recentDayLandings >= 3 ? (dayDaysLeft <= 14 ? 'warning' : 'current') : 'expired',
    regulation: '14 CFR §61.57(a)',
  };

  // --- Night Landing Currency (FAR 61.57(b)) ---
  const recentNightLandings = sorted
    .filter(f => f.date >= ninetyStr && f.date <= today)
    .reduce((sum, f) => sum + f.night_landings, 0);

  let nightLandingDates: string[] = [];
  for (const f of sorted) {
    for (let i = 0; i < f.night_landings; i++) {
      nightLandingDates.push(f.date);
    }
  }
  const nightExpiry = nightLandingDates.length >= 3 ? addDays(nightLandingDates[2], 90) : null;
  const nightDaysLeft = nightExpiry ? daysUntil(nightExpiry) : -1;

  const nightCurrency: CurrencyItem = {
    label: 'Night Passenger Currency',
    description: '3 full-stop night landings in preceding 90 days',
    icon: <Moon size={20} />,
    current: Math.min(recentNightLandings, 3),
    required: 3,
    unit: 'landings',
    expiresDate: nightExpiry && nightDaysLeft > 0 ? formatDate(nightExpiry) : null,
    status: recentNightLandings >= 3 ? (nightDaysLeft <= 14 ? 'warning' : 'current') : 'expired',
    regulation: '14 CFR §61.57(b)',
  };

  // --- Instrument Currency (FAR 61.57(c)) ---
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const sixMonthStr = sixMonthsAgo.toISOString().split('T')[0];

  const recentApproaches = sorted
    .filter(f => f.date >= sixMonthStr && f.date <= today)
    .reduce((sum, f) => sum + f.approaches, 0);

  let approachDates: string[] = [];
  for (const f of sorted) {
    for (let i = 0; i < f.approaches; i++) {
      approachDates.push(f.date);
    }
  }
  const instrExpiry = approachDates.length >= 6 ? addMonths(approachDates[5], 6) : null;
  const instrDaysLeft = instrExpiry ? daysUntil(instrExpiry) : -1;

  const instrumentCurrency: CurrencyItem = {
    label: 'Instrument Currency',
    description: '6 approaches + holding in preceding 6 calendar months',
    icon: <Cloud size={20} />,
    current: Math.min(recentApproaches, 6),
    required: 6,
    unit: 'approaches',
    expiresDate: instrExpiry && instrDaysLeft > 0 ? formatDate(instrExpiry) : null,
    status: recentApproaches >= 6 ? (instrDaysLeft <= 30 ? 'warning' : 'current') : 'expired',
    regulation: '14 CFR §61.57(c)',
  };

  return [dayCurrency, nightCurrency, instrumentCurrency];
}

const StatusBadge: React.FC<{ status: 'current' | 'warning' | 'expired' }> = ({ status }) => {
  if (status === 'current') {
    return (
      <div className="badge badge-success gap-1 badge-sm">
        <ShieldCheck size={12} /> Current
      </div>
    );
  }
  if (status === 'warning') {
    return (
      <div className="badge badge-warning gap-1 badge-sm">
        <AlertTriangle size={12} /> Expiring Soon
      </div>
    );
  }
  return (
    <div className="badge badge-error gap-1 badge-sm">
      <ShieldAlert size={12} /> Not Current
    </div>
  );
};

export const CurrencyTracker: React.FC<CurrencyTrackerProps> = ({ flights }) => {
  const currencies = computeCurrencies(flights);

  if (flights.length === 0) {
    return (
      <div className="text-center text-base-content/50 py-12">
        <Shield size={40} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm">Log some flights to track your currency status.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {currencies.map((item) => (
        <div key={item.label} className="card bg-base-200">
          <div className="card-body p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="text-primary opacity-80">{item.icon}</div>
                <div>
                  <div className="font-semibold text-sm">{item.label}</div>
                  <div className="text-xs text-base-content/50">{item.regulation}</div>
                </div>
              </div>
              <StatusBadge status={item.status} />
            </div>

            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-base-content/60">{item.description}</span>
                <span className="font-mono font-semibold">
                  {item.current}/{item.required} {item.unit}
                </span>
              </div>
              <progress
                className={`progress w-full ${
                  item.status === 'current'
                    ? 'progress-success'
                    : item.status === 'warning'
                    ? 'progress-warning'
                    : 'progress-error'
                }`}
                value={item.current}
                max={item.required}
              />
            </div>

            {item.expiresDate && (
              <div className="text-xs text-base-content/50 mt-1">
                Expires: {item.expiresDate}
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="text-xs text-base-content/40 text-center mt-4 px-4">
        Currency calculations are based on FAR 61.57 requirements. Always verify your currency status independently before acting as PIC.
      </div>
    </div>
  );
};
