import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Plus, BarChart3, List, Download, Upload, Filter, X, Shield, Plane } from 'lucide-react';
import { FlightEntry, FlightFormData, TotalsSummary } from './types';
import { flightDb } from './db';
import { supabase, FREE_FLIGHT_LIMIT } from './lib/supabase';
import { useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { LandingPage } from './components/LandingPage';
import { FlightForm } from './components/FlightForm';
import { FlightList } from './components/FlightList';
import { Summary } from './components/Summary';
import { CurrencyTracker } from './components/CurrencyTracker';
import { InstallPrompt } from './components/InstallPrompt';
import { SubscriptionBanner } from './components/SubscriptionBanner';
import { UserMenu } from './components/UserMenu';
import { exportFlightsToCsv, downloadCsv, parseCsvToFlights } from './utils/csv';

const emptyTotals: TotalsSummary = {
  total_time: 0, pic_time: 0, sic_time: 0, dual_received: 0, dual_given: 0,
  solo_time: 0, cross_country: 0, night_time: 0, actual_instrument: 0,
  simulated_instrument: 0, simulator_time: 0, approaches: 0, day_landings: 0,
  night_landings: 0, flight_count: 0,
};

function computeTotals(flights: FlightEntry[]): TotalsSummary {
  return flights.reduce<TotalsSummary>((acc, f) => ({
    total_time: acc.total_time + (f.total_time || 0),
    pic_time: acc.pic_time + (f.pic_time || 0),
    sic_time: acc.sic_time + (f.sic_time || 0),
    dual_received: acc.dual_received + (f.dual_received || 0),
    dual_given: acc.dual_given + (f.dual_given || 0),
    solo_time: acc.solo_time + (f.solo_time || 0),
    cross_country: acc.cross_country + (f.cross_country || 0),
    night_time: acc.night_time + (f.night_time || 0),
    actual_instrument: acc.actual_instrument + (f.actual_instrument || 0),
    simulated_instrument: acc.simulated_instrument + (f.simulated_instrument || 0),
    simulator_time: acc.simulator_time + (f.simulator_time || 0),
    approaches: acc.approaches + (f.approaches || 0),
    day_landings: acc.day_landings + (f.day_landings || 0),
    night_landings: acc.night_landings + (f.night_landings || 0),
    flight_count: acc.flight_count + 1,
  }), { ...emptyTotals });
}

const App: React.FC = () => {
  const { user, profile, loading: authLoading, signIn, signUp, signOut, refreshProfile } = useAuth();
  const [flights, setFlights] = useState<FlightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFlight, setEditingFlight] = useState<FlightEntry | null>(null);
  const [tab, setTab] = useState<'flights' | 'summary' | 'currency'>('flights');
  const [aircraftFilter, setAircraftFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [importing, setImporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const loadFlights = useCallback(async () => {
    if (!user) return;
    try {
      const rows = await flightDb.getAll();
      setFlights(rows);
    } catch (err) {
      console.error('Failed to load flights:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // Safety timeout — don't spin forever if Supabase is slow
      const timeout = setTimeout(() => setLoading(false), 8000);
      loadFlights()
        .catch((err) => console.error('Flight load error:', err))
        .finally(() => { clearTimeout(timeout); setLoading(false); });
    } else {
      setFlights([]);
      setLoading(false);
    }
  }, [user, loadFlights]);

  // Check if user can add more flights
  const canAddFlight = useMemo(() => {
    if (!profile) return false;
    if (profile.subscription_status === 'pro') return true;
    return flights.length < FREE_FLIGHT_LIMIT;
  }, [profile, flights.length]);

  const handleSave = async (data: FlightFormData) => {
    if (!user) return;

    if (editingFlight) {
      const prev = flights;
      setFlights((f) => f.map((fl) => fl.id === editingFlight.id ? { ...fl, ...data } : fl));
      setShowForm(false);
      setEditingFlight(null);

      try {
        await flightDb.update(editingFlight.id!, data);
        await loadFlights();
        await refreshProfile();
        setToast('Flight updated successfully');
      } catch (err) {
        setFlights(prev);
        console.error('Failed to update flight:', err);
        setToast('Failed to update flight');
      }
    } else {
      if (!canAddFlight) {
        setToast('Flight limit reached. Upgrade to Pro for unlimited flights.');
        return;
      }

      setShowForm(false);
      try {
        await flightDb.add(data, user.id);
        await loadFlights();
        await refreshProfile();
        setToast('Flight logged successfully');
      } catch (err) {
        console.error('Failed to save flight:', err);
        setToast('Failed to save flight');
      }
    }
  };

  const handleEdit = (flight: FlightEntry) => {
    setEditingFlight(flight);
    setShowForm(true);
    setTab('flights');
  };

  const handleExportCsv = async () => {
    if (flights.length === 0) return;
    const csv = exportFlightsToCsv(flights);
    downloadCsv(csv);
    setToast('CSV exported successfully');
  };

  const aircraftTypes = useMemo(() => {
    const types = new Set(flights.map(f => f.aircraft_type).filter(Boolean));
    return Array.from(types).sort();
  }, [flights]);

  const filteredFlights = useMemo(() => {
    return flights.filter((f) => {
      if (dateFrom && f.date < dateFrom) return false;
      if (dateTo && f.date > dateTo) return false;
      if (aircraftFilter && f.aircraft_type !== aircraftFilter) return false;
      return true;
    });
  }, [flights, dateFrom, dateTo, aircraftFilter]);

  const clearFilter = () => { setDateFrom(''); setDateTo(''); setAircraftFilter(''); setShowFilter(false); };

  const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);

    try {
      const text = await file.text();
      const parsedFlights = parseCsvToFlights(text);

      if (parsedFlights.length === 0) {
        setToast('No valid flights found in CSV');
        setImporting(false);
        return;
      }

      // Check flight limit for free users
      if (profile?.subscription_status !== 'pro') {
        const allowed = FREE_FLIGHT_LIMIT - flights.length;
        if (allowed <= 0) {
          setToast('Flight limit reached. Upgrade to Pro to import.');
          setImporting(false);
          return;
        }
        if (parsedFlights.length > allowed) {
          setToast(`Can only import ${allowed} more flights on free plan. Upgrade to Pro for unlimited.`);
        }
      }

      const maxImport = profile?.subscription_status === 'pro'
        ? parsedFlights.length
        : Math.min(parsedFlights.length, FREE_FLIGHT_LIMIT - flights.length);

      let imported = 0;
      for (let i = 0; i < maxImport; i++) {
        await flightDb.add(parsedFlights[i], user.id);
        imported++;
      }

      await loadFlights();
      await refreshProfile();
      if (fileInputRef.current) fileInputRef.current.value = '';
      setToast(`CSV import complete: ${imported} flight(s) imported`);
    } catch (err) {
      console.error('Import failed:', err);
      setToast('CSV import failed. The file may have an unexpected format.');
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const prev = flights;
    setFlights((f) => f.filter((fl) => fl.id !== id));

    try {
      await flightDb.delete(id);
      await loadFlights();
      await refreshProfile();
      setToast('Flight deleted');
    } catch (err) {
      setFlights(prev);
      console.error('Failed to delete flight:', err);
      setToast('Failed to delete flight');
    }
  };

  const [showAuthPage, setShowAuthPage] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession) throw new Error('Not logged in');

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authSession.access_token}`,
          },
          body: JSON.stringify({ returnUrl: window.location.origin }),
        }
      );

      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err: any) {
      console.error('Checkout error:', err);
      setToast('Failed to start checkout. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession) throw new Error('Not logged in');

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authSession.access_token}`,
          },
          body: JSON.stringify({ returnUrl: window.location.origin }),
        }
      );

      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err: any) {
      console.error('Portal error:', err);
      setToast('Failed to open billing portal. Please try again.');
    }
  };

  // Handle Stripe redirect success/cancel
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setToast('🎉 Welcome to Pro! Unlimited flights are now unlocked.');
      window.history.replaceState({}, '', window.location.pathname);
      // Refresh profile to pick up new subscription
      setTimeout(() => refreshProfile(), 2000);
    } else if (params.get('canceled') === 'true') {
      setToast('Checkout canceled. No charges were made.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const totals = computeTotals(filteredFlights);
  const isFiltered = dateFrom || dateTo || aircraftFilter;

  // If not logged in (or still checking), show landing or auth page
  if (!user) {
    if (showAuthPage) {
      return <Auth onSignIn={signIn} onSignUp={signUp} />;
    }
    return (
      <LandingPage
        onGetStarted={() => setShowAuthPage(true)}
        onSignIn={() => setShowAuthPage(true)}
      />
    );
  }

  // Show brief loading only when fetching flights (max 8 seconds)
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="text-sm text-base-content/50">Loading your flights...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24">
      {/* Header with User Menu */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Plane size={24} className="text-primary" />
          <h1 className="text-lg font-bold">Pilot Logbook</h1>
        </div>
        {profile && (
          <UserMenu profile={profile} onSignOut={signOut} onUpgrade={handleUpgrade} onManageSubscription={handleManageSubscription} />
        )}
      </div>

      {/* Subscription Banner */}
      {profile && (
        <SubscriptionBanner
          flightCount={flights.length}
          subscriptionStatus={profile.subscription_status}
          onUpgrade={handleUpgrade}
        />
      )}

      {/* Tabs & Add Button */}
      <div className="flex items-center justify-between mb-4">
        <div role="tablist" className="tabs tabs-boxed">
          <button
            role="tab"
            className={`tab gap-1 ${tab === 'flights' ? 'tab-active' : ''}`}
            onClick={() => setTab('flights')}
          >
            <List size={14} /> Flights
          </button>
          <button
            role="tab"
            className={`tab gap-1 ${tab === 'summary' ? 'tab-active' : ''}`}
            onClick={() => setTab('summary')}
          >
            <BarChart3 size={14} /> Totals
          </button>
          <button
            role="tab"
            className={`tab gap-1 ${tab === 'currency' ? 'tab-active' : ''}`}
            onClick={() => setTab('currency')}
          >
            <Shield size={14} /> Currency
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {!showForm && (
            <button
              className={`btn btn-ghost btn-sm gap-1 ${isFiltered ? 'text-primary' : ''}`}
              onClick={() => setShowFilter(!showFilter)}
              title="Filter flights"
            >
              <Filter size={16} /> <span className="hidden sm:inline">Filter</span>
            </button>
          )}
          {flights.length > 0 && !showForm && (
            <button className="btn btn-ghost btn-sm gap-1" onClick={handleExportCsv} title="Export to CSV">
              <Download size={16} /> <span className="hidden sm:inline">Export</span>
            </button>
          )}
          {!showForm && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleImportCsv}
              />
              <button
                className="btn btn-outline btn-sm gap-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                title="Import flights from CSV"
              >
                {importing ? <span className="loading loading-spinner loading-xs" /> : <Upload size={16} />}
                <span className="hidden sm:inline">Import CSV</span>
              </button>
            </>
          )}
          {!showForm && (
            <button
              className="btn btn-primary btn-sm gap-1"
              onClick={() => { setEditingFlight(null); setShowForm(true); setTab('flights'); }}
              disabled={!canAddFlight}
            >
              <Plus size={16} /> Log Flight
            </button>
          )}
        </div>
      </div>

      {/* Date Range Filter */}
      {showFilter && !showForm && (
        <div className="flex items-center gap-2 mb-4 bg-base-200 rounded-lg px-3 py-2 flex-wrap">
          <span className="text-xs font-semibold text-base-content/60">From</span>
          <input
            type="date"
            className="input input-xs input-bordered w-36"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <span className="text-xs font-semibold text-base-content/60">To</span>
          <input
            type="date"
            className="input input-xs input-bordered w-36"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          {aircraftTypes.length > 0 && (
            <>
              <span className="text-xs font-semibold text-base-content/60"><Plane size={12} /></span>
              <select
                className="select select-xs select-bordered w-40"
                value={aircraftFilter}
                onChange={(e) => setAircraftFilter(e.target.value)}
              >
                <option value="">All Aircraft</option>
                {aircraftTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </>
          )}
          {isFiltered && (
            <button className="btn btn-ghost btn-xs" onClick={clearFilter} title="Clear filter">
              <X size={14} /> Clear
            </button>
          )}
          {isFiltered && (
            <span className="text-xs text-base-content/50 ml-auto">
              {filteredFlights.length} of {flights.length} flights
            </span>
          )}
        </div>
      )}

      {/* Quick Stats Bar */}
      {flights.length > 0 && tab === 'flights' && !showForm && (
        <div className="flex gap-4 mb-4 text-sm text-base-content/60 bg-base-200 rounded-lg px-3 py-2">
          <span><strong className="text-base-content">{totals.total_time.toFixed(1)}</strong> total hrs</span>
          <span><strong className="text-base-content">{totals.flight_count}</strong> flights</span>
          <span><strong className="text-base-content">{totals.day_landings + totals.night_landings}</strong> landings</span>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="card bg-base-200 mb-4">
          <div className="card-body p-4">
            <FlightForm onSave={handleSave} onCancel={() => { setShowForm(false); setEditingFlight(null); }} initialData={editingFlight} />
          </div>
        </div>
      )}

      {/* Content */}
      {tab === 'flights' && <FlightList flights={filteredFlights} onDelete={handleDelete} onEdit={handleEdit} />}
      {tab === 'summary' && <Summary totals={totals} />}
      {tab === 'currency' && <CurrencyTracker flights={flights} />}

      {/* Install Prompt */}
      <InstallPrompt />

      {/* Toast Notification */}
      {toast && (
        <div className="toast toast-end toast-bottom">
          <div className="alert alert-success">
            <span>{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
