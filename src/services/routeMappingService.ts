import { enhancedTranzyApi } from './enhancedTranzyApi';
import { agencyService } from './agencyService';
import { logger } from '../utils/loggerFixed';

export interface RouteMapping {
  routeShortName: string; // What users see: "42", "43B", etc.
  routeId: string;        // Internal API ID: "40", "42", etc.
  routeLongName: string;  // Full name: "P-ta M. Viteazul - Str. Campului"
  routeDescription?: string;
  routeType: 'bus' | 'trolleybus' | 'tram' | 'metro' | 'rail' | 'ferry' | 'other';
}

class RouteMappingService {
  private routeMappingCache = new Map<string, RouteMapping[]>(); // cityName -> mappings
  private cacheExpiry = new Map<string, number>(); // cityName -> timestamp
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get route ID from route short name (what users see)
   * Example: "42" -> "40"
   */
  async getRouteIdFromShortName(routeShortName: string, cityName: string): Promise<string | null> {
    try {
      const mappings = await this.getRouteMappings(cityName);
      const mapping = mappings.find(m => m.routeShortName === routeShortName);
      return mapping?.routeId || null;
    } catch (error) {
      logger.error('Failed to get route ID from short name', { routeShortName, cityName, error });
      return null;
    }
  }

  /**
   * Get route short name from route ID (for display)
   * Example: "40" -> "42"
   */
  async getRouteShortNameFromId(routeId: string, cityName: string): Promise<string | null> {
    try {
      const mappings = await this.getRouteMappings(cityName);
      const mapping = mappings.find(m => m.routeId === routeId);
      return mapping?.routeShortName || null;
    } catch (error) {
      logger.error('Failed to get route short name from ID', { routeId, cityName, error });
      return null;
    }
  }

  /**
   * Get full route mapping from short name
   * Example: "42" -> { routeShortName: "42", routeId: "40", routeLongName: "...", ... }
   */
  async getRouteMappingFromShortName(routeShortName: string, cityName: string): Promise<RouteMapping | null> {
    try {
      const mappings = await this.getRouteMappings(cityName);
      return mappings.find(m => m.routeShortName === routeShortName) || null;
    } catch (error) {
      logger.error('Failed to get route mapping from short name', { routeShortName, cityName, error });
      return null;
    }
  }

  /**
   * Get full route mapping from route ID
   * Example: "40" -> { routeShortName: "42", routeId: "40", routeLongName: "...", ... }
   */
  async getRouteMappingFromId(routeId: string, cityName: string): Promise<RouteMapping | null> {
    try {
      const mappings = await this.getRouteMappings(cityName);
      return mappings.find(m => m.routeId === routeId) || null;
    } catch (error) {
      logger.error('Failed to get route mapping from ID', { routeId, cityName, error });
      return null;
    }
  }

  /**
   * Convert array of route short names to route IDs for API calls
   * Example: ["42", "43B"] -> ["40", "42"]
   */
  async convertShortNamesToIds(routeShortNames: string[], cityName: string): Promise<string[]> {
    try {
      const mappings = await this.getRouteMappings(cityName);
      const routeIds: string[] = [];

      for (const shortName of routeShortNames) {
        const mapping = mappings.find(m => m.routeShortName === shortName);
        if (mapping) {
          routeIds.push(mapping.routeId);
        } else {
          logger.warn('No route ID found for short name', { shortName, cityName });
        }
      }

      return routeIds;
    } catch (error) {
      logger.error('Failed to convert short names to IDs', { routeShortNames, cityName, error });
      return [];
    }
  }

  /**
   * Convert array of route IDs to short names for display
   * Example: ["40", "42"] -> ["42", "43B"]
   */
  async convertIdsToShortNames(routeIds: string[], cityName: string): Promise<string[]> {
    try {
      const mappings = await this.getRouteMappings(cityName);
      const shortNames: string[] = [];

      for (const routeId of routeIds) {
        const mapping = mappings.find(m => m.routeId === routeId);
        if (mapping) {
          shortNames.push(mapping.routeShortName);
        } else {
          logger.warn('No short name found for route ID', { routeId, cityName });
        }
      }

      return shortNames;
    } catch (error) {
      logger.error('Failed to convert IDs to short names', { routeIds, cityName, error });
      return [];
    }
  }

  /**
   * Get all available routes for user selection (showing short names)
   */
  async getAvailableRoutesForUser(cityName: string): Promise<{
    shortName: string;
    longName: string;
    description?: string;
    type: 'bus' | 'trolleybus' | 'tram' | 'metro' | 'rail' | 'ferry' | 'other';
  }[]> {
    try {
      const mappings = await this.getRouteMappings(cityName);
      return mappings.map(mapping => ({
        shortName: mapping.routeShortName,
        longName: mapping.routeLongName,
        description: mapping.routeDescription,
        type: mapping.routeType
      })).sort((a, b) => {
        // Sort numerically if possible, otherwise alphabetically
        const aNum = parseInt(a.shortName);
        const bNum = parseInt(b.shortName);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }
        return a.shortName.localeCompare(b.shortName);
      });
    } catch (error) {
      logger.error('Failed to get available routes for user', { cityName, error });
      return [];
    }
  }

  /**
   * Get all route mappings for a city (cached)
   */
  private async getRouteMappings(cityName: string): Promise<RouteMapping[]> {
    // Check cache
    const cached = this.routeMappingCache.get(cityName);
    const cacheTime = this.cacheExpiry.get(cityName);
    
    if (cached && cacheTime && Date.now() - cacheTime < this.CACHE_DURATION) {
      return cached;
    }

    // Fetch fresh data
    try {
      const agencyId = await agencyService.getAgencyIdForCity(cityName);
      if (!agencyId) {
        logger.warn('No agency found for city', { cityName });
        return [];
      }

      const routes = await enhancedTranzyApi.getRoutes(agencyId);
      const mappings: RouteMapping[] = routes.map(route => ({
        routeShortName: route.shortName || route.id,
        routeId: route.id,
        routeLongName: route.longName || route.shortName || `Route ${route.id}`,
        routeDescription: route.description,
        routeType: route.type || 'bus'
      }));

      // Cache the results
      this.routeMappingCache.set(cityName, mappings);
      this.cacheExpiry.set(cityName, Date.now());

      logger.debug('Cached route mappings', { 
        cityName, 
        count: mappings.length,
        sample: mappings.slice(0, 3).map(m => `${m.routeShortName} -> ${m.routeId}`)
      });

      return mappings;
    } catch (error) {
      logger.error('Failed to fetch route mappings', { cityName, error });
      return [];
    }
  }

  /**
   * Clear cache for a city (useful for testing or when data changes)
   */
  clearCache(cityName?: string): void {
    if (cityName) {
      this.routeMappingCache.delete(cityName);
      this.cacheExpiry.delete(cityName);
    } else {
      this.routeMappingCache.clear();
      this.cacheExpiry.clear();
    }
  }

  /**
   * Validate that route short names exist
   */
  async validateRouteShortNames(routeShortNames: string[], cityName: string): Promise<{
    valid: string[];
    invalid: string[];
  }> {
    try {
      const mappings = await this.getRouteMappings(cityName);
      const validShortNames = mappings.map(m => m.routeShortName);
      
      const valid = routeShortNames.filter(name => validShortNames.includes(name));
      const invalid = routeShortNames.filter(name => !validShortNames.includes(name));

      return { valid, invalid };
    } catch (error) {
      logger.error('Failed to validate route short names', { routeShortNames, cityName, error });
      return { valid: [], invalid: routeShortNames };
    }
  }
}

export const routeMappingService = new RouteMappingService();