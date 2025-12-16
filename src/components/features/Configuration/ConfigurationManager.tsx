import React, { useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Card,
  CardContent,
  Stack,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
  Chip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Timer as TimerIcon,
  CheckCircle as CheckIcon,
  LocationOn as LocationOnIcon,
  BugReport as BugReportIcon,
} from '@mui/icons-material';

import { useConfigurationManager } from '../../../hooks/useConfigurationManager';
import { Button } from '../../ui/Button';
import LocationPicker from '../LocationPicker/LocationPicker';
import { LocationSettingsSection } from './sections/LocationSettingsSection';
import { AdvancedSettingsSection } from './sections/AdvancedSettingsSection';
import { logger, LogLevel } from '../../../utils/logger';

interface ConfigurationManagerProps {
  onConfigComplete?: () => void;
}

export const ConfigurationManager: React.FC<ConfigurationManagerProps> = ({
  onConfigComplete,
}) => {
  const theme = useTheme();
  const {
    // Form state
    formData,
    setFormData,
    errors,
    
    // API key validation
    isValidatingApiKey,
    apiKeyValid,
    showApiKey,
    setShowApiKey,
    
    // Location picker
    locationPickerOpen,
    locationPickerType,
    setLocationPickerOpen,
    
    // Submission
    isSubmitting,
    isSaving,
    
    // Actions
    handleApiKeyChange,
    handleCityChange,
    handleLogLevelChange,
    validateApiKey,
    handleLocationPicker,
    handleLocationSelected,
    handleSubmit,
    handleAutoSave,
    
    // Utilities
    formatLocationDisplay,
    
    // Data
    cityOptions,
    isConfigured,
  } = useConfigurationManager(onConfigComplete);



  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 3,
        boxShadow: theme.shadows[1],
      }}
    >
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              mr: 2,
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SettingsIcon />
          </Box>
          <Box>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              App Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure your API key, city, and locations
            </Typography>
          </Box>
        </Box>

      <Stack spacing={2}>
        {/* Display Settings */}
        <AdvancedSettingsSection
          refreshRate={formData.refreshRate || 30000}
          onRefreshRateChange={(rate) => setFormData(prev => ({ ...prev, refreshRate: rate }))}
          onRefreshRateBlur={(rate) => handleAutoSave('refreshRate', rate)}
          staleDataThreshold={formData.staleDataThreshold || 2}
          onStaleDataThresholdChange={(threshold) => setFormData(prev => ({ ...prev, staleDataThreshold: threshold }))}
          onStaleDataThresholdBlur={(threshold) => handleAutoSave('staleDataThreshold', threshold)}
          logLevel={formData.logLevel ?? 1}
          onLogLevelChange={handleLogLevelChange}
          maxVehiclesPerStation={formData.maxVehiclesPerStation || 5}
          onMaxVehiclesPerStationChange={(max) => setFormData(prev => ({ ...prev, maxVehiclesPerStation: max }))}
          onMaxVehiclesPerStationBlur={(max) => handleAutoSave('maxVehiclesPerStation', max)}
          refreshRateError={errors.refreshRate}
          staleDataError={errors.staleDataThreshold}
          maxVehiclesError={errors.maxVehiclesPerStation}
        />



        {/* Location Settings */}
        <LocationSettingsSection
          homeLocation={formData.homeLocation}
          workLocation={formData.workLocation}
          defaultLocation={formData.defaultLocation}
          onLocationPicker={handleLocationPicker}
          formatLocationDisplay={formatLocationDisplay}
        />

        {/* Auto-save Status */}
        {isConfigured && (
          <Box sx={{ pt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            {isSaving ? (
              <>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: 2,
                    borderColor: 'primary.main',
                    borderTopColor: 'transparent',
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                />
                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                  Saving changes...
                </Typography>
              </>
            ) : (
              <>
              </>
            )}
          </Box>
        )}

        {/* Initial Setup Button (only for new configurations) */}
        {!isConfigured && (
          <Box sx={{ pt: 2 }}>
            <Button
              variant="filled"
              size="large"
              fullWidth
              onClick={handleSubmit}
              loading={isSubmitting}
              sx={{ py: 1.5 }}
            >
              Save Configuration
            </Button>
          </Box>
        )}

        {/* Location Picker Dialog */}
        <LocationPicker
          open={locationPickerOpen}
          onClose={() => setLocationPickerOpen(false)}
          onLocationSelected={handleLocationSelected}
          title={
            locationPickerType === 'home' 
              ? 'Set Home Location' 
              : locationPickerType === 'work' 
                ? 'Set Work Location'
                : 'Set Offline Location'
          }
          type={locationPickerType}
          currentLocation={
            locationPickerType === 'home' 
              ? formData.homeLocation 
              : locationPickerType === 'work' 
                ? formData.workLocation
                : formData.defaultLocation
          }
        />
      </Stack>
      </CardContent>
    </Card>
  );
};

export default ConfigurationManager;