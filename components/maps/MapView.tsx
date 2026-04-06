'use client';

import React, { useCallback, useRef } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';

interface MapViewProps {
  lat: number;
  lng: number;
  onMarkerDragEnd: (lat: number, lng: number) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '0.75rem',
  border: '1px solid #e2e8f0', // slate-200
};

export default function MapView({ lat, lng, onMarkerDragEnd }: MapViewProps) {
  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const handleDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      onMarkerDragEnd(e.latLng.lat(), e.latLng.lng());
    }
  };

  return (
    <div className="w-full relative shadow-sm rounded-xl overflow-hidden mt-2">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={{ lat, lng }}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'greedy', // Ensures map can be interacted with directly
        }}
      >
        <Marker
          position={{ lat, lng }}
          draggable={true}
          onDragEnd={handleDragEnd}
          options={{
            crossOnDrag: false,
          }}
        />
      </GoogleMap>
    </div>
  );
}
