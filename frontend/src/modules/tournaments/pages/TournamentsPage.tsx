import React, { useCallback, useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Box,
    CircularProgress,
    Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { Tournament } from '../../../types';
import { getTournaments } from '../services/tournaments.service';
import { CreateTournamentDialog } from '../components/CreateTournamentDialog';

/**
 * Vista principal de administración y consulta de torneos para GolAdmin PWA.
 * 
 * @returns {JSX.Element} Componente maquetado con Material UI.
 */
export const TournamentsPage: React.FC = () => {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [openCreateModal, setOpenCreateModal] = useState<boolean>(false);

    /**
     * Ejecuta la petición al servicio para obtener la lista de torneos.
     */
    const fetchTournaments = useCallback(async () => {
        try {
            setLoading(true);
            setErrorMessage(null);
            const data = await getTournaments();
            setTournaments(data);
        } catch (error) {
            console.error('Error al cargar torneos desde la API:', error);
            setErrorMessage('No se pudo establecer conexión con el servidor de GolAdmin.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTournaments();
    }, [fetchTournaments]);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                }}
            >
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Gestión de Torneos
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenCreateModal(true)}
                >
                    Nuevo Torneo
                </Button>
            </Box>

            {errorMessage && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {errorMessage}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} elevation={3}>
                    <Table>
                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell><b>ID</b></TableCell>
                                <TableCell><b>Nombre del Torneo</b></TableCell>
                                <TableCell><b>Descripción</b></TableCell>
                                <TableCell><b>Fecha de Inicio</b></TableCell>
                                <TableCell><b>Estado</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tournaments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No hay torneos registrados en la base de datos.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tournaments.map((t) => (
                                    <TableRow key={t.id} hover>
                                        <TableCell>{t.id}</TableCell>
                                        <TableCell>{t.name}</TableCell>
                                        <TableCell>{t.description || '-'}</TableCell>
                                        <TableCell>
                                            {new Date(t.startDate).toLocaleDateString('es-CO')}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={t.status}
                                                color={t.status === 'DRAFT' ? 'default' : 'success'}
                                                size="small"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Modal de Creación */}
            <CreateTournamentDialog
                open={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
                onSuccess={fetchTournaments}
            />
        </Container>
    );
};