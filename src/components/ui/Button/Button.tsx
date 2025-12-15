import React from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';
import type { ButtonProps as MuiButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'filled' | 'outlined' | 'text' | 'tonal';
  loading?: boolean;
  icon?: React.ReactNode;
}

const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== 'materialVariant',
})<{ materialVariant?: 'filled' | 'outlined' | 'text' | 'tonal' }>(({ theme, materialVariant }) => ({
  borderRadius: 20,
  textTransform: 'none',
  fontWeight: 500,
  padding: '10px 24px',
  minHeight: 40,
  
  ...(materialVariant === 'filled' && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      boxShadow: theme.shadows[2],
    },
    '&:active': {
      boxShadow: theme.shadows[1],
    },
  }),
  
  ...(materialVariant === 'tonal' && {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.main,
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
      boxShadow: theme.shadows[1],
      filter: 'brightness(0.95)',
    },
  }),
  
  ...(materialVariant === 'outlined' && {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
  }),
  
  ...(materialVariant === 'text' && {
    color: theme.palette.primary.main,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: theme.palette.primary.main + '0A', // 4% opacity
    },
  }),
}));

export const Button: React.FC<ButtonProps> = ({
  variant = 'filled',
  loading = false,
  icon,
  children,
  disabled,
  ...props
}) => {
  const muiVariant = variant === 'filled' ? 'contained' : 
                     variant === 'tonal' ? 'contained' :
                     variant === 'outlined' ? 'outlined' : 'text';

  return (
    <StyledButton
      variant={muiVariant}
      materialVariant={variant}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={16} /> : icon}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button;