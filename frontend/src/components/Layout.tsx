import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { Link, Outlet } from 'react-router-dom';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';

/**
 * Layout principal de la PWA GolAdmin.
 * Provee la barra de navegación superior (Navbar) fija y el contenedor
 * dinámico (Outlet) donde se renderizan las vistas de Torneos y Equipos.
 * 
 * @returns {JSX.Element} Estructura base con AppBar y área de contenido.
 */
export const Layout: React.FC = () => {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, fontWeight: 'bold' }}
                    >
                        GolAdmin PWA
                    </Typography>
                    <Button
                        color="inherit"
                        component={Link}
                        to="/tournaments"
                        startIcon={<EmojiEventsIcon />}
                    >
                        Torneos
                    </Button>
                    <Button
                        color="inherit"
                        component={Link}
                        to="/teams"
                        startIcon={<GroupsIcon />}
                    >
                        Equipos
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Outlet />
            </Container>
        </Box>
    );
};