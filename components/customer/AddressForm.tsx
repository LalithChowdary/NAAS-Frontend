'use client';

import React from 'react';

export interface AddressFormData {
  label: string;
  address: string;
  house: string;
  area: string;
  landmark: string;
  latitude: number;
  longitude: number;
}

interface AddressFormProps {
  formData: AddressFormData;
  onChange: (data: Partial<AddressFormData>) => void;
  geocoding?: boolean;
}

const LABELS = [
  { value: 'Home', icon: '🏠' },
  { value: 'Work', icon: '💼' },
  { value: 'Other', icon: '📍' },
];

export default function AddressForm({ formData, onChange, geocoding }: AddressFormProps) {
  return (
    <div className="space-y-5">
      {/* Current resolved address */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Selected Location
          </p>
          {geocoding && (
            <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-400">
              <div className="w-3 h-3 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" />
              Locating...
            </div>
          )}
        </div>
        <p className="text-sm text-slate-700 leading-relaxed min-h-[2.5rem] pl-7">
          {formData.address || (
            <span className="text-slate-300 italic">Move the map to pick a location</span>
          )}
        </p>
      </div>

      <div className="h-px bg-slate-100" />

      {/* House / Flat No */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
          House / Flat / Floor No.
        </label>
        <input
          type="text"
          value={formData.house}
          onChange={(e) => onChange({ house: e.target.value })}
          placeholder="e.g. A-204, 2nd Floor"
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all placeholder:text-slate-300"
        />
      </div>

      {/* Area / Sector */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
          Area / Sector / Locality
        </label>
        <input
          type="text"
          value={formData.area}
          onChange={(e) => onChange({ area: e.target.value })}
          placeholder="e.g. Sector 62, Noida"
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all placeholder:text-slate-300"
        />
      </div>

      {/* Landmark */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
          Landmark <span className="text-slate-300 normal-case tracking-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={formData.landmark}
          onChange={(e) => onChange({ landmark: e.target.value })}
          placeholder="e.g. Near City Mall"
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all placeholder:text-slate-300"
        />
      </div>

      <div className="h-px bg-slate-100" />

      {/* Label Tags */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Save As
        </label>
        <div className="flex gap-3">
          {LABELS.map(({ value, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ label: value })}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                formData.label === value
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-[1.02]'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span className="text-base">{icon}</span>
              {value}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
