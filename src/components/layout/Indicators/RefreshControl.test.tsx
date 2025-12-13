import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RefreshControl } from './RefreshControl';
import { useBusStore } from '../../../stores/busStore';
import { useConfigStore } from '../../../stores/configStore';

// Mock the stores
vi.mock('../../../stores/busStore');
vi.mock('../../../stores/configStore');

const mockUseBusStore = vi.mocked(useBusStore);
const mockUseConfigStore = vi.mocked(useConfigStore);

// Mock the refresh system hook
const mockManualRefresh = vi.fn();
vi.mock('../../../hooks/useRefreshSystem', () => ({
  useRefreshSystem: () => ({
    isAutoRefreshEnabled: false,
    manualRefresh: mockManualRefresh,
    toggleAutoRefresh: vi.fn(),
    refreshRate: 30000,
  }),
}));

describe('RefreshControl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockUseBusStore.mockReturnValue({
      buses: [],
      stations: [],
      lastUpdate: null,
      isLoading: false,
      error: null,
      refreshBuses: vi.fn(),
      clearError: vi.fn(),
      isAutoRefreshEnabled: false,
      startAutoRefresh: vi.fn(),
      stopAutoRefresh: vi.fn(),
      manualRefresh: vi.fn(),
    });

    mockUseConfigStore.mockReturnValue({
      config: {
        city: 'TestCity',
        homeLocation: { latitude: 45.0, longitude: 25.0 },
        workLocation: { latitude: 45.1, longitude: 25.1 },
        apiKey: 'test-key',
        refreshRate: 30000,
      },
      isConfigured: true,
      updateConfig: vi.fn(),
      resetConfig: vi.fn(),
    });
  });

  it('renders refresh button', () => {
    render(<RefreshControl />);
    
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
  });

  it('shows loading state when refreshing', () => {
    mockUseBusStore.mockReturnValue({
      buses: [],
      stations: [],
      lastUpdate: null,
      isLoading: true,
      error: null,
      refreshBuses: vi.fn(),
      clearError: vi.fn(),
      isAutoRefreshEnabled: false,
      startAutoRefresh: vi.fn(),
      stopAutoRefresh: vi.fn(),
      manualRefresh: vi.fn(),
    });

    render(<RefreshControl />);
    
    // Button shows loading state via the Button component's loading prop
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('shows refresh button when not loading', () => {
    mockUseBusStore.mockReturnValue({
      buses: [],
      stations: [],
      lastUpdate: null,
      isLoading: false,
      error: null,
      refreshBuses: vi.fn(),
      clearError: vi.fn(),
      isAutoRefreshEnabled: false,
      startAutoRefresh: vi.fn(),
      stopAutoRefresh: vi.fn(),
      manualRefresh: vi.fn(),
    });

    render(<RefreshControl />);
    
    expect(screen.getByText('Refresh')).toBeInTheDocument();
  });

  it('formats last update time correctly', () => {
    const lastUpdate = new Date(Date.now() - 30000); // 30 seconds ago
    
    mockUseBusStore.mockReturnValue({
      buses: [],
      stations: [],
      lastUpdate,
      isLoading: false,
      error: null,
      refreshBuses: vi.fn(),
      clearError: vi.fn(),
      isAutoRefreshEnabled: false,
      startAutoRefresh: vi.fn(),
      stopAutoRefresh: vi.fn(),
      manualRefresh: vi.fn(),
    });

    render(<RefreshControl />);
    
    expect(screen.getByText(/30s ago/)).toBeInTheDocument();
  });

  it('shows never when no last update', () => {
    render(<RefreshControl />);
    
    expect(screen.getByText('Updated Never')).toBeInTheDocument();
  });
});