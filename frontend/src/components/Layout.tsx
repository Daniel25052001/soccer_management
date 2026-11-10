import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { Link, Outlet } from 'react-router-dom';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LeaderboardIcon from '@mui/icons-material/Leaderboard'; // Ícono para la tabla de posiciones
import SportsIcon from '@mui/icons-material/Sports'; // Silbato deportivo
export const Layout: React.FC = () => {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        GolAdmin PWA
                    </Typography>

                    {/* Rutas corregidas con el prefijo /admin */}
                    <Button color="inherit" component={Link} to="/admin/tournaments" startIcon={<EmojiEventsIcon />}>
                        Torneos
                    </Button>
                    <Button color="inherit" component={Link} to="/admin/teams" startIcon={<GroupsIcon />}>
                        Equipos
                    </Button>
                    <Button color="inherit" component={Link} to="/admin/players" startIcon={<PersonIcon />}>
                        Jugadores
                    </Button>
                    <Button
                        color="inherit"
                        component={Link}
                        to="/admin/referees"
                        startIcon={<SportsIcon />}
                    >
                        Árbitros
                    </Button>
                    <Button color="inherit" component={Link} to="/admin/matches" startIcon={<CalendarMonthIcon />}>
                        Partidos
                    </Button>
                    {/* Nueva opción integrada en el tablero de opciones principal */}
                    <Button color="inherit" component={Link} to="/admin/standings" startIcon={<LeaderboardIcon />}>
                        Posiciones
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Outlet />
            </Container>
        </Box>
    );
};