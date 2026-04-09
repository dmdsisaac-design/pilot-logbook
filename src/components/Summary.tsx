import React from 'react';
import { Clock, Plane, Sun, Moon, Cloud, Navigation } from 'lucide-react';
import { TotalsSummary } from '../types';

interface SummaryProps {
  totals: TotalsSummary;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; sub?: string }> = ({
  icon,
  label,
  value,
  sub,
}) => (
  <div className="bg-base-200 rounded-lg p-3 flex items-center gap-3">
    <div className="text-primary opacity-80">{icon}</div>
    <div>
      <div className="text-lg font-bold leading-tight">{value}</div>
      <div className="text-xs text-base-content/60">{label}</div>
      {sub && <div className="text-xs text-base-content/40">{sub}</div>}
    </div>
  </div>
);

export const Summary: React.FC<SummaryProps> = ({ totals }) => {
  const fmt = (n: number) => n.toFixed(1);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <StatCard
          icon={<Clock size={20} />}
          label="Total Time"
          value={`${fmt(totals.total_time)} hrs`}
          sub={`${totals.flight_count} flights`}
        />
        <StatCard icon={<Plane size={20} />} label="PIC" value={`${fmt(totals.pic_time)} hrs`} />
        <StatCard icon={<Navigation size={20} />} label="Cross-Country" value={`${fmt(totals.cross_country)} hrs`} />
        <StatCard icon={<Moon size={20} />} label="Night" value={`${fmt(totals.night_time)} hrs`} />
        <StatCard
          icon={<Cloud size={20} />}
          label="Instrument"
          value={`${fmt(totals.actual_instrument + totals.simulated_instrument)} hrs`}
          sub={`${fmt(totals.actual_instrument)} actual / ${fmt(totals.simulated_instrument)} sim`}
        />
        <StatCard
          icon={<Sun size={20} />}
          label="Landings"
          value={`${totals.day_landings + totals.night_landings}`}
          sub={`${totals.day_landings} day / ${totals.night_landings} night`}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="table table-xs">
          <thead>
            <tr>
              <th>Category</th>
              <th className="text-right">Hours</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Total Time', totals.total_time],
              ['PIC', totals.pic_time],
              ['SIC', totals.sic_time],
              ['Dual Received', totals.dual_received],
              ['Dual Given (CFI)', totals.dual_given],
              ['Solo', totals.solo_time],
              ['Cross-Country', totals.cross_country],
              ['Night', totals.night_time],
              ['Actual IMC', totals.actual_instrument],
              ['Simulated Instrument', totals.simulated_instrument],
              ['Simulator', totals.simulator_time],
            ].map(([label, val]) => (
              <tr key={label as string}>
                <td>{label}</td>
                <td className="text-right font-mono">{(val as number).toFixed(1)}</td>
              </tr>
            ))}
            <tr>
              <td>Approaches</td>
              <td className="text-right font-mono">{totals.approaches}</td>
            </tr>
            <tr>
              <td>Day Landings</td>
              <td className="text-right font-mono">{totals.day_landings}</td>
            </tr>
            <tr>
              <td>Night Landings</td>
              <td className="text-right font-mono">{totals.night_landings}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
