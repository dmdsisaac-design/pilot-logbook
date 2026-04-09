import React, { useState } from 'react';
import { LogOut, User, Crown, ChevronDown, CreditCard } from 'lucide-react';
import { UserProfile } from '../types';

interface UserMenuProps {
  profile: UserProfile;
  onSignOut: () => void;
  onUpgrade: () => void;
  onManageSubscription?: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ profile, onSignOut, onUpgrade, onManageSubscription }) => {
  const [open, setOpen] = useState(false);
  const isPro = profile.subscription_status === 'pro';

  return (
    <div className="dropdown dropdown-end">
      <button
        className="btn btn-ghost btn-sm gap-1"
        onClick={() => setOpen(!open)}
      >
        <User size={16} />
        <span className="text-xs max-w-[120px] truncate hidden sm:inline">
          {profile.display_name || profile.email}
        </span>
        {isPro && <span className="badge badge-primary badge-xs">PRO</span>}
        <ChevronDown size={12} />
      </button>
      {open && (
        <ul className="dropdown-content z-50 menu p-2 shadow bg-base-200 rounded-box w-56 mt-2">
          <li className="menu-title">
            <span className="text-xs truncate">{profile.email}</span>
          </li>
          <li className="menu-title">
            <span className="text-xs">
              {isPro ? '✨ Pro Plan' : `Free Plan (${profile.flight_count}/25 flights)`}
            </span>
          </li>
          {!isPro && (
            <li>
              <button onClick={() => { setOpen(false); onUpgrade(); }}>
                <Crown size={14} /> Upgrade to Pro — $4.99/mo
              </button>
            </li>
          )}
          {isPro && onManageSubscription && (
            <li>
              <button onClick={() => { setOpen(false); onManageSubscription(); }}>
                <CreditCard size={14} /> Manage Subscription
              </button>
            </li>
          )}
          <div className="divider my-0" />
          <li>
            <button onClick={() => { setOpen(false); onSignOut(); }} className="text-error">
              <LogOut size={14} /> Sign Out
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};
