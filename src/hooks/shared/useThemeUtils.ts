import { useTheme, alpha } from '@mui/material/styles';
import { useCallback } from 'react';

/**
 * Theme utility hook providing common theme-related functions
 * Eliminates duplication of theme color calculations and alpha transparency patterns
 */
export const useThemeUtils = () => {
  const theme = useTheme();

  // Common color utilities with alpha transparency
  const getStatusColors = useCallback(() => ({
    success: {
      main: theme.palette.success.main,
      light: alpha(theme.palette.success.main, 0.1),
      border: alpha(theme.palette.success.main, 0.3),
      hover: alpha(theme.palette.success.main, 0.2),
      text: alpha(theme.palette.success.main, 0.8),
    },
    warning: {
      main: theme.palette.warning.main,
      light: alpha(theme.palette.warning.main, 0.1),
      border: alpha(theme.palette.warning.main, 0.3),
      hover: alpha(theme.palette.warning.main, 0.2),
      text: alpha(theme.palette.warning.main, 0.8),
    },
    error: {
      main: theme.palette.error.main,
      light: alpha(theme.palette.error.main, 0.1),
      border: alpha(theme.palette.error.main, 0.3),
      hover: alpha(theme.palette.error.main, 0.2),
      text: alpha(theme.palette.error.main, 0.8),
    },
    primary: {
      main: theme.palette.primary.main,
      light: alpha(theme.palette.primary.main, 0.1),
      border: alpha(theme.palette.primary.main, 0.3),
      hover: alpha(theme.palette.primary.main, 0.2),
      text: alpha(theme.palette.primary.main, 0.8),
      gradient: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    },
    secondary: {
      main: theme.palette.secondary.main,
      light: alpha(theme.palette.secondary.main, 0.1),
      border: alpha(theme.palette.secondary.main, 0.3),
      hover: alpha(theme.palette.secondary.main, 0.2),
      text: alpha(theme.palette.secondary.main, 0.8),
    },
  }), [theme]);

  // Background utilities for cards and surfaces
  const getBackgroundColors = useCallback(() => ({
    paper: theme.palette.background.paper,
    paperFaded: alpha(theme.palette.background.paper, 0.3),
    paperHover: alpha(theme.palette.background.paper, 0.9),
    default: theme.palette.background.default,
    overlay: alpha(theme.palette.background.paper, 0.9),
    blur: alpha(theme.palette.background.paper, 0.8),
  }), [theme]);

  // Border utilities
  const getBorderColors = useCallback(() => ({
    divider: theme.palette.divider,
    dividerLight: alpha(theme.palette.divider, 0.1),
    dividerMedium: alpha(theme.palette.divider, 0.5),
    dividerStrong: alpha(theme.palette.divider, 0.7),
    outline: alpha(theme.palette.outline?.main || theme.palette.divider, 0.12),
  }), [theme]);

  // Text utilities with opacity variations
  const getTextColors = useCallback(() => ({
    primary: theme.palette.text.primary,
    primaryFaded: alpha(theme.palette.text.primary, 0.6),
    primaryLight: alpha(theme.palette.text.primary, 0.8),
    secondary: theme.palette.text.secondary,
    disabled: theme.palette.text.disabled,
    white: theme.palette.common.white,
    whiteFaded: alpha(theme.palette.common.white, 0.7),
    whiteLight: alpha(theme.palette.common.white, 0.1),
    whiteHover: alpha(theme.palette.common.white, 0.2),
  }), [theme]);

  // Delay/timing color utility (commonly used for ETA displays)
  const getDelayColor = useCallback((delay: number) => {
    if (delay <= 2) return theme.palette.success.main;
    if (delay <= 5) return theme.palette.warning.main;
    return theme.palette.error.main;
  }, [theme]);

  // Route color generator (consistent colors based on route ID)
  const getRouteColor = useCallback((routeId: string) => {
    const hash = routeId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  }, [theme]);

  // Data freshness color utility (for status indicators)
  const getDataFreshnessColor = useCallback((
    minutesSinceUpdate: number, 
    staleThreshold: number = 5,
    isOffline: boolean = false
  ) => {
    if (isOffline) {
      return theme.palette.error.main;
    }
    
    if (minutesSinceUpdate <= staleThreshold) {
      return theme.palette.success.main;
    }
    
    return theme.palette.warning.main;
  }, [theme]);

  // Common shadow utilities
  const getShadows = useCallback(() => ({
    light: theme.shadows[2],
    medium: theme.shadows[4],
    heavy: theme.shadows[8],
    none: 'none',
  }), [theme]);

  // Mode-specific utilities
  const isDarkMode = theme.palette.mode === 'dark';
  const isLightMode = theme.palette.mode === 'light';

  // Header background utility (commonly used pattern)
  const getHeaderBackground = useCallback(() => {
    return isDarkMode 
      ? theme.palette.background.paper
      : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`;
  }, [theme, isDarkMode]);

  return {
    theme,
    isDarkMode,
    isLightMode,
    getStatusColors,
    getBackgroundColors,
    getBorderColors,
    getTextColors,
    getDelayColor,
    getRouteColor,
    getDataFreshnessColor,
    getShadows,
    getHeaderBackground,
    // Direct alpha utility for custom cases
    alpha: (color: string, opacity: number) => alpha(color, opacity),
  };
};

/**
 * Simplified hook for just getting status colors (most common use case)
 */
export const useStatusColors = () => {
  const { getStatusColors } = useThemeUtils();
  return getStatusColors();
};

/**
 * Simplified hook for background colors
 */
export const useBackgroundColors = () => {
  const { getBackgroundColors } = useThemeUtils();
  return getBackgroundColors();
};