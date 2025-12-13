
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OfflineIndicator } from './OfflineIndicator';

// Mock the offline store
const mockOfflineStore = {
  isOnline: true,
  isOfflineCapable: true,
  isUsingCachedData: false,
  lastApiDataUpdate: null as Date | null,
  cacheInfo: null as any,
  refreshCacheInfo: vi.fn(),
  clearCache: vi.fn(),
};

vi.mock('../../../stores/offlineStore', () => ({
  useOfflineStore: () => mockOfflineStore,
}));

describe('OfflineIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock store to default state
    Object.assign(mockOfflineStore, {
      isOnline: true,
      isOfflineCapable: true,
      isUsingCachedData: false,
      lastApiDataUpdate: null,
      cacheInfo: null,
    });
  });

  describe('Status Display', () => {
    it('should show online status when connected and offline capable', () => {
      render(<OfflineIndicator />);
      
      expect(screen.getByText('Online (offline ready)')).toBeInTheDocument();
      const statusDot = screen.getByTitle('Connected with offline support enabled');
      expect(statusDot).toHaveClass('bg-green-500');
    });

    it('should show offline status when disconnected', () => {
      mockOfflineStore.isOnline = false;
      
      render(<OfflineIndicator />);
      
      expect(screen.getByText('Offline')).toBeInTheDocument();
      const statusDot = screen.getByTitle("You're offline, but cached data is available");
      expect(statusDot).toHaveClass('bg-red-500');
    });

    it('should show cached data status when using cached data', () => {
      mockOfflineStore.isUsingCachedData = true;
      mockOfflineStore.lastApiDataUpdate = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
      
      render(<OfflineIndicator />);
      
      expect(screen.getByText('Using cached data')).toBeInTheDocument();
      expect(screen.getByText('(5m ago)')).toBeInTheDocument();
      const statusDot = screen.getByTitle('Showing cached data from 5m ago');
      expect(statusDot).toHaveClass('bg-yellow-500');
    });

    it('should show online status when not offline capable', () => {
      mockOfflineStore.isOfflineCapable = false;
      
      render(<OfflineIndicator />);
      
      expect(screen.getByText('Online')).toBeInTheDocument();
      const statusDot = screen.getByTitle('Connected but offline support is not available');
      expect(statusDot).toHaveClass('bg-gray-500');
    });
  });

  describe('Timestamp Formatting', () => {
    it('should show "Just now" for very recent data', () => {
      mockOfflineStore.isUsingCachedData = true;
      mockOfflineStore.lastApiDataUpdate = new Date(Date.now() - 30 * 1000); // 30 seconds ago
      
      render(<OfflineIndicator />);
      
      expect(screen.getByText('(Just now)')).toBeInTheDocument();
    });

    it('should show minutes for recent data', () => {
      mockOfflineStore.isUsingCachedData = true;
      mockOfflineStore.lastApiDataUpdate = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago
      
      render(<OfflineIndicator />);
      
      expect(screen.getByText('(15m ago)')).toBeInTheDocument();
    });

    it('should show hours for older data', () => {
      mockOfflineStore.isUsingCachedData = true;
      mockOfflineStore.lastApiDataUpdate = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
      
      render(<OfflineIndicator />);
      
      expect(screen.getByText('(3h ago)')).toBeInTheDocument();
    });

    it('should show days for very old data', () => {
      mockOfflineStore.isUsingCachedData = true;
      mockOfflineStore.lastApiDataUpdate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
      
      render(<OfflineIndicator />);
      
      expect(screen.getByText('(2d ago)')).toBeInTheDocument();
    });
  });

  describe('Cache Information Display', () => {
    it('should not show cache info by default', () => {
      render(<OfflineIndicator />);
      
      expect(screen.queryByText('Cache Information')).not.toBeInTheDocument();
    });

    it('should show cache info when showCacheInfo is true', () => {
      mockOfflineStore.cacheInfo = {
        'bus-tracker-api-v1': { size: 5, urls: ['url1', 'url2'] },
        'bus-tracker-v1': { size: 10, urls: ['url3', 'url4'] },
      };
      
      render(<OfflineIndicator showCacheInfo={true} />);
      
      expect(screen.getByText('Cache Information')).toBeInTheDocument();
      expect(screen.getByText('api')).toBeInTheDocument();
      expect(screen.getByText('5 items')).toBeInTheDocument();
      expect(screen.getByText('v1')).toBeInTheDocument();
      expect(screen.getByText('10 items')).toBeInTheDocument();
    });

    it('should show no cache info message when cache is empty', () => {
      render(<OfflineIndicator showCacheInfo={true} />);
      
      expect(screen.getByText('No cache information available')).toBeInTheDocument();
    });

    it('should refresh cache info when refresh button is clicked', async () => {
      mockOfflineStore.cacheInfo = {};
      
      render(<OfflineIndicator showCacheInfo={true} />);
      
      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);
      
      await waitFor(() => {
        expect(mockOfflineStore.refreshCacheInfo).toHaveBeenCalled();
      });
    });
  });

  describe('Cache Management Actions', () => {
    beforeEach(() => {
      mockOfflineStore.cacheInfo = {
        'bus-tracker-api-v1': { size: 5, urls: [] },
      };
    });

    it('should clear API cache when Clear API Cache button is clicked', async () => {
      render(<OfflineIndicator showCacheInfo={true} />);
      
      const clearApiButton = screen.getByText('Clear API Cache');
      fireEvent.click(clearApiButton);
      
      await waitFor(() => {
        expect(mockOfflineStore.clearCache).toHaveBeenCalledWith('api');
      });
    });

    it('should clear all cache when Clear All button is clicked', async () => {
      render(<OfflineIndicator showCacheInfo={true} />);
      
      const clearAllButton = screen.getByText('Clear All');
      fireEvent.click(clearAllButton);
      
      await waitFor(() => {
        expect(mockOfflineStore.clearCache).toHaveBeenCalledWith();
      });
    });

    it('should handle cache clear errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockOfflineStore.clearCache.mockRejectedValue(new Error('Clear failed'));
      
      render(<OfflineIndicator showCacheInfo={true} />);
      
      const clearApiButton = screen.getByText('Clear API Cache');
      fireEvent.click(clearApiButton);
      
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Failed to clear cache:', expect.any(Error));
      });
      
      consoleError.mockRestore();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(<OfflineIndicator className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should have default offline-indicator class', () => {
      const { container } = render(<OfflineIndicator />);
      
      expect(container.firstChild).toHaveClass('offline-indicator');
    });
  });

  describe('Accessibility', () => {
    it('should have proper title attribute for status indicator', () => {
      render(<OfflineIndicator />);
      
      const statusDot = screen.getByTitle('Connected with offline support enabled');
      expect(statusDot).toHaveAttribute('title', 'Connected with offline support enabled');
    });

    it('should have proper title for offline status', () => {
      mockOfflineStore.isOnline = false;
      mockOfflineStore.isOfflineCapable = true;
      
      render(<OfflineIndicator />);
      
      const statusDot = screen.getByTitle("You're offline, but cached data is available");
      expect(statusDot).toHaveAttribute('title', "You're offline, but cached data is available");
    });

    it('should have proper title for cached data status', () => {
      mockOfflineStore.isUsingCachedData = true;
      mockOfflineStore.lastApiDataUpdate = new Date(Date.now() - 5 * 60 * 1000);
      
      render(<OfflineIndicator />);
      
      const statusDot = screen.getByTitle('Showing cached data from 5m ago');
      expect(statusDot).toHaveAttribute('title', 'Showing cached data from 5m ago');
    });
  });
});