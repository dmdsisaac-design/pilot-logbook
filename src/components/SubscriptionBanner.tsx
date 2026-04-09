import React from 'react';
import { Crown, AlertTriangle } from 'lucide-react';
import { FREE_FLIGHT_LIMIT } from '../lib/supabase';

interface SubscriptionBannerProps {
  flightCount: number;
  subscriptionStatus: string;
  onUpgrade: () => void;
}

export const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({
  flightCount,
  subscriptionStatus,
  onUpgrade,
}) => {
  if (subscriptionStatus === 'pro') return null;

  const remaining = FREE_FLIGHT_LIMIT - flightCount;
  const atLimit = remaining <= 0;
  const nearLimit = remaining <= 5 && remaining > 0;

  if (!atLimit && !nearLimit) return null;

  return (
    <div className={`alert ${atLimit ? 'alert-error' : 'alert-warning'} mb-4`}>
      {atLimit ? <AlertTriangle size={20} /> : <Crown size={20} />}
      <div>
        <h3 className="font-bold text-sm">
          {atLimit ? 'Flight limit reached' : `${remaining} free flights remaining`}
        </h3>
        <p className="text-xs">
          {atLimit
            ? 'Upgrade to Pro for unlimited flight logging.'
            : 'Upgrade to Pro for unlimited flights at $4.99/month.'}
        </p>
      </div>
      <button className="btn btn-sm btn-primary" onClick={onUpgrade}>
        <Crown size={14} /> Upgrade to Pro
      </button>
    </div>
  );
};
