import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Layout } from './components/Layout';
import { TournamentsPage } from './modules/tournaments/pages/TournamentsPage';
import { TeamsPage } from './modules/teams/pages/TeamsPage';
import { PlayersPage } from './modules/players/pages/PlayersPage';
import { MatchesPage } from './modules/matches/pages/MatchesPages';
import { StandingsPage } from './components/StandingsPage';
import { RefereesPage } from './modules/referees/pages/RefereesPage'; // <-- NUEVO: Importamos la vista de árbitros

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

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* =========================================================
              PANEL DE ADMINISTRACIÓN / GESTIÓN PRINCIPAL
              Aquí agrupamos todas las vistas internas de la PWA
             ========================================================= */}
          <Route path="/admin" element={<Layout />}>
            {/* Redirige /admin por defecto hacia la lista de torneos */}
            <Route index element={<Navigate to="/admin/tournaments" replace />} />

            <Route path="tournaments" element={<TournamentsPage />} />
            <Route path="teams" element={<TeamsPage />} />
            <Route path="players" element={<PlayersPage />} />
            <Route path="matches" element={<MatchesPage />} />
            <Route path="standings" element={<StandingsPage />} />

            {/* NUEVA RUTA: Gestión de árbitros y jueces del torneo */}
            <Route path="referees" element={<RefereesPage />} />
          </Route>

          {/* =========================================================
              RUTAS GLOBALES O PÚBLICAS POR DEFECTO
             ========================================================= */}
          {/* Si entran a la raíz "/", los mandamos al panel de administración o torneos */}
          <Route path="/" element={<Navigate to="/admin/tournaments" replace />} />

          {/* Redirección por defecto si escriben cualquier ruta desconocida */}
          <Route path="*" element={<Navigate to="/admin/tournaments" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;