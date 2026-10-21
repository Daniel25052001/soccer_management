import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Layout } from './components/Layout';
import { TournamentsPage } from './modules/tournaments/pages/TournamentsPage';
import { TeamsPage } from './modules/teams/pages/TeamsPage';

/**
 * Tema global de Material UI para GolAdmin PWA.
 */
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f8f9fa',
    },
  },
});

/**
 * Componente raíz de la PWA con enrutamiento y proveedores de tema.
 * 
 * @returns {JSX.Element} Árbol de componentes principal.
 */
export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/tournaments" replace />} />
            <Route path="tournaments" element={<TournamentsPage />} />
            <Route path="teams" element={<TeamsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;