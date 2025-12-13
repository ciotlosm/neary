import React from 'react';
import { useConfigStore } from '../../../stores/configStore';
import { useFavoriteBusStore } from '../../../stores/favoriteBusStore';

export const DebugFavorites: React.FC = () => {
  const { config } = useConfigStore();
  const { availableRoutes } = useFavoriteBusStore();

  const runDebug = () => {
    console.log('🔍 Debug Favorites - Current State:');
    console.log('='.repeat(50));
    
    console.log('📋 Config:', config);
    console.log('🚌 Favorite Buses:', config?.favoriteBuses);
    console.log('📊 Available Routes Count:', availableRoutes.length);
    
    if (availableRoutes.length > 0) {
      // Find the problematic routes
      const route42 = availableRoutes.find(r => r.shortName === '42');
      const route43B = availableRoutes.find(r => r.shortName === '43B');
      const routeId40 = availableRoutes.find(r => (r as any).id === '40');
      const routeId42 = availableRoutes.find(r => (r as any).id === '42');
      
      console.log('\n🔍 Key Routes Analysis:');
      if (route42) console.log('  Route with shortName "42":', route42);
      if (route43B) console.log('  Route with shortName "43B":', route43B);
      if (routeId40) console.log('  Route with ID "40":', routeId40);
      if (routeId42) console.log('  Route with ID "42":', routeId42);
      
      // Check what's actually stored vs what should be stored
      if (config?.favoriteBuses) {
        console.log('\n🔍 Stored Route IDs Analysis:');
        config.favoriteBuses.forEach((storedId, index) => {
          const route = availableRoutes.find(r => (r as any).id === storedId);
          console.log(`  ${index + 1}. Stored ID "${storedId}" → Route:`, route);
          if (route) {
            console.log(`     Shows as: "${route.shortName}" (${route.name})`);
          }
        });
      }
      
      // Show first 10 routes for context
      console.log('\n📝 First 10 Available Routes:');
      availableRoutes.slice(0, 10).forEach(route => {
        console.log(`  ID: ${(route as any).id.padEnd(3)} | Short: ${(route.shortName || 'N/A').padEnd(6)} | Name: ${route.name}`);
      });
    }
  };

  const testRouteSelection = () => {
    console.log('\n🧪 Testing Route Selection Logic:');
    console.log('='.repeat(50));
    
    // Find route "42" (should have ID "40")
    const route42 = availableRoutes.find(r => r.shortName === '42');
    if (route42) {
      console.log('✅ Found route "42":', route42);
      console.log(`   When user clicks "42", we should store ID: "${(route42 as any).id}"`);
      console.log(`   When displaying ID "${(route42 as any).id}", we should show: "${route42.shortName}"`);
    }
    
    // Test what happens if we store the wrong ID
    const routeId42 = availableRoutes.find(r => (r as any).id === '42');
    if (routeId42) {
      console.log('\n❌ If we mistakenly store ID "42":');
      console.log('   Route with ID "42":', routeId42);
      console.log(`   Would display as: "${routeId42.shortName}" (WRONG!)`);
    }
  };

  const fixMapping = () => {
    console.log('\n🔧 Attempting to fix route mapping...');
    
    if (!config?.favoriteBuses) {
      console.log('❌ No favorite buses to fix');
      return;
    }
    
    const validRoutes = config.favoriteBuses.filter(id => {
      const route = availableRoutes.find(r => (r as any).id === id);
      const isValid = !!route;
      console.log(`   ID "${id}" → ${isValid ? '✅ Valid' : '❌ Invalid'} ${route ? `(${route.shortName})` : ''}`);
      return isValid;
    });
    
    console.log(`🔧 Fixed routes: ${validRoutes.length}/${config.favoriteBuses.length}`);
    
    if (validRoutes.length !== config.favoriteBuses.length) {
      console.log('⚠️ Some routes were invalid and removed');
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg m-4">
      <h3 className="text-white font-bold mb-4">🔍 Debug Favorites</h3>
      <div className="space-x-2">
        <button
          onClick={runDebug}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Run Debug
        </button>
        <button
          onClick={testRouteSelection}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
        >
          Test Selection
        </button>
        <button
          onClick={fixMapping}
          className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
        >
          Fix Mapping
        </button>
      </div>
      <div className="mt-2 text-xs text-gray-400">
        Open browser console and click buttons to see debug output
      </div>
    </div>
  );
};