import React, { useState, useEffect, useRef } from 'react';
import { useLocationStore } from '../../../stores/locationStore';
import { geocodingService, type AddressSearchResult } from '../../../services/geocodingService';
import type { Coordinates } from '../../../types';
import { MapPicker } from '../MapPicker';

interface AddressSearchInputProps {
  label: string;
  coordinates: Coordinates | null | undefined;
  onCoordinatesChange: (coords: Coordinates) => void;
  onError: (error: string) => void;
  onClearError: () => void;
  placeholder?: string;
  id?: string; // Add unique identifier
}

export const AddressSearchInput: React.FC<AddressSearchInputProps> = ({
  label,
  coordinates,
  onCoordinatesChange,
  onError,
  onClearError,
  placeholder = "Enter address (e.g., Campului 316, Cluj-Napoca)",
  id = 'address-search'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AddressSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  
  const { requestLocation } = useLocationStore();
  const searchTimeoutRef = useRef<number | undefined>(undefined);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Update selected address when coordinates change
  useEffect(() => {
    if (coordinates && !selectedAddress) {
      // Reverse geocode to get address
      geocodingService.reverseGeocode(coordinates).then(result => {
        if (result) {
          setSelectedAddress(result.address);
          setSearchQuery(result.address);
          // Clear search results when coordinates are set
          setSearchResults([]);
          setShowResults(false);
        }
      });
    }
  }, [coordinates, selectedAddress]);

  // Clear search results when component unmounts or coordinates change externally
  useEffect(() => {
    return () => {
      setSearchResults([]);
      setShowResults(false);
    };
  }, []);

  // Clear results when coordinates change from external source
  useEffect(() => {
    if (coordinates) {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [coordinates]);

  // Handle search with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      onClearError();

      try {
        // Get user's current location for biased search
        let userLocation: Coordinates | undefined;
        try {
          userLocation = await requestLocation();
        } catch {
          // Ignore location errors, search without bias
        }

        const results = await geocodingService.searchAddress(searchQuery, userLocation);
        setSearchResults(results);
        setShowResults(results.length > 0);
      } catch (error) {
        onError(error instanceof Error ? error.message : 'Address search failed');
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, requestLocation, onError, onClearError]);

  // Handle clicking outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    onClearError();
    
    try {
      const location = await requestLocation();
      onCoordinatesChange(location);
      
      // Get address for the location
      const result = await geocodingService.reverseGeocode(location);
      if (result) {
        setSelectedAddress(result.address);
        setSearchQuery(result.address);
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to get current location');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSelectResult = (result: AddressSearchResult) => {
    onClearError();
    onCoordinatesChange(result.coordinates);
    setSelectedAddress(result.address);
    setSearchQuery(result.address);
    setShowResults(false);
    setSearchResults([]); // Clear results after selection
  };

  const handleMapLocationSelect = (coords: Coordinates) => {
    onClearError();
    onCoordinatesChange(coords);
    
    // Get address for the selected location
    geocodingService.reverseGeocode(coords).then(result => {
      if (result) {
        setSelectedAddress(result.address);
        setSearchQuery(result.address);
      }
    });
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {/* Address Search Input */}
      <div className="relative" ref={resultsRef}>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              // Clear any existing error when focusing
              onClearError();
            }}
            onBlur={() => {
              // Hide results after a short delay to allow for clicks
              setTimeout(() => setShowResults(false), 150);
            }}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
          />
          {isSearching && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={`${id}-result-${index}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectResult(result);
                }}
                onMouseDown={(e) => {
                  // Prevent blur event from hiding results before click
                  e.preventDefault();
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
              >
                <div className="text-sm text-gray-900">{result.address}</div>
                {result.city && (
                  <div className="text-xs text-gray-500">{result.city}, {result.country}</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isGettingLocation ? 'Getting Location...' : 'Use Current Location'}
        </button>
        
        <button
          type="button"
          onClick={() => setShowMapPicker(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium border-0"
          style={{ backgroundColor: '#16a34a', color: 'white' }}
        >
          Choose on Map
        </button>
      </div>
      
      {/* Current Location Display */}
      {coordinates && (
        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
          <div className="font-medium">Selected Location:</div>
          <div>{selectedAddress || `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`}</div>
        </div>
      )}

      {/* Map Picker Modal */}
      <MapPicker
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onLocationSelect={handleMapLocationSelect}
        initialCoordinates={coordinates || undefined}
        title="Choose Location on Map"
      />
    </div>
  );
};

export default AddressSearchInput;