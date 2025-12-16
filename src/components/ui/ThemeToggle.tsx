import React from 'react';
import {
  IconButton,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import { useThemeStore } from '../../stores/themeStore';

interface ThemeToggleProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'inherit' | 'primary' | 'secondary' | 'default';
  iconOnly?: boolean; // New prop to render just the icon without button wrapper
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  size = 'medium',
  color = 'inherit',
  iconOnly = false
}) => {
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeStore();
  
  const isDark = mode === 'dark';
  
  // If iconOnly is true, just return the icon (for use inside other button components)
  if (iconOnly) {
    return isDark ? (
      <LightModeIcon 
        sx={{ 
          color: color === 'inherit' ? 'inherit' : undefined,
          transition: 'transform 0.3s ease-in-out',
        }} 
      />
    ) : (
      <DarkModeIcon 
        sx={{ 
          color: color === 'inherit' ? 'inherit' : undefined,
          transition: 'transform 0.3s ease-in-out',
        }} 
      />
    );
  }
  
  return (
    <Tooltip title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
      <IconButton
        onClick={toggleTheme}
        size={size}
        color={color}
        sx={{
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            bgcolor: alpha(theme.palette.common.white, 0.1),
            transform: 'rotate(180deg)',
          },
        }}
      >
        {isDark ? (
          <LightModeIcon 
            sx={{ 
              color: color === 'inherit' ? 'inherit' : undefined,
              transition: 'transform 0.3s ease-in-out',
            }} 
          />
        ) : (
          <DarkModeIcon 
            sx={{ 
              color: color === 'inherit' ? 'inherit' : undefined,
              transition: 'transform 0.3s ease-in-out',
            }} 
          />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;