import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Avatar,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  DirectionsBus as BusIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from '@mui/icons-material';

interface BusCardProps {
  routeId: string;
  routeName?: string;
  destination: string;
  arrivalTime: string;
  isRealTime?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  delay?: number;
  location?: string;
  children?: React.ReactNode;
}

export const BusCard: React.FC<BusCardProps> = ({
  routeId,
  routeName,
  destination,
  arrivalTime,
  isRealTime = false,
  isFavorite = false,
  onToggleFavorite,
  delay = 0,
  location,
  children,
}) => {
  const theme = useTheme();
  
  const getDelayColor = (delay: number) => {
    if (delay <= 2) return theme.palette.success.main;
    if (delay <= 5) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getRouteColor = (routeId: string) => {
    // Generate a consistent color based on route ID
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
  };

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 3,
        boxShadow: theme.shadows[2],
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: getRouteColor(routeId),
              width: 48,
              height: 48,
              mr: 2,
              fontWeight: 'bold',
              fontSize: '0.9rem',
            }}
          >
            {routeId}
          </Avatar>
          
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  flexGrow: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {routeName || `Route ${routeId}`}
              </Typography>
              
              {onToggleFavorite && (
                <IconButton
                  onClick={onToggleFavorite}
                  size="small"
                  sx={{
                    color: isFavorite ? theme.palette.error.main : theme.palette.text.secondary,
                  }}
                >
                  {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              )}
            </Box>
            
            {destination && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {destination}
                </Typography>
              </Box>
            )}
            
            {location && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BusIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {location}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TimeIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: isRealTime ? theme.palette.success.main : theme.palette.text.primary,
              }}
            >
              {arrivalTime}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isRealTime && (
              <Chip
                label="LIVE"
                size="small"
                sx={{
                  bgcolor: theme.palette.success.main,
                  color: theme.palette.success.contrastText,
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 24,
                }}
              />
            )}
            
            {delay > 0 && (
              <Chip
                label={`+${delay}min`}
                size="small"
                sx={{
                  bgcolor: alpha(getDelayColor(delay), 0.1),
                  color: getDelayColor(delay),
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 24,
                }}
              />
            )}
          </Box>
        </Box>
        
        {children}
      </CardContent>
    </Card>
  );
};

interface InfoCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  subtitle,
  icon,
  children,
  actions,
}) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 3,
        boxShadow: theme.shadows[1],
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon && (
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                mr: 2,
                width: 40,
                height: 40,
              }}
            >
              {icon}
            </Avatar>
          )}
          <Box>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        {children}
      </CardContent>
      {actions && (
        <CardActions sx={{ pt: 0 }}>
          {actions}
        </CardActions>
      )}
    </Card>
  );
};

export default BusCard;