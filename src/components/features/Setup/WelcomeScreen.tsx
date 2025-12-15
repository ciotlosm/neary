import React from 'react';
import { Button } from '../../ui/Button';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <span className="text-4xl">🚌</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Bus Tracker
          </h1>
          <p className="text-blue-100 text-lg">
            Your smart commute companion
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🏠</span>
              </div>
              <div>
                <h3 className="text-white font-medium">Smart Directions</h3>
                <p className="text-blue-100 text-sm">Automatically detects work and home routes</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🔴</span>
              </div>
              <div>
                <h3 className="text-white font-medium">Live Updates</h3>
                <p className="text-blue-100 text-sm">Real-time bus arrivals and delays</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">⭐</span>
              </div>
              <div>
                <h3 className="text-white font-medium">Favorites</h3>
                <p className="text-blue-100 text-sm">Save your most used routes and stops</p>
              </div>
            </div>
          </div>
        </div>

        {/* Get Started Button */}
        <Button
          onClick={onGetStarted}
          variant="filled"
          size="large"
          fullWidth
          sx={{ 
            bgcolor: 'white', 
            color: 'primary.main',
            '&:hover': { bgcolor: 'grey.50' },
            boxShadow: 3
          }}
        >
          Get Started
        </Button>

        <p className="text-blue-200 text-xs mt-4">
          Powered by Tranzy.ai • Made with ❤️
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;