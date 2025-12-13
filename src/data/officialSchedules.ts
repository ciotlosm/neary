// Official Schedule Data
// This file contains manually curated schedule data from official sources

export interface OfficialScheduleEntry {
  routeId: string;
  routeShortName: string;
  stationId: string;
  stationName: string;
  direction: 'inbound' | 'outbound';
  weekdayDepartures: string[]; // HH:MM format
  saturdayDepartures: string[];
  sundayDepartures: string[];
  validFrom?: string; // YYYY-MM-DD
  validTo?: string; // YYYY-MM-DD
  source: string; // URL or reference to official source
  pdfSource?: string; // URL to PDF schedule
  lastUpdated: string; // YYYY-MM-DD
}

// Official schedule data - can be populated with schedule data from various sources
export const officialSchedules: OfficialScheduleEntry[] = [
  // Example: Route 42 schedule data
  {
    routeId: '40', // Internal Tranzy route ID
    routeShortName: '42', // User-facing route number
    stationId: '123', // Station ID from Tranzy API
    stationName: 'Piața Unirii',
    direction: 'outbound',
    weekdayDepartures: [
      '06:00', '06:15', '06:30', '06:45', '07:00', '07:15', '07:30', '07:45',
      '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45',
      '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45',
      '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45',
      '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45',
      '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45',
      '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45',
      '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45'
    ],
    saturdayDepartures: [
      '07:00', '07:20', '07:40', '08:00', '08:20', '08:40', '09:00', '09:20',
      '09:40', '10:00', '10:20', '10:40', '11:00', '11:20', '11:40', '12:00',
      '12:20', '12:40', '13:00', '13:20', '13:40', '14:00', '14:20', '14:40',
      '15:00', '15:20', '15:40', '16:00', '16:20', '16:40', '17:00', '17:20',
      '17:40', '18:00', '18:20', '18:40', '19:00', '19:20', '19:40', '20:00'
    ],
    sundayDepartures: [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
    ],
    validFrom: '2024-01-01',
    source: 'CTP Cluj Official Website - Manual Entry',
    lastUpdated: '2024-12-13'
  }
  // Add more routes as needed...
];

// Helper function to get official schedule for a route/station
export function getOfficialSchedule(
  routeId: string, 
  stationId: string, 
  direction?: 'inbound' | 'outbound'
): OfficialScheduleEntry | null {
  return officialSchedules.find(schedule => 
    schedule.routeId === routeId && 
    schedule.stationId === stationId &&
    (!direction || schedule.direction === direction)
  ) || null;
}

// Helper function to get next departure from official schedule
export function getNextOfficialDeparture(
  routeId: string,
  stationId: string,
  currentTime: Date,
  direction?: 'inbound' | 'outbound'
): { time: Date; confidence: 'official' } | null {
  const schedule = getOfficialSchedule(routeId, stationId, direction);
  if (!schedule) return null;

  const now = new Date(currentTime);
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Select appropriate departure list based on day of week
  let departures: string[];
  if (dayOfWeek === 0) { // Sunday
    departures = schedule.sundayDepartures;
  } else if (dayOfWeek === 6) { // Saturday
    departures = schedule.saturdayDepartures;
  } else { // Monday-Friday
    departures = schedule.weekdayDepartures;
  }

  // Find next departure
  const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const nextDeparture = departures.find(departure => departure > currentTimeStr);
  
  if (nextDeparture) {
    // Found departure today
    const [hours, minutes] = nextDeparture.split(':').map(Number);
    const departureTime = new Date(now);
    departureTime.setHours(hours, minutes, 0, 0);
    
    return {
      time: departureTime,
      confidence: 'official'
    };
  } else {
    // No more departures today, get first departure tomorrow
    const firstDeparture = departures[0];
    if (firstDeparture) {
      const [hours, minutes] = firstDeparture.split(':').map(Number);
      const departureTime = new Date(now);
      departureTime.setDate(departureTime.getDate() + 1);
      departureTime.setHours(hours, minutes, 0, 0);
      
      return {
        time: departureTime,
        confidence: 'official'
      };
    }
  }

  return null;
}

// Helper to check if official data is available for a route
export function hasOfficialSchedule(routeId: string): boolean {
  return officialSchedules.some(schedule => schedule.routeId === routeId);
}

// Helper to get all routes with official schedule data
export function getRoutesWithOfficialSchedules(): string[] {
  return [...new Set(officialSchedules.map(schedule => schedule.routeId))];
}