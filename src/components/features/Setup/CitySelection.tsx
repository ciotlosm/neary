import React, { useState } from 'react';
import { useAgencyStore } from '../../../stores/agencyStore';
import { logger } from '../../../utils/logger';

interface CitySelectionProps {
  onCitySelected: (city: string) => void;
  onBack?: () => void;
}

export const CitySelection: React.FC<CitySelectionProps> = ({ onCitySelected, onBack }) => {
  const [selectedCity, setSelectedCity] = useState('');
  const { agencies } = useAgencyStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCity.trim()) {
      return;
    }

    logger.info('City selected in setup wizard', { city: selectedCity }, 'UI');
    onCitySelected(selectedCity.trim());
  };

  // Get unique cities from agencies
  const cities = Array.from(new Set(agencies.map(agency => (agency as any).city))).sort();

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🏙️</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select Your City
        </h2>
        <p className="text-gray-600">
          Choose the city where you'll be using the bus tracker
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <select
            id="city"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a city...</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
            >
              Back
            </button>
          )}
          <button
            type="submit"
            disabled={!selectedCity.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default CitySelection;