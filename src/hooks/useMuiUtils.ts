import { useCallback } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';
import { useThemeUtils } from './useThemeUtils';

/**
 * Material-UI utility hook providing common component styling patterns
 * Eliminates duplication of sx prop patterns across components
 */
export const useMuiUtils = () => {
  const { 
    getStatusColors, 
    getBackgroundColors, 
    getBorderColors, 
    getShadows,
    alpha,
    theme 
  } = useThemeUtils();

  // Common card styles
  const getCardStyles = useCallback((variant: 'default' | 'elevated' | 'outlined' | 'glass' = 'default'): SxProps<Theme> => {
    const backgrounds = getBackgroundColors();
    const borders = getBorderColors();
    const shadows = getShadows();

    const baseStyles: SxProps<Theme> = {
      borderRadius: 2, // Reduced from 3 to 2 for more reasonable corner radius
      transition: 'all 0.2s ease-in-out',
      position: 'relative',
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyles,
          boxShadow: shadows.light,
          '&:hover': {
            boxShadow: shadows.medium,
          },
        };
      
      case 'outlined':
        return {
          ...baseStyles,
          border: `1px solid ${borders.dividerLight}`,
          boxShadow: 'none',
        };
      
      case 'glass':
        return {
          ...baseStyles,
          bgcolor: backgrounds.blur,
          backdropFilter: 'blur(16px)',
          border: `1px solid ${borders.dividerMedium}`,
        };
      
      default:
        return {
          ...baseStyles,
          boxShadow: shadows.light,
        };
    }
  }, [getBackgroundColors, getBorderColors, getShadows]);

  // Common button styles
  const getButtonStyles = useCallback((
    variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' = 'primary',
    size: 'small' | 'medium' | 'large' = 'medium'
  ): SxProps<Theme> => {
    const colors = getStatusColors();
    
    const colorConfig = variant === 'primary' ? colors.primary :
                       variant === 'secondary' ? colors.secondary :
                       variant === 'success' ? colors.success :
                       variant === 'warning' ? colors.warning :
                       colors.error;

    const sizeConfig = {
      small: { height: 32, fontSize: '0.75rem', px: 2 },
      medium: { height: 40, fontSize: '0.875rem', px: 3 },
      large: { height: 48, fontSize: '1rem', px: 4 },
    };

    return {
      ...sizeConfig[size],
      bgcolor: colorConfig.light,
      color: colorConfig.main,
      border: `1px solid ${colorConfig.border}`,
      borderRadius: 2,
      fontWeight: 600,
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        bgcolor: colorConfig.hover,
        border: `1px solid ${colorConfig.main}`,
        transform: 'scale(1.02)',
      },
    };
  }, [getStatusColors]);

  // Common chip styles
  const getChipStyles = useCallback((
    variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' = 'primary',
    size: 'small' | 'medium' = 'medium'
  ): SxProps<Theme> => {
    const colors = getStatusColors();
    
    const colorConfig = variant === 'primary' ? colors.primary :
                       variant === 'secondary' ? colors.secondary :
                       variant === 'success' ? colors.success :
                       variant === 'warning' ? colors.warning :
                       colors.error;

    return {
      bgcolor: colorConfig.light,
      color: colorConfig.main,
      border: `1px solid ${colorConfig.border}`,
      fontSize: size === 'small' ? '0.65rem' : '0.75rem',
      height: size === 'small' ? 20 : 24,
      fontWeight: 600,
      '& .MuiChip-label': {
        px: size === 'small' ? 1 : 1.5,
      },
    };
  }, [getStatusColors]);

  // Common avatar styles
  const getAvatarStyles = useCallback((
    variant: 'primary' | 'secondary' | 'route' = 'primary',
    size: number = 44
  ): SxProps<Theme> => {
    const colors = getStatusColors();
    
    const colorConfig = variant === 'primary' ? colors.primary :
                       variant === 'secondary' ? colors.secondary :
                       colors.primary; // Default for route

    return {
      bgcolor: colorConfig.main,
      width: size,
      height: size,
      fontWeight: 'bold',
      fontSize: size < 40 ? '0.75rem' : '0.85rem',
    };
  }, [getStatusColors]);

  // Common status indicator styles (pills)
  const getStatusIndicatorStyles = useCallback((
    variant: 'success' | 'warning' | 'error' = 'success',
    compact: boolean = false
  ): SxProps<Theme> => {
    const colors = getStatusColors();
    
    const colorConfig = variant === 'success' ? colors.success :
                       variant === 'warning' ? colors.warning :
                       colors.error;

    return {
      display: 'flex',
      alignItems: 'center',
      gap: 0.5,
      px: compact ? 1 : 1.5,
      py: compact ? 0.25 : 0.5,
      borderRadius: compact ? '12px' : '16px',
      bgcolor: colorConfig.light,
      border: `1px solid ${colorConfig.border}`,
      color: colorConfig.main,
      minWidth: 'auto',
      fontSize: compact ? '0.65rem' : '0.75rem',
      fontWeight: 600,
    };
  }, [getStatusColors]);

  // Common modal/dialog styles
  const getModalStyles = useCallback((): SxProps<Theme> => {
    const backgrounds = getBackgroundColors();
    const borders = getBorderColors();

    return {
      bgcolor: backgrounds.paper,
      borderRadius: 2, // Reduced from 3 to 2 for consistency
      boxShadow: 24,
      border: `1px solid ${borders.dividerLight}`,
      backdropFilter: 'blur(8px)',
    };
  }, [getBackgroundColors, getBorderColors]);

  // Common header styles
  const getHeaderStyles = useCallback((): SxProps<Theme> => {
    const { getHeaderBackground } = useThemeUtils();
    const borders = getBorderColors();
    const shadows = getShadows();

    return {
      background: getHeaderBackground(),
      boxShadow: theme.palette.mode === 'dark' ? 'none' : shadows.medium,
      borderBottom: theme.palette.mode === 'dark' 
        ? `1px solid ${borders.outline}` 
        : 'none',
    };
  }, [getBorderColors, getShadows, theme]);

  // Common list item styles
  const getListItemStyles = useCallback((
    isLast: boolean = false,
    isSelected: boolean = false,
    variant: 'default' | 'favorite' = 'default'
  ): SxProps<Theme> => {
    const colors = getStatusColors();
    const borders = getBorderColors();

    return {
      borderBottom: !isLast ? `1px solid ${borders.dividerLight}` : 'none',
      bgcolor: isSelected 
        ? (variant === 'favorite' ? colors.success.light : colors.primary.light)
        : 'transparent',
      '&:hover': {
        bgcolor: isSelected
          ? (variant === 'favorite' ? alpha(colors.success.main, 0.06) : alpha(colors.primary.main, 0.06))
          : (variant === 'favorite' ? alpha(colors.success.main, 0.04) : alpha(colors.primary.main, 0.04)),
      },
    };
  }, [getStatusColors, getBorderColors, alpha]);

  return {
    getCardStyles,
    getButtonStyles,
    getChipStyles,
    getAvatarStyles,
    getStatusIndicatorStyles,
    getModalStyles,
    getHeaderStyles,
    getListItemStyles,
  };
};

/**
 * Simplified hook for common card styles
 */
export const useCardStyles = () => {
  const { getCardStyles } = useMuiUtils();
  return getCardStyles;
};

/**
 * Simplified hook for common button styles
 */
export const useButtonStyles = () => {
  const { getButtonStyles } = useMuiUtils();
  return getButtonStyles;
};