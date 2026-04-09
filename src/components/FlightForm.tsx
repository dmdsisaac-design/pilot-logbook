import React, { useState } from 'react';
import { Plus, X, Save } from 'lucide-react';
import { FlightFormData } from '../types';

interface FlightFormProps {
  onSave: (data: FlightFormData) => void;
  onCancel: () => void;
  initialData?: FlightFormData | null;
}

const emptyForm: FlightFormData = {
  date: new Date().toISOString().slice(0, 10),
  aircraft_type: '',
  aircraft_ident: '',
  route_from: '',
  route_to: '',
  route_via: '',
  total_time: 0,
  pic_time: 0,
  sic_time: 0,
  dual_received: 0,
  dual_given: 0,
  solo_time: 0,
  cross_country: 0,
  night_time: 0,
  actual_instrument: 0,
  simulated_instrument: 0,
  simulator_time: 0,
  approaches: 0,
  day_landings: 0,
  night_landings: 0,
  remarks: '',
};

const NumField: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: string;
  isInteger?: boolean;
}> = ({ label, value, onChange, step = '0.1', isInteger }) => (
  <div>
    <label className="text-xs text-base-content/60 block mb-1">{label}</label>
    <input
      type="number"
      className="input input-bordered input-sm w-full"
      value={value || ''}
      min="0"
      step={isInteger ? '1' : step}
      onChange={(e) => onChange(isInteger ? parseInt(e.target.value) || 0 : parseFloat(e.target.value) || 0)}
    />
  </div>
);

export const FlightForm: React.FC<FlightFormProps> = ({ onSave, onCancel, initialData }) => {
  const isEditing = !!initialData;
  const [form, setForm] = useState<FlightFormData>(initialData || emptyForm);

  const set = <K extends keyof FlightFormData>(key: K, val: FlightFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.aircraft_type || form.total_time <= 0) return;
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Flight Info */}
      <div className="text-sm font-semibold text-base-content/60 uppercase tracking-wide">Flight Info</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="text-xs text-base-content/60 block mb-1">Date *</label>
          <input
            type="date"
            className="input input-bordered input-sm w-full"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-xs text-base-content/60 block mb-1">Aircraft Type *</label>
          <input
            type="text"
            className="input input-bordered input-sm w-full"
            placeholder="C172"
            value={form.aircraft_type}
            onChange={(e) => set('aircraft_type', e.target.value.toUpperCase())}
            required
          />
        </div>
        <div>
          <label className="text-xs text-base-content/60 block mb-1">Aircraft Ident</label>
          <input
            type="text"
            className="input input-bordered input-sm w-full"
            placeholder="N12345"
            value={form.aircraft_ident}
            onChange={(e) => set('aircraft_ident', e.target.value.toUpperCase())}
          />
        </div>
        <div>
          <label className="text-xs text-base-content/60 block mb-1">Total Time *</label>
          <input
            type="number"
            className="input input-bordered input-sm w-full"
            value={form.total_time || ''}
            min="0"
            step="0.1"
            onChange={(e) => set('total_time', parseFloat(e.target.value) || 0)}
            required
          />
        </div>
      </div>

      {/* Route */}
      <div className="text-sm font-semibold text-base-content/60 uppercase tracking-wide">Route</div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-base-content/60 block mb-1">From</label>
          <input
            type="text"
            className="input input-bordered input-sm w-full"
            placeholder="KJFK"
            value={form.route_from}
            onChange={(e) => set('route_from', e.target.value.toUpperCase())}
          />
        </div>
        <div>
          <label className="text-xs text-base-content/60 block mb-1">Via</label>
          <input
            type="text"
            className="input input-bordered input-sm w-full"
            placeholder="V16 ALB"
            value={form.route_via}
            onChange={(e) => set('route_via', e.target.value.toUpperCase())}
          />
        </div>
        <div>
          <label className="text-xs text-base-content/60 block mb-1">To</label>
          <input
            type="text"
            className="input input-bordered input-sm w-full"
            placeholder="KBOS"
            value={form.route_to}
            onChange={(e) => set('route_to', e.target.value.toUpperCase())}
          />
        </div>
      </div>

      {/* Time Categories */}
      <div className="text-sm font-semibold text-base-content/60 uppercase tracking-wide">Time Categories</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <NumField label="PIC" value={form.pic_time} onChange={(v) => set('pic_time', v)} />
        <NumField label="SIC" value={form.sic_time} onChange={(v) => set('sic_time', v)} />
        <NumField label="Dual Received" value={form.dual_received} onChange={(v) => set('dual_received', v)} />
        <NumField label="Dual Given" value={form.dual_given} onChange={(v) => set('dual_given', v)} />
        <NumField label="Solo" value={form.solo_time} onChange={(v) => set('solo_time', v)} />
        <NumField label="Cross-Country" value={form.cross_country} onChange={(v) => set('cross_country', v)} />
        <NumField label="Night" value={form.night_time} onChange={(v) => set('night_time', v)} />
      </div>

      {/* Instrument */}
      <div className="text-sm font-semibold text-base-content/60 uppercase tracking-wide">Instrument</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <NumField label="Actual IMC" value={form.actual_instrument} onChange={(v) => set('actual_instrument', v)} />
        <NumField label="Simulated" value={form.simulated_instrument} onChange={(v) => set('simulated_instrument', v)} />
        <NumField label="Simulator" value={form.simulator_time} onChange={(v) => set('simulator_time', v)} />
        <NumField label="Approaches" value={form.approaches} onChange={(v) => set('approaches', v)} step="1" isInteger />
      </div>

      {/* Landings */}
      <div className="text-sm font-semibold text-base-content/60 uppercase tracking-wide">Landings</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <NumField label="Day Landings" value={form.day_landings} onChange={(v) => set('day_landings', v)} step="1" isInteger />
        <NumField label="Night Landings" value={form.night_landings} onChange={(v) => set('night_landings', v)} step="1" isInteger />
      </div>

      {/* Remarks */}
      <div>
        <label className="text-xs text-base-content/60 block mb-1">Remarks</label>
        <textarea
          className="textarea textarea-bordered w-full text-sm"
          rows={2}
          placeholder="Notes, endorsements, etc."
          value={form.remarks}
          onChange={(e) => set('remarks', e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
          <X size={16} /> Cancel
        </button>
        <button type="submit" className="btn btn-primary btn-sm">
          {isEditing ? <><Save size={16} /> Update Flight</> : <><Plus size={16} /> Log Flight</>}
        </button>
      </div>
    </form>
  );
};
