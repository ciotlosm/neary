// Service for managing official CTP Cluj schedule data
import { officialSchedules, type OfficialScheduleEntry } from '../data/officialSchedules';
import { logger } from '../utils/logger';

export class OfficialScheduleService {
  
  /**
   * Get coverage statistics for official schedule data
   */
  getCoverageStats(): {
    totalRoutes: number;
    routesWithOfficialData: number;
    coveragePercentage: number;
    routesWithData: string[];
    routesMissingData: string[];
  } {
    // This would need to be updated with actual route list from API
    const allKnownRoutes = [
      '40', '41', '42', '43', '44', '45', // Sample route IDs
      // Add more as discovered from API
    ];
    
    const routesWithData = [...new Set(officialSchedules.map(s => s.routeId))];
    const routesMissingData = allKnownRoutes.filter(r => !routesWithData.includes(r));
    
    return {
      totalRoutes: allKnownRoutes.length,
      routesWithOfficialData: routesWithData.length,
      coveragePercentage: (routesWithData.length / allKnownRoutes.length) * 100,
      routesWithData,
      routesMissingData
    };
  }

  /**
   * Validate official schedule data for consistency
   */
  validateScheduleData(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const schedule of officialSchedules) {
      // Check required fields
      if (!schedule.routeId) errors.push(`Missing routeId for schedule entry`);
      if (!schedule.routeShortName) errors.push(`Missing routeShortName for route ${schedule.routeId}`);
      if (!schedule.stationId) errors.push(`Missing stationId for route ${schedule.routeId}`);
      if (!schedule.weekdayDepartures?.length) errors.push(`No weekday departures for route ${schedule.routeId}`);

      // Check time format
      const allDepartures = [
        ...schedule.weekdayDepartures,
        ...schedule.saturdayDepartures,
        ...schedule.sundayDepartures
      ];

      for (const time of allDepartures) {
        if (!/^\d{2}:\d{2}$/.test(time)) {
          errors.push(`Invalid time format "${time}" for route ${schedule.routeId}`);
        }
      }

      // Check for reasonable time ranges
      const firstTime = schedule.weekdayDepartures[0];
      const lastTime = schedule.weekdayDepartures[schedule.weekdayDepartures.length - 1];
      
      if (firstTime && firstTime < '05:00') {
        warnings.push(`Very early first departure ${firstTime} for route ${schedule.routeId}`);
      }
      
      if (lastTime && lastTime > '23:00') {
        warnings.push(`Very late last departure ${lastTime} for route ${schedule.routeId}`);
      }

      // Check data freshness
      if (schedule.lastUpdated) {
        const lastUpdate = new Date(schedule.lastUpdated);
        const monthsOld = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        
        if (monthsOld > 6) {
          warnings.push(`Schedule data for route ${schedule.routeId} is ${Math.round(monthsOld)} months old`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get schedule update recommendations
   */
  getUpdateRecommendations(): {
    priority: 'high' | 'medium' | 'low';
    action: string;
    details: string;
  }[] {
    const recommendations: {
      priority: 'high' | 'medium' | 'low';
      action: string;
      details: string;
    }[] = [];

    const coverage = this.getCoverageStats();
    const validation = this.validateScheduleData();

    // High priority: validation errors
    if (validation.errors.length > 0) {
      recommendations.push({
        priority: 'high',
        action: 'Fix data validation errors',
        details: `${validation.errors.length} errors found: ${validation.errors.slice(0, 2).join(', ')}${validation.errors.length > 2 ? '...' : ''}`
      });
    }

    // High priority: very low coverage
    if (coverage.coveragePercentage < 20) {
      recommendations.push({
        priority: 'high',
        action: 'Add official schedule data',
        details: `Only ${coverage.coveragePercentage.toFixed(1)}% of routes have official schedules`
      });
    }

    // Medium priority: moderate coverage
    if (coverage.coveragePercentage >= 20 && coverage.coveragePercentage < 80) {
      recommendations.push({
        priority: 'medium',
        action: 'Expand schedule coverage',
        details: `${coverage.routesMissingData.length} routes still need official schedules: ${coverage.routesMissingData.slice(0, 3).join(', ')}`
      });
    }

    // Low priority: data freshness warnings
    if (validation.warnings.length > 0) {
      recommendations.push({
        priority: 'low',
        action: 'Update stale schedule data',
        details: `${validation.warnings.length} warnings about data freshness`
      });
    }

    return recommendations;
  }

  /**
   * Generate a template for adding new route schedule
   */
  generateScheduleTemplate(routeId: string, routeShortName: string): OfficialScheduleEntry {
    return {
      routeId,
      routeShortName,
      stationId: 'STATION_ID_HERE', // Replace with actual station ID
      stationName: 'Station Name Here', // Replace with actual station name
      direction: 'outbound', // or 'inbound'
      weekdayDepartures: [
        // Add actual departure times in HH:MM format
        '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
        '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
      ],
      saturdayDepartures: [
        // Usually less frequent on Saturdays
        '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
        '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
        '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
        '19:00', '19:30', '20:00'
      ],
      sundayDepartures: [
        // Usually least frequent on Sundays
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
        '17:00', '17:30', '18:00', '18:30', '19:00'
      ],
      validFrom: new Date().toISOString().split('T')[0], // Today's date
      source: 'CTP Cluj Official Website - ADD ACTUAL URL HERE',
      lastUpdated: new Date().toISOString().split('T')[0]
    };
  }

  /**
   * Log current schedule status for debugging
   */
  logScheduleStatus(): void {
    const coverage = this.getCoverageStats();
    const validation = this.validateScheduleData();
    const recommendations = this.getUpdateRecommendations();

    logger.info('Official Schedule Status', {
      coverage: `${coverage.routesWithOfficialData}/${coverage.totalRoutes} routes (${coverage.coveragePercentage.toFixed(1)}%)`,
      validation: validation.isValid ? 'Valid' : `${validation.errors.length} errors`,
      recommendations: recommendations.length,
      routesWithData: coverage.routesWithData,
      highPriorityActions: recommendations.filter(r => r.priority === 'high').length
    });

    if (recommendations.length > 0) {
      logger.warn('Schedule update recommendations', {
        recommendations: recommendations.map(r => `${r.priority.toUpperCase()}: ${r.action}`)
      });
    }
  }
}

export const officialScheduleService = new OfficialScheduleService();