import React from 'react';
import { useIntelligentBusStore } from '../../../stores/intelligentBusStore';
import { useConfigStore } from '../../../stores/configStore';
import { BusIcon, ClockIcon, ArrowRightIcon, MapPinIcon, HomeIcon, BuildingIcon } from '../../ui/Icons';
import type { DirectRoute, RouteConnection } from '../../../services/routePlanningService';
import { formatTime24 } from '../../../utils/timeFormat';

interface IntelligentBusDisplayProps {
  className?: string;
}

const DirectRouteCard: React.FC<{ route: DirectRoute; index: number }> = ({ route, index }) => {
  const { bus, arrivalTime } = route;
  
  return (
    <div 
      className="p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
      style={{
        background: 'rgba(51, 65, 85, 0.8)',
        backdropFilter: 'blur(16px)',
        borderLeft: '4px solid #34d399',
        boxShadow: '0 25px 50px -12px rgba(52, 211, 153, 0.25)'
      }}
    >
      {index === 0 && (
        <div 
          className="absolute -top-2 -right-2 text-xs px-2.5 py-1 rounded-full font-black uppercase tracking-wider"
          style={{
            background: 'linear-gradient(90deg, #06b6d4, #0891b2)',
            color: '#0f172a'
          }}
        >
          Best
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(52, 211, 153, 0.2)' }}
          >
            <BusIcon size={20} className="text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-black text-white">{bus.route}</span>
              {bus.routeType && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-300">
                  {bus.routeType === 'bus' && '🚌'}
                  {bus.routeType === 'trolleybus' && '🚎'}
                  {bus.routeType === 'tram' && '🚋'}
                  {bus.routeType === 'metro' && '🚇'}
                  {bus.routeType === 'rail' && '🚆'}
                </span>
              )}
              <span 
                className="text-xs px-2 py-1 rounded-lg font-bold"
                style={{ background: 'rgba(52, 211, 153, 0.3)', color: '#6ee7b7' }}
              >
                Direct
              </span>
            </div>
            <p className="text-sm text-emerald-300 font-semibold">To: {bus.destination}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-black text-emerald-400 mb-1">
            {bus.minutesAway}
          </div>
          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            mins
          </div>
        </div>
      </div>
      
      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2 text-gray-300">
          <ClockIcon size={14} />
          <span>Departs: {formatTime24(bus.estimatedArrival)}</span>
        </div>
        <div className="flex items-center space-x-2 text-emerald-300 font-semibold">
          <span>Arrives: {formatTime24(arrivalTime)}</span>
        </div>
      </div>
    </div>
  );
};

const ConnectionRouteCard: React.FC<{ route: RouteConnection; index: number }> = ({ route }) => {
  const { firstBus, connectionStation, secondBus, transferTime, arrivalTime } = route;
  
  return (
    <div 
      className="p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
      style={{
        background: 'rgba(51, 65, 85, 0.8)',
        backdropFilter: 'blur(16px)',
        borderLeft: '4px solid #8b5cf6',
        boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.25)'
      }}
    >
      <div className="space-y-3">
        {/* Connection header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span 
              className="text-xs px-2 py-1 rounded-lg font-bold"
              style={{ background: 'rgba(139, 92, 246, 0.3)', color: '#c4b5fd' }}
            >
              Connection
            </span>
            <span className="text-sm text-gray-400">
              {transferTime.toFixed(0)}min transfer
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm text-violet-300 font-bold">
              Total: {route.totalTravelTime}min
            </div>
          </div>
        </div>
        
        {/* Route visualization */}
        <div className="flex items-center space-x-2">
          {/* First bus */}
          <div className="flex items-center space-x-2 flex-1">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(139, 92, 246, 0.2)' }}
            >
              <BusIcon size={16} className="text-violet-400" />
            </div>
            <div>
              <div className="text-lg font-black text-white">{firstBus.route}</div>
              <div className="text-xs text-violet-300">{firstBus.minutesAway}min</div>
            </div>
          </div>
          
          <ArrowRightIcon size={16} className="text-gray-500" />
          
          {/* Connection station */}
          <div className="flex items-center space-x-2 flex-1">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(6, 182, 212, 0.2)' }}
            >
              <MapPinIcon size={16} className="text-cyan-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white truncate max-w-20">
                {connectionStation.name}
              </div>
              <div className="text-xs text-cyan-300">{transferTime.toFixed(0)}min</div>
            </div>
          </div>
          
          <ArrowRightIcon size={16} className="text-gray-500" />
          
          {/* Second bus */}
          <div className="flex items-center space-x-2 flex-1">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(139, 92, 246, 0.2)' }}
            >
              <BusIcon size={16} className="text-violet-400" />
            </div>
            <div>
              <div className="text-lg font-black text-white">{secondBus.route}</div>
              <div className="text-xs text-violet-300">
                {((secondBus.estimatedArrival.getTime() - new Date().getTime()) / 60000).toFixed(0)}min
              </div>
            </div>
          </div>
        </div>
        
        {/* Arrival time */}
        <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-600">
          <div className="flex items-center space-x-2 text-gray-300">
            <ClockIcon size={14} />
            <span>Departs: {formatTime24(firstBus.estimatedArrival)}</span>
          </div>
          <div className="flex items-center space-x-2 text-violet-300 font-semibold">
            <span>Arrives: {formatTime24(arrivalTime)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const IntelligentBusDisplay: React.FC<IntelligentBusDisplayProps> = ({ className = '' }) => {
  const { 
    routePlan, 
    recommendedRoutes, 
    currentDestination, 
    isLoading, 
    error, 
    planRoute 
  } = useIntelligentBusStore();

  React.useEffect(() => {
    // Auto-plan route on mount if we don't have data
    if (!routePlan && !isLoading) {
      planRoute();
    }
  }, [routePlan, isLoading, planRoute]);

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div 
          className="rounded-3xl p-6"
          style={{
            background: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(148, 163, 184, 0.2)'
          }}
        >
          <div className="flex items-center space-x-4 mb-6">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse"
              style={{ background: 'rgba(139, 92, 246, 0.2)' }}
            >
              <BusIcon size={24} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Planning your route...</h2>
              <p className="text-sm text-gray-400">Finding the best buses for you</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-700/50 rounded-2xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div 
          className="rounded-3xl p-6 text-center"
          style={{
            background: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(248, 113, 113, 0.3)'
          }}
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BusIcon size={28} className="text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Route Planning Failed</h3>
          <p className="text-red-300 text-sm mb-4">{error.message}</p>
          <button
            onClick={planRoute}
            className="px-4 py-2 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!routePlan || recommendedRoutes.length === 0) {
    // Check if configuration is incomplete
    const { config } = useConfigStore.getState();
    const isConfigIncomplete = !config?.city || !config?.homeLocation || !config?.workLocation;
    
    return (
      <div className={`${className}`}>
        <div 
          className="rounded-3xl p-6 text-center"
          style={{
            background: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(16px)',
            border: `1px solid rgba(${isConfigIncomplete ? '245, 158, 11' : '148, 163, 184'}, 0.3)`
          }}
        >
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
            isConfigIncomplete ? 'bg-amber-500/20' : 'bg-gray-500/20'
          }`}>
            <BusIcon size={28} className={isConfigIncomplete ? 'text-amber-400' : 'text-gray-400'} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            {isConfigIncomplete ? 'Setup Required' : 'No routes found'}
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            {isConfigIncomplete 
              ? 'Complete your configuration to see intelligent route suggestions.'
              : 'We couldn\'t find any buses for your current location.'
            }
          </p>
          {isConfigIncomplete && (
            <div className="text-xs text-amber-300 mb-4 space-y-1">
              {!config?.city && <div>• Set city to "CTP Cluj"</div>}
              {!config?.homeLocation && <div>• Configure home location</div>}
              {!config?.workLocation && <div>• Configure work location</div>}
            </div>
          )}
          <button
            onClick={planRoute}
            className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
              isConfigIncomplete 
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                : 'bg-violet-500/20 text-violet-300 hover:bg-violet-500/30'
            }`}
          >
            {isConfigIncomplete ? 'Check Configuration' : 'Refresh Routes'}
          </button>
        </div>
      </div>
    );
  }

  const destinationIcon = currentDestination === 'work' ? BuildingIcon : HomeIcon;
  const destinationText = currentDestination === 'work' ? 'Going to work' : 'Going home';

  return (
    <div className={`${className}`}>
      <div 
        className="rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(16px)',
          border: `1px solid rgba(${currentDestination === 'work' ? '52, 211, 153' : '139, 92, 246'}, 0.4)`,
          boxShadow: `0 25px 50px -12px rgba(${currentDestination === 'work' ? '52, 211, 153' : '139, 92, 246'}, 0.25)`
        }}
      >
        {/* Header */}
        <div 
          className="p-6"
          style={{
            background: currentDestination === 'work' 
              ? 'linear-gradient(90deg, #10b981 0%, #14b8a6 50%, #10b981 100%)'
              : 'linear-gradient(90deg, #8b5cf6 0%, #a855f7 50%, #8b5cf6 100%)'
          }}
        >
          <div className="flex items-center space-x-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl border border-white/40"
              style={{ background: 'rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(8px)' }}
            >
              {React.createElement(destinationIcon, { size: 26, className: "text-white drop-shadow-lg" })}
            </div>
            <div>
              <h2 className="text-xl font-black text-white drop-shadow-md">{destinationText}</h2>
              <p className="text-sm text-white/90 font-semibold tracking-wide">
                {recommendedRoutes.length} route{recommendedRoutes.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>
        </div>

        {/* Routes */}
        <div className="p-6 space-y-4" style={{ background: 'rgba(30, 41, 59, 0.3)' }}>
          {recommendedRoutes.map((option, index) => (
            <div key={index}>
              {option.type === 'direct' ? (
                <DirectRouteCard route={option.route as DirectRoute} index={index} />
              ) : (
                <ConnectionRouteCard route={option.route as RouteConnection} index={index} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};