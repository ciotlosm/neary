import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ServiceWorkerService } from './serviceWorkerService';

// Mock navigator.serviceWorker
const mockServiceWorker = {
  register: vi.fn(),
  addEventListener: vi.fn(),
};

const mockRegistration = {
  active: {
    postMessage: vi.fn(),
    addEventListener: vi.fn(),
  },
  addEventListener: vi.fn(),
  unregister: vi.fn(),
};

// Mock MessageChannel
class MockMessageChannel {
  port1 = {
    onmessage: null as ((event: any) => void) | null,
  };
  port2 = {};
}

(globalThis as any).MessageChannel = MockMessageChannel;

describe('ServiceWorkerService', () => {
  let service: ServiceWorkerService;
  let originalNavigator: any;

  beforeEach(() => {
    // Mock navigator
    originalNavigator = (globalThis as any).navigator;
    (globalThis as any).navigator = {
      ...originalNavigator,
      serviceWorker: mockServiceWorker,
      onLine: true,
    };

    // Mock window events
    (globalThis as any).window = {
      ...(globalThis as any).window,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    // Reset mocks
    vi.clearAllMocks();
    mockServiceWorker.register.mockResolvedValue(mockRegistration);
    mockRegistration.unregister.mockResolvedValue(true);
  });

  afterEach(() => {
    (globalThis as any).navigator = originalNavigator;
  });

  describe('Service Worker Support Detection', () => {
    it('should detect when service workers are supported', () => {
      service = new ServiceWorkerService();
      expect(service.isSupported()).toBe(true);
    });

    it('should detect when service workers are not supported', () => {
      delete ((globalThis as any).navigator as any).serviceWorker;
      service = new ServiceWorkerService();
      expect(service.isSupported()).toBe(false);
    });
  });

  describe('Service Worker Registration', () => {
    beforeEach(() => {
      service = new ServiceWorkerService();
    });

    it('should register service worker successfully', async () => {
      const registration = await service.register();
      
      expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw.js', {
        scope: '/',
      });
      expect(registration).toBe(mockRegistration);
    });

    it('should handle registration failure', async () => {
      const error = new Error('Registration failed');
      mockServiceWorker.register.mockRejectedValue(error);
      
      await expect(service.register()).rejects.toThrow('Registration failed');
    });

    it('should return null when service workers are not supported', async () => {
      delete ((globalThis as any).navigator as any).serviceWorker;
      service = new ServiceWorkerService();
      
      const registration = await service.register();
      expect(registration).toBeNull();
    });
  });

  describe('Service Worker Status', () => {
    it('should return correct status when registered and active', async () => {
      service = new ServiceWorkerService();
      await service.register();
      
      const status = service.getStatus();
      expect(status.isSupported).toBe(true);
      expect(status.isRegistered).toBe(true);
      expect(status.isActive).toBe(true);
      expect(status.registration).toBe(mockRegistration);
    });

    it('should return correct status when not registered', () => {
      service = new ServiceWorkerService();
      
      const status = service.getStatus();
      expect(status.isSupported).toBe(true);
      expect(status.isRegistered).toBe(false);
      expect(status.isActive).toBe(false);
      expect(status.registration).toBeNull();
    });
  });

  describe('Service Worker Unregistration', () => {
    beforeEach(async () => {
      service = new ServiceWorkerService();
      await service.register();
    });

    it('should unregister service worker successfully', async () => {
      const result = await service.unregister();
      
      expect(mockRegistration.unregister).toHaveBeenCalled();
      expect(result).toBe(true);
      
      const status = service.getStatus();
      expect(status.isRegistered).toBe(false);
    });

    it('should handle unregistration failure', async () => {
      mockRegistration.unregister.mockRejectedValue(new Error('Unregister failed'));
      
      const result = await service.unregister();
      expect(result).toBe(false);
    });

    it('should return false when no registration exists', async () => {
      service = new ServiceWorkerService(); // New instance without registration
      
      const result = await service.unregister();
      expect(result).toBe(false);
    });
  });

  describe('Cache Management', () => {
    beforeEach(async () => {
      service = new ServiceWorkerService();
      await service.register();
    });

    it('should clear cache successfully', async () => {
      // Mock MessageChannel to capture the port and simulate response
      let capturedPort1: any = null;
      
      const MockMessageChannelClass = class {
        port1 = {
          onmessage: null as ((event: any) => void) | null,
        };
        port2 = {};
        
        constructor() {
          capturedPort1 = this.port1;
        }
      };
      
      (globalThis as any).MessageChannel = MockMessageChannelClass;
      
      // Mock the postMessage to simulate successful response
      mockRegistration.active.postMessage.mockImplementation((message, ports) => {
        // Simulate immediate response via the captured port
        setTimeout(() => {
          if (capturedPort1 && capturedPort1.onmessage) {
            capturedPort1.onmessage({ data: { success: true } });
          }
        }, 0);
      });

      await expect(service.clearCache('api')).resolves.toBeUndefined();
      
      expect(mockRegistration.active.postMessage).toHaveBeenCalledWith(
        {
          type: 'CLEAR_CACHE',
          payload: { cacheType: 'api' },
        },
        expect.any(Array)
      );
    });

    it('should handle cache clear failure', async () => {
      // Mock MessageChannel to capture the port and simulate response
      let capturedPort1: any = null;
      
      const MockMessageChannelClass = class {
        port1 = {
          onmessage: null as ((event: any) => void) | null,
        };
        port2 = {};
        
        constructor() {
          capturedPort1 = this.port1;
        }
      };
      
      (globalThis as any).MessageChannel = MockMessageChannelClass;
      
      // Mock the postMessage to simulate error response
      mockRegistration.active.postMessage.mockImplementation((message, ports) => {
        // Simulate immediate error response via the captured port
        setTimeout(() => {
          if (capturedPort1 && capturedPort1.onmessage) {
            capturedPort1.onmessage({ 
              data: { success: false, error: 'Cache clear failed' } 
            });
          }
        }, 0);
      });

      await expect(service.clearCache()).rejects.toThrow('Cache clear failed');
    });

    it('should throw error when service worker is not active', async () => {
      service = new ServiceWorkerService(); // New instance without registration
      
      await expect(service.clearCache()).rejects.toThrow('Service Worker is not active');
    });
  });

  describe('Connection Status', () => {
    beforeEach(() => {
      service = new ServiceWorkerService();
    });

    it('should detect online status correctly', () => {
      (globalThis as any).navigator.onLine = true;
      expect(service.isOffline()).toBe(false);
      
      (globalThis as any).navigator.onLine = false;
      expect(service.isOffline()).toBe(true);
    });

    it('should set up connection change listeners', () => {
      const callback = vi.fn();
      const cleanup = service.onConnectionChange(callback);
      
      expect((globalThis as any).window.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect((globalThis as any).window.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
      
      // Test cleanup
      cleanup();
      expect((globalThis as any).window.removeEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect((globalThis as any).window.removeEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
    });
  });

  describe('Status Change Notifications', () => {
    beforeEach(() => {
      service = new ServiceWorkerService();
    });

    it('should notify status change listeners', async () => {
      const callback = vi.fn();
      const cleanup = service.onStatusChange(callback);
      
      await service.register();
      
      expect(callback).toHaveBeenCalled();
      
      // Test cleanup
      cleanup();
      
      // Reset mock and trigger another status change
      callback.mockClear();
      await service.unregister();
      
      // Should not be called after cleanup
      expect(callback).not.toHaveBeenCalled();
    });
  });
});