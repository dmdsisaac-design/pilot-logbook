import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const FREE_FLIGHT_LIMIT = 25;

interface SubscriptionState {
  plan: 'free' | 'pro';
  status: string;
  flightCount: number;
  canAddFlight: boolean;
  remainingFlights: number | null; // null = unlimited
  loading: boolean;
  checkoutLoading: boolean;
}

export function useSubscription(userId: string | undefined) {
  const [state, setState] = useState<SubscriptionState>({
    plan: 'free',
    status: 'none',
    flightCount: 0,
    canAddFlight: true,
    remainingFlights: FREE_FLIGHT_LIMIT,
    loading: true,
    checkoutLoading: false,
  });

  const refresh = useCallback(async () => {
    if (!userId) return;

    // Get subscription status
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', userId)
      .single();

    const plan = sub?.plan === 'pro' && sub?.status === 'active' ? 'pro' : 'free';

    // Count flights
    const { count } = await supabase
      .from('flights')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const flightCount = count ?? 0;
    const canAddFlight = plan === 'pro' || flightCount < FREE_FLIGHT_LIMIT;
    const remainingFlights = plan === 'pro' ? null : Math.max(0, FREE_FLIGHT_LIMIT - flightCount);

    setState({
      plan,
      status: sub?.status ?? 'none',
      flightCount,
      canAddFlight,
      remainingFlights,
      loading: false,
      checkoutLoading: false,
    });
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const startCheckout = async () => {
    setState(prev => ({ ...prev, checkoutLoading: true }));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not logged in');

      const res = await fetch(
        `https://zasnddoouxasktatqzvf.supabase.co/functions/v1/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ returnUrl: window.location.origin }),
        }
      );

      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err);
      setState(prev => ({ ...prev, checkoutLoading: false }));
    }
  };

  const manageSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not logged in');

      const res = await fetch(
        `https://zasnddoouxasktatqzvf.supabase.co/functions/v1/create-portal-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ returnUrl: window.location.origin }),
        }
      );

      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err) {
      console.error('Portal error:', err);
    }
  };

  return { ...state, startCheckout, manageSubscription, refresh };
}
