'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap } from '@react-google-maps/api';

interface MapPickerProps {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number, address: string) => void;
  onGeocodingStateChange?: (loading: boolean) => void;
}

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 }; // Delhi fallback

const mapStyles: google.maps.MapTypeStyle[] = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
];

export default function MapPicker({ lat, lng, onLocationChange, onGeocodingStateChange }: MapPickerProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [mapCenter, setMapCenter] = useState({ lat: lat || DEFAULT_CENTER.lat, lng: lng || DEFAULT_CENTER.lng });

  useEffect(() => {
    geocoderRef.current = new google.maps.Geocoder();
  }, []);

  // Sync external lat/lng changes to map center (e.g., from autocomplete)
  useEffect(() => {
    if (lat && lng && mapRef.current) {
      const current = mapRef.current.getCenter();
      if (current) {
        const dist = Math.abs(current.lat() - lat) + Math.abs(current.lng() - lng);
        if (dist > 0.0001) {
          mapRef.current.panTo({ lat, lng });
          setMapCenter({ lat, lng });
        }
      }
    }
  }, [lat, lng]);

  const reverseGeocode = useCallback((latitude: number, longitude: number) => {
    if (!geocoderRef.current) return;
    onGeocodingStateChange?.(true);

    geocoderRef.current.geocode(
      { location: { lat: latitude, lng: longitude } },
      (results, status) => {
        onGeocodingStateChange?.(false);
        if (status === 'OK' && results && results[0]) {
          onLocationChange(latitude, longitude, results[0].formatted_address);
        } else {
          onLocationChange(latitude, longitude, '');
        }
      }
    );
  }, [onLocationChange, onGeocodingStateChange]);

  const handleDragEnd = useCallback(() => {
    if (!mapRef.current) return;
    const center = mapRef.current.getCenter();
    if (!center) return;

    const newLat = center.lat();
    const newLng = center.lng();
    setMapCenter({ lat: newLat, lng: newLng });

    // Debounce reverse geocoding
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      reverseGeocode(newLat, newLng);
    }, 400);
  }, [reverseGeocode]);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  return (
    <div className="relative w-full" style={{ height: '340px' }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={mapCenter}
        zoom={16}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onDragEnd={handleDragEnd}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
          gestureHandling: 'greedy',
          styles: mapStyles,
          clickableIcons: false,
        }}
      />

      {/* Center pin — fixed in the middle of the map */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-10">
        <div className="flex flex-col items-center">
          <svg width="36" height="48" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 0C8.06 0 0 8.06 0 18C0 31.5 18 48 18 48C18 48 36 31.5 36 18C36 8.06 27.94 0 18 0Z" fill="#1E293B"/>
            <circle cx="18" cy="18" r="7" fill="white"/>
          </svg>
          <div className="w-2 h-2 rounded-full bg-slate-900/20 mt-0.5" />
        </div>
      </div>

      {/* GPS recenter button */}
      <button
        type="button"
        onClick={() => {
          if (!navigator.geolocation) return;
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const newLat = pos.coords.latitude;
              const newLng = pos.coords.longitude;
              mapRef.current?.panTo({ lat: newLat, lng: newLng });
              setMapCenter({ lat: newLat, lng: newLng });
              reverseGeocode(newLat, newLng);
            },
            () => { /* silently fail */ },
            { enableHighAccuracy: true }
          );
        }}
        className="absolute bottom-4 right-4 z-10 bg-white rounded-full p-2.5 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow active:scale-95"
        aria-label="Center on my location"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
        </svg>
      </button>
    </div>
  );
}
