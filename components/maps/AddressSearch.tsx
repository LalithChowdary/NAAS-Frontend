'use client';

import React from 'react';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';

interface AddressSearchProps {
  onSelectAddress: (address: string, lat: number, lng: number) => void;
  onInputChange?: (value: string) => void;
  defaultValue?: string;
}

export default function AddressSearch({ onSelectAddress, onInputChange, defaultValue = '' }: AddressSearchProps) {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      /* Define search scope here if needed, like localized to a country */
    },
    debounce: 300,
    defaultValue,
  });

  React.useEffect(() => {
    if (defaultValue && defaultValue !== value) {
      setValue(defaultValue, false);
    }
  }, [defaultValue]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onInputChange?.(e.target.value);
  };

  const handleSelect = ({ description }: { description: string }) => () => {
    // When user selects a place, we can replace the keyword without request data from API
    // by setting the second parameter to "false"
    setValue(description, false);
    clearSuggestions();

    // Get latitude and longitude via utility functions
    getGeocode({ address: description }).then((results) => {
      const { lat, lng } = getLatLng(results[0]);
      onSelectAddress(description, lat, lng);
    }).catch((error) => {
      console.error('Error: ', error);
    });
  };

  return (
    <div className="relative w-full">
      <input
        value={value}
        onChange={handleInput}
        disabled={!ready}
        placeholder="Search an address..."
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all font-medium placeholder-slate-300"
      />
      {status === 'OK' && (
        <ul className="absolute top-full left-0 z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {data.map((suggestion) => {
            const {
              place_id,
              structured_formatting: { main_text, secondary_text },
            } = suggestion;

            return (
              <li
                key={place_id}
                onClick={handleSelect(suggestion)}
                className="px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
              >
                <div className="text-sm font-medium text-slate-900">{main_text}</div>
                <div className="text-xs text-slate-500">{secondary_text}</div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
