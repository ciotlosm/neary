// AppLayout - Basic layout component with integrated Header
// Uses Material-UI directly without wrappers

import type { FC, ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import { Header } from './Header';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  onNavigateToSettings?: () => void;
}

export const AppLayout: FC<AppLayoutProps> = ({ children, title, onNavigateToSettings }) => {
  const handleSettingsClick = () => {
    onNavigateToSettings?.();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header 
        title={title}
        onSettingsClick={handleSettingsClick}
      />
      
      <Container 
        component="main" 
        maxWidth="lg" 
        sx={{ 
          flexGrow: 1, 
          py: 2,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {children}
      </Container>
    </Box>
  );
};