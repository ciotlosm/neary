import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import axios from 'axios';
import type { AxiosInstance } from 'axios';

// Mock axios before importing the service
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

// Create a proper mock AxiosInstance
const createMockAxiosInstance = (): AxiosInstance => ({
  interceptors: {
    request: { 
      use: vi.fn().mockImplementation((successHandler, errorHandler) => {
        return { successHandler, errorHandler };
      }),
      eject: vi.fn(),
      clear: vi.fn(),
    },
    response: { 
      use: vi.fn().mockImplementation((successHandler, errorHandler) => {
        return { successHandler, errorHandler };
      }),
      eject: vi.fn(),
      clear: vi.fn(),
    },
  },
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  head: vi.fn(),
  options: vi.fn(),
  request: vi.fn(),
  getUri: vi.fn(),
  defaults: {} as any,
  create: vi.fn(),
} as AxiosInstance);

// Now import the service after mocking
import { TranzyApiServiceImpl } from './tranzyApiService';

describe('TranzyApiService Property Tests', () => {
  let service: TranzyApiServiceImpl;
  let mockAxiosInstance: AxiosInstance;

  beforeEach(() => {
    // Create a fresh mock instance for each test
    mockAxiosInstance = createMockAxiosInstance();
    
    // Mock axios.create to return our mock instance
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    
    // Create a new service instance
    service = new TranzyApiServiceImpl();
  });

  /**
   * Feature: bus-tracker, Property 12: API key validation and storage
   * Validates: Requirements 8.2, 8.5
   */
  it('Property 12: API key validation and storage', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        async (apiKey) => {
          // Create a fresh service instance for each property test iteration
          const mockValidationInstance = createMockAxiosInstance();
          
          // Mock successful validation response with agencies array
          mockValidationInstance.get.mockResolvedValue({ 
            status: 200, 
            data: [{ id: 'test-agency', name: 'Test Agency' }],
            statusText: 'OK',
            headers: {},
            config: {} as any,
          });
          
          // Mock axios.create for validation call
          mockedAxios.create.mockReturnValue(mockValidationInstance);
          
          // Create a new service instance for this test
          const testService = new TranzyApiServiceImpl();
          
          // Test validation - should return true for valid API key format
          const isValid = await testService.validateApiKey(apiKey);
          
          // Property: For any non-empty API key string, validation should return a boolean
          expect(typeof isValid).toBe('boolean');
          expect(isValid).toBe(true); // Should be true for successful mock response
          
          // Property: API key should be storable without throwing errors
          expect(() => testService.setApiKey(apiKey)).not.toThrow();
          
          // Verify the validation endpoint was called with correct path
          expect(mockValidationInstance.get).toHaveBeenCalledWith('/opendata/agency');
          
          // Verify that the validation request included proper headers
          expect(mockedAxios.create).toHaveBeenCalledWith(
            expect.objectContaining({
              headers: expect.objectContaining({
                'Authorization': `Bearer ${apiKey}`,
                'X-API-Key': apiKey,
                'Content-Type': 'application/json',
              }),
            })
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: bus-tracker, Property 13: Authentication header inclusion
   * Validates: Requirements 8.3
   */
  it('Property 13: Authentication header inclusion', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        async (apiKey) => {
          // Create a fresh mock axios instance for this test
          const mockInstance = createMockAxiosInstance();
          
          // Mock successful response for agencies endpoint
          mockInstance.get.mockResolvedValue({ 
            status: 200, 
            data: [{ agency_id: 1, agency_name: 'Test Agency' }],
            statusText: 'OK',
            headers: {},
            config: {} as any,
          });
          
          // Capture the request interceptor function
          let requestInterceptor: ((config: any) => any) | null = null;
          mockInstance.interceptors.request.use.mockImplementation((successHandler) => {
            requestInterceptor = successHandler;
            return { successHandler };
          });
          
          // Create service with the mock instance
          const testService = new TranzyApiServiceImpl(mockInstance);
          
          // Set the API key
          testService.setApiKey(apiKey);
          
          // Make an API call that should include authentication headers
          await testService.getAgencies();
          
          // Verify the request was made with the correct URL
          expect(mockInstance.get).toHaveBeenCalledWith('/opendata/agency');
          
          // Verify that interceptors were set up
          expect(mockInstance.interceptors.request.use).toHaveBeenCalled();
          expect(mockInstance.interceptors.response.use).toHaveBeenCalled();
          
          // Test the request interceptor directly to verify it adds authentication headers
          if (requestInterceptor) {
            const mockConfig = { headers: {} };
            const modifiedConfig = requestInterceptor(mockConfig);
            
            // Property: For any API key, the request interceptor should add both Authorization and X-API-Key headers
            expect(modifiedConfig.headers.Authorization).toBe(`Bearer ${apiKey}`);
            expect(modifiedConfig.headers['X-API-Key']).toBe(apiKey);
          } else {
            throw new Error('Request interceptor was not captured');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Basic unit tests for core functionality
describe('TranzyApiService Unit Tests', () => {
  let mockAxiosInstance: AxiosInstance;

  beforeEach(() => {
    mockAxiosInstance = createMockAxiosInstance();
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
  });

  it('should set and store API key', () => {
    const testService = new TranzyApiServiceImpl(mockAxiosInstance);
    const apiKey = 'test-api-key-123';
    
    testService.setApiKey(apiKey);
    
    // We can't directly test the private apiKey field, but we can verify
    // that the service accepts the key without throwing an error
    expect(() => testService.setApiKey(apiKey)).not.toThrow();
  });

  it('should handle missing API key gracefully', async () => {
    const testService = new TranzyApiServiceImpl(mockAxiosInstance);
    
    // Don't set an API key
    await expect(testService.getBusesForCity('Cluj-Napoca')).rejects.toMatchObject({
      type: 'authentication',
      message: 'API key not configured',
    });
  });

  it('should transform bus data correctly', async () => {
    const testService = new TranzyApiServiceImpl(mockAxiosInstance);
    testService.setApiKey('test-key');
    
    // Mock agencies response first (getBusesForCity calls getAgencies internally)
    const mockAgencyData = [{ agency_id: 1, agency_name: 'CTP Cluj' }];
    
    // Mock vehicle data in Tranzy API format
    const mockVehicleData = [{
      id: 'bus-1',
      label: '24',
      latitude: 46.7712,
      longitude: 23.6236,
      timestamp: new Date().toISOString(),
      vehicle_type: 3, // Bus
      bike_accessible: 'UNKNOWN' as const,
      wheelchair_accessible: 'UNKNOWN' as const,
      speed: 20,
      route_id: 24,
    }];
    
    // First call returns agencies, second call returns vehicles
    mockAxiosInstance.get
      .mockResolvedValueOnce({ 
        status: 200, 
        data: mockAgencyData,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      })
      .mockResolvedValueOnce({ 
        status: 200, 
        data: mockVehicleData,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });
    
    const result = await testService.getBusesForCity('CTP Cluj');
    
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'bus-1',
      route: '24',
      isLive: true,
    });
    expect(result[0].arrivalTime).toBeInstanceOf(Date);
  });

  it('should transform station data correctly', async () => {
    const testService = new TranzyApiServiceImpl(mockAxiosInstance);
    testService.setApiKey('test-key');
    
    // Mock agencies response first (getStationsForCity calls getAgencies internally)
    const mockAgencyData = [{ agency_id: 1, agency_name: 'CTP Cluj' }];
    
    // Mock stop data in Tranzy API format
    const mockStopData = [{
      stop_id: 1,
      stop_name: 'Piata Unirii',
      stop_lat: 46.7712,
      stop_lon: 23.6236,
    }];
    
    // First call returns agencies, second call returns stops
    mockAxiosInstance.get
      .mockResolvedValueOnce({ 
        status: 200, 
        data: mockAgencyData,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      })
      .mockResolvedValueOnce({ 
        status: 200, 
        data: mockStopData,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });
    
    const result = await testService.getStationsForCity('CTP Cluj');
    
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: '1',
      name: 'Piata Unirii',
      coordinates: {
        latitude: 46.7712,
        longitude: 23.6236,
      },
      isFavorite: false,
    });
  });
});