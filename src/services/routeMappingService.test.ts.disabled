import { describe, it, expect, vi, beforeEach } from 'vitest';
import { routeMappingService } from './routeMappingService';
import { enhancedTranzyApi } from './tranzyApiService';
import { agencyService } from './agencyService';

// Mock dependencies
vi.mock('./enhancedTranzyApi');
vi.mock('./agencyService');

const mockEnhancedTranzyApi = vi.mocked(enhancedTranzyApi);
const mockAgencyService = vi.mocked(agencyService);

describe('RouteMappingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routeMappingService.clearCache();
  });

  const mockRoutes = [
    {
      id: '40',
      shortName: '42',
      longName: 'P-ta M. Viteazul - Str. Campului',
      description: 'Main route description',
      type: 'bus' as const
    },
    {
      id: '42',
      shortName: '43B',
      longName: 'Cart. Grigorescu - Calea Turzii',
      description: 'Express route',
      type: 'bus' as const
    },
    {
      id: '1',
      shortName: '1',
      longName: 'Str. Bucium - P-ta 1 Mai',
      type: 'bus' as const
    }
  ];

  beforeEach(() => {
    mockAgencyService.getAgencyIdForCity.mockResolvedValue(2);
    mockEnhancedTranzyApi.getRoutes.mockResolvedValue(mockRoutes);
  });

  describe('getRouteIdFromShortName', () => {
    it('should return correct route ID for route short name', async () => {
      const routeId = await routeMappingService.getRouteIdFromShortName('42', 'Cluj-Napoca');
      expect(routeId).toBe('40');
    });

    it('should return correct route ID for route 43B', async () => {
      const routeId = await routeMappingService.getRouteIdFromShortName('43B', 'Cluj-Napoca');
      expect(routeId).toBe('42');
    });

    it('should return null for non-existent route', async () => {
      const routeId = await routeMappingService.getRouteIdFromShortName('999', 'Cluj-Napoca');
      expect(routeId).toBeNull();
    });
  });

  describe('getRouteShortNameFromId', () => {
    it('should return correct short name for route ID', async () => {
      const shortName = await routeMappingService.getRouteShortNameFromId('40', 'Cluj-Napoca');
      expect(shortName).toBe('42');
    });

    it('should return correct short name for route ID 42', async () => {
      const shortName = await routeMappingService.getRouteShortNameFromId('42', 'Cluj-Napoca');
      expect(shortName).toBe('43B');
    });

    it('should return null for non-existent route ID', async () => {
      const shortName = await routeMappingService.getRouteShortNameFromId('999', 'Cluj-Napoca');
      expect(shortName).toBeNull();
    });
  });

  describe('convertShortNamesToIds', () => {
    it('should convert array of short names to IDs', async () => {
      const routeIds = await routeMappingService.convertShortNamesToIds(['42', '43B', '1'], 'Cluj-Napoca');
      expect(routeIds).toEqual(['40', '42', '1']);
    });

    it('should handle mixed valid and invalid routes', async () => {
      const routeIds = await routeMappingService.convertShortNamesToIds(['42', '999', '1'], 'Cluj-Napoca');
      expect(routeIds).toEqual(['40', '1']);
    });
  });

  describe('convertIdsToShortNames', () => {
    it('should convert array of IDs to short names', async () => {
      const shortNames = await routeMappingService.convertIdsToShortNames(['40', '42', '1'], 'Cluj-Napoca');
      expect(shortNames).toEqual(['42', '43B', '1']);
    });

    it('should handle mixed valid and invalid IDs', async () => {
      const shortNames = await routeMappingService.convertIdsToShortNames(['40', '999', '1'], 'Cluj-Napoca');
      expect(shortNames).toEqual(['42', '1']);
    });
  });

  describe('getAvailableRoutesForUser', () => {
    it('should return routes sorted by short name', async () => {
      const routes = await routeMappingService.getAvailableRoutesForUser('Cluj-Napoca');
      
      expect(routes).toHaveLength(3);
      expect(routes[0].shortName).toBe('1');
      expect(routes[1].shortName).toBe('42');
      expect(routes[2].shortName).toBe('43B');
    });

    it('should include all required fields', async () => {
      const routes = await routeMappingService.getAvailableRoutesForUser('Cluj-Napoca');
      
      const route42 = routes.find(r => r.shortName === '42');
      expect(route42).toEqual({
        shortName: '42',
        longName: 'P-ta M. Viteazul - Str. Campului',
        description: 'Main route description',
        type: 'bus'
      });
    });
  });

  describe('validateRouteShortNames', () => {
    it('should separate valid and invalid route names', async () => {
      const result = await routeMappingService.validateRouteShortNames(['42', '999', '1', 'invalid'], 'Cluj-Napoca');
      
      expect(result.valid).toEqual(['42', '1']);
      expect(result.invalid).toEqual(['999', 'invalid']);
    });
  });

  describe('caching', () => {
    it('should cache route mappings', async () => {
      // First call
      await routeMappingService.getRouteIdFromShortName('42', 'Cluj-Napoca');
      expect(mockEnhancedTranzyApi.getRoutes).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await routeMappingService.getRouteIdFromShortName('43B', 'Cluj-Napoca');
      expect(mockEnhancedTranzyApi.getRoutes).toHaveBeenCalledTimes(1);
    });

    it('should clear cache when requested', async () => {
      // First call
      await routeMappingService.getRouteIdFromShortName('42', 'Cluj-Napoca');
      expect(mockEnhancedTranzyApi.getRoutes).toHaveBeenCalledTimes(1);

      // Clear cache
      routeMappingService.clearCache('Cluj-Napoca');

      // Second call should fetch fresh data
      await routeMappingService.getRouteIdFromShortName('42', 'Cluj-Napoca');
      expect(mockEnhancedTranzyApi.getRoutes).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling', () => {
    it('should handle API errors gracefully', async () => {
      mockEnhancedTranzyApi.getRoutes.mockRejectedValue(new Error('API Error'));
      
      const routeId = await routeMappingService.getRouteIdFromShortName('42', 'Cluj-Napoca');
      expect(routeId).toBeNull();
    });

    it('should handle missing agency gracefully', async () => {
      mockAgencyService.getAgencyIdForCity.mockResolvedValue(null);
      
      const routeId = await routeMappingService.getRouteIdFromShortName('42', 'Cluj-Napoca');
      expect(routeId).toBeNull();
    });
  });
});