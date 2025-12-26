// Header - Simple header component with dynamic title and integrated status indicator
// Uses Material-UI directly without wrappers

import type { FC } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { StatusIndicator } from '../features/status/StatusIndicator';

interface HeaderProps {
  title?: string;
  onSettingsClick?: () => void;
}

export const Header: FC<HeaderProps> = ({ 
  title = 'Bus Tracker',
  onSettingsClick
}) => {
  return (
    <AppBar position="static">
      <Toolbar>
        {/* App Icon */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          mr: 2
        }}>
          <img 
            src="/neary.svg" 
            alt="Neary" 
            style={{ 
              width: 32, 
              height: 32
            }} 
          />
        </Box>
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        
        {/* Status Indicator positioned in top right area */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          mr: onSettingsClick ? 1 : 0 // Add margin if settings button is present
        }}>
          <StatusIndicator />
        </Box>
        
        {onSettingsClick && (
          <IconButton
            color="inherit"
            onClick={onSettingsClick}
            aria-label="settings"
          >
            <SettingsIcon />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
};