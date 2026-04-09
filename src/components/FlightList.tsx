import React from 'react';
import { Trash2, Plane, MapPin, Pencil } from 'lucide-react';
import { FlightEntry } from '../types';

interface FlightListProps {
  flights: FlightEntry[];
  onDelete: (id: string) => void;
  onEdit: (flight: FlightEntry) => void;
}

const fmt = (n: number) => (n > 0 ? n.toFixed(1) : '—');

export const FlightList: React.FC<FlightListProps> = ({ flights, onDelete, onEdit }) => {
  if (flights.length === 0) {
    return (
      <div className="text-center py-12 text-base-content/40">
        <Plane size={48} className="mx-auto mb-3 opacity-40" />
        <p className="text-lg">No flights logged yet</p>
        <p className="text-sm">Tap "Log Flight" to add your first entry</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {flights.map((f) => (
        <div key={f.id} className="card bg-base-200">
          <div className="card-body p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm text-base-content/60">{f.date}</span>
                  <span className="badge badge-primary badge-sm">{f.aircraft_type}</span>
                  {f.aircraft_ident && (
                    <span className="badge badge-outline badge-sm">{f.aircraft_ident}</span>
                  )}
                  <span className="font-semibold text-sm">{f.total_time.toFixed(1)} hrs</span>
                </div>

                {(f.route_from || f.route_to) && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-base-content/60">
                    <MapPin size={12} className="opacity-60 shrink-0" />
                    <span>
                      {f.route_from || '???'}
                      {f.route_via ? ` → ${f.route_via}` : ''}
                      {' → '}
                      {f.route_to || '???'}
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-xs text-base-content/60">
                  {f.pic_time > 0 && <span>PIC {fmt(f.pic_time)}</span>}
                  {f.sic_time > 0 && <span>SIC {fmt(f.sic_time)}</span>}
                  {f.dual_received > 0 && <span>Dual Rcvd {fmt(f.dual_received)}</span>}
                  {f.dual_given > 0 && <span>CFI {fmt(f.dual_given)}</span>}
                  {f.solo_time > 0 && <span>Solo {fmt(f.solo_time)}</span>}
                  {f.cross_country > 0 && <span>XC {fmt(f.cross_country)}</span>}
                  {f.night_time > 0 && <span>Night {fmt(f.night_time)}</span>}
                  {f.actual_instrument > 0 && <span>IMC {fmt(f.actual_instrument)}</span>}
                  {f.simulated_instrument > 0 && <span>Sim Inst {fmt(f.simulated_instrument)}</span>}
                  {f.approaches > 0 && <span>{f.approaches} apch</span>}
                  {(f.day_landings > 0 || f.night_landings > 0) && (
                    <span>Ldg {f.day_landings}D/{f.night_landings}N</span>
                  )}
                </div>

                {f.remarks && (
                  <p className="text-xs text-base-content/50 mt-1 italic truncate">{f.remarks}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => onEdit(f)}
                  title="Edit flight"
                >
                  <Pencil size={14} />
                </button>
                <button
                  className="btn btn-ghost btn-xs text-error"
                  onClick={() => onDelete(f.id!)}
                  title="Delete flight"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
