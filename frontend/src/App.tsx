import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Layout } from './components/Layout';
import { TournamentsPage } from './modules/tournaments/pages/TournamentsPage';
import { TeamsPage } from './modules/teams/pages/TeamsPage';
import { PlayersPage } from './modules/players/pages/PlayersPage';
import { MatchesPage } from './modules/matches/pages/MatchesPages';
import { StandingsPage } from './components/StandingsPage';
import { RefereesPage } from './modules/referees/pages/RefereesPage';

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
      <HashRouter>
        <Routes>
          <Route path="/admin" element={<Layout />}>
            <Route index element={<Navigate to="/admin/tournaments" replace />} />
            <Route path="tournaments" element={<TournamentsPage />} />
            <Route path="teams" element={<TeamsPage />} />
            <Route path="players" element={<PlayersPage />} />
            <Route path="matches" element={<MatchesPage />} />
            <Route path="standings" element={<StandingsPage />} />
            <Route path="referees" element={<RefereesPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/admin/tournaments" replace />} />
          <Route path="*" element={<Navigate to="/admin/tournaments" replace />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;