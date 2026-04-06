'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useGoogleMaps } from '../maps/GoogleMapsProvider';
import MapPicker from '../maps/MapPicker';
import AddressSearch from '../maps/AddressSearch';
import AddressForm, { type AddressFormData } from './AddressForm';
import { createAddressAction } from '@/app/actions/address';

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 }; // Delhi fallback

interface AddressModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type Phase = 'loading-gps' | 'map' | 'form';

/* ─────────────────────────────────────────────
   Shared overlay + centered card wrapper
───────────────────────────────────────────── */
function ModalShell({
  onOverlayClick,
  children,
}: {
  onOverlayClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/30 backdrop-blur-[2px] animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onOverlayClick?.();
      }}
    >
      <div
        className="
          relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl
          flex flex-col overflow-hidden
          max-h-[90vh]
          animate-in zoom-in-95 slide-in-from-bottom-2 duration-200
        "
      >
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Shared modal header
───────────────────────────────────────────── */
function ModalHeader({
  title,
  onBack,
  onClose,
  rightLabel,
  onRight,
}: {
  title: string;
  onBack?: () => void;
  onClose: () => void;
  rightLabel?: string;
  onRight?: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
      {/* Left: back arrow or spacer */}
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Go back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
      ) : (
        <div className="w-8" />
      )}

      <h2 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h2>

      {/* Right: close X always, or a text action */}
      <div className="flex items-center gap-2">
        {rightLabel && onRight && (
          <button
            type="button"
            onClick={onRight}
            className="text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors"
          >
            {rightLabel}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function AddressModal({ onClose, onSuccess }: AddressModalProps) {
  const { isLoaded, loadError } = useGoogleMaps();

  const [phase, setPhase] = useState<Phase>('loading-gps');
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<AddressFormData>({
    label: 'Home',
    address: '',
    house: '',
    area: '',
    landmark: '',
    latitude: DEFAULT_CENTER.lat,
    longitude: DEFAULT_CENTER.lng,
  });

  // ── GPS on mount ──────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;

    if (!navigator.geolocation) {
      setPhase('map');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            setFormData(prev => ({ ...prev, address: results[0].formatted_address }));
          }
          setPhase('map');
        });
      },
      () => setPhase('map'),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, [isLoaded]);

  // ── Handlers ─────────────────────────────────
  const handleLocationChange = useCallback((lat: number, lng: number, address: string) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng, address }));
  }, []);

  const handleSearchSelect = useCallback((address: string, lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, address, latitude: lat, longitude: lng }));
  }, []);

  const handleFormChange = useCallback((partial: Partial<AddressFormData>) => {
    setFormData(prev => ({ ...prev, ...partial }));
  }, []);

  const handleConfirmLocation = () => {
    if (!formData.address) {
      setError('Please select a location on the map first');
      return;
    }
    setError('');
    setPhase('form');
  };

  const handleSave = async () => {
    if (!formData.address) {
      setError('Address is required');
      return;
    }

    setSaving(true);
    setError('');

    const res = await createAddressAction({
      label: formData.label,
      address: formData.address,
      latitude: formData.latitude,
      longitude: formData.longitude,
      house: formData.house || undefined,
      area: formData.area || undefined,
      landmark: formData.landmark || undefined,
    });

    if (res?.error) {
      setError(res.error);
      setSaving(false);
    } else {
      setSaving(false);
      onSuccess();
    }
  };

  // ── Loading / error shells ────────────────────
  if (!isLoaded || phase === 'loading-gps') {
    return (
      <ModalShell>
        <div className="flex flex-col items-center justify-center gap-5 py-16 px-8">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-slate-300 border-t-slate-800 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-900">
              {!isLoaded ? 'Loading Maps…' : 'Getting your location…'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {!isLoaded ? 'Please wait a moment' : 'Allow location access for best experience'}
            </p>
          </div>
        </div>
      </ModalShell>
    );
  }

  if (loadError) {
    return (
      <ModalShell onOverlayClick={onClose}>
        <div className="p-10 text-center">
          <p className="text-sm text-red-500 mb-4">Maps could not be loaded.</p>
          <button onClick={onClose} className="text-sm text-slate-600 hover:text-slate-900 font-medium">
            Close
          </button>
        </div>
      </ModalShell>
    );
  }

  // ── Map Phase ─────────────────────────────────
  if (phase === 'map') {
    return (
      <ModalShell onOverlayClick={onClose}>
        {/* Header */}
        <ModalHeader
          title="Choose Location"
          onClose={onClose}
          rightLabel="Skip"
          onRight={onClose}
        />

        {/* Search */}
        <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0">
          <AddressSearch
            onSelectAddress={handleSearchSelect}
            defaultValue={formData.address}
          />
        </div>

        {/* Map — fixed height inside modal */}
        <div className="relative flex-shrink-0" style={{ height: '280px' }}>
          <MapPicker
            lat={formData.latitude}
            lng={formData.longitude}
            onLocationChange={handleLocationChange}
            onGeocodingStateChange={setGeocoding}
          />
        </div>

        {/* Bottom strip */}
        <div className="px-5 py-4 border-t border-slate-100 flex-shrink-0">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium mb-3">
              {error}
            </div>
          )}

          {/* Address preview row */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {formData.address ? formData.address.split(',')[0] : 'Select a location'}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mt-0.5">
                {geocoding ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin inline-block" />
                    Finding address…
                  </span>
                ) : (
                  formData.address || 'Move the map to choose a spot'
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirmLocation}
            disabled={!formData.address || geocoding}
            className="w-full py-3.5 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-black active:scale-[0.99] transition-all disabled:opacity-40 disabled:scale-100"
          >
            Confirm Location
          </button>
        </div>
      </ModalShell>
    );
  }

  // ── Form Phase ────────────────────────────────
  return (
    <ModalShell onOverlayClick={onClose}>
      {/* Header */}
      <ModalHeader
        title="Add Address"
        onBack={() => setPhase('map')}
        onClose={onClose}
        rightLabel="Change"
        onRight={() => setPhase('map')}
      />

      {/* Mini map preview — clickable, not interactive */}
      <div
        className="relative flex-shrink-0 cursor-pointer border-b border-slate-100 overflow-hidden"
        style={{ height: '160px' }}
        onClick={() => setPhase('map')}
      >
        {/* Pointer-events blocked so map doesn't swallow the click */}
        <div className="pointer-events-none w-full h-full">
          <MapPicker
            lat={formData.latitude}
            lng={formData.longitude}
            onLocationChange={() => {}}
          />
        </div>
        {/* "Change on map" pill */}
        <div className="absolute inset-0 flex items-end justify-start p-3 z-10">
          <span className="bg-white/90 backdrop-blur-md rounded-full px-3 py-1.5 text-[10px] font-semibold text-slate-700 shadow border border-slate-100 flex items-center gap-1.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Change on map
          </span>
        </div>
      </div>

      {/* Scrollable form */}
      <div className="overflow-y-auto flex-1 px-5 py-5">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium mb-4">
            {error}
          </div>
        )}
        <AddressForm
          formData={formData}
          onChange={handleFormChange}
          geocoding={geocoding}
        />
      </div>

      {/* Sticky save footer */}
      <div className="px-5 py-4 border-t border-slate-100 flex-shrink-0">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !formData.address}
          className="w-full py-3.5 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-black active:scale-[0.99] transition-all disabled:opacity-40 disabled:scale-100 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-slate-400 border-t-white animate-spin" />
              Saving…
            </>
          ) : (
            'Save Address'
          )}
        </button>
      </div>
    </ModalShell>
  );
}
