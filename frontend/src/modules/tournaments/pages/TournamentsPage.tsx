import React, { useCallback, useEffect, useState } from 'react';
import {
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
    IconButton,
    Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Tournament } from '../../../types';
import { deleteTournament, getTournaments } from '../services/tournaments.service';
import { CreateTournamentDialog } from '../components/CreateTournamentDialog';
import { EditTournamentDialog } from '../components/EditTournamentDialog';
import { ConfirmDeleteDialog } from '../../../components/ConfirmDeleteDialog';

export const TournamentsPage: React.FC = () => {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Estados Modales
    const [openCreateModal, setOpenCreateModal] = useState<boolean>(false);
    const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
    const [openEditModal, setOpenEditModal] = useState<boolean>(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);

    const fetchTournaments = useCallback(async () => {
        try {
            setLoading(true);
            setErrorMessage(null);
            const data = await getTournaments();
            setTournaments(data);
        } catch (error) {
            console.error('Error al cargar torneos:', error);
            setErrorMessage('No se pudo establecer conexión con el servidor de GolAdmin.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTournaments();
    }, [fetchTournaments]);

    const handleOpenEdit = (tournament: Tournament) => {
        setSelectedTournament(tournament);
        setOpenEditModal(true);
    };

    const handleOpenDelete = (tournament: Tournament) => {
        setSelectedTournament(tournament);
        setOpenDeleteDialog(true);
    };

    const ConfirmDelete = async () => {
        if (!selectedTournament) return;
        try {
            setDeleting(true);
            await deleteTournament(selectedTournament.id);
            setOpenDeleteDialog(false);
            setSelectedTournament(null);
            fetchTournaments();
        } catch (error) {
            console.error('Error al borrar torneo:', error);
            setErrorMessage('Ocurrió un error al intentar eliminar el torneo.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
                                <TableCell align="center"><b>Acciones</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tournaments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        No hay torneos registrados en la base de datos.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tournaments.map((t) => (
                                    <TableRow key={t.id} hover>
                                        <TableCell>{t.id}</TableCell>
                                        <TableCell>{t.name}</TableCell>
                                        <TableCell>{t.description || '-'}</TableCell>
                                        <TableCell>{new Date(t.startDate).toLocaleDateString('es-CO')}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={t.status}
                                                color={t.status === 'DRAFT' ? 'default' : 'success'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Editar">
                                                <IconButton color="primary" onClick={() => handleOpenEdit(t)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Eliminar">
                                                <IconButton color="error" onClick={() => handleOpenDelete(t)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <CreateTournamentDialog
                open={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
                onSuccess={fetchTournaments}
            />

            <EditTournamentDialog
                open={openEditModal}
                tournament={selectedTournament}
                onClose={() => {
                    setOpenEditModal(false);
                    setSelectedTournament(null);
                }}
                onSuccess={fetchTournaments}
            />

            <ConfirmDeleteDialog
                open={openDeleteDialog}
                title="¿Eliminar Torneo?"
                description={`¿Estás seguro de que deseas eliminar el torneo "${selectedTournament?.name}"? Esta acción no se puede deshacer.`}
                loading={deleting}
                onClose={() => {
                    setOpenDeleteDialog(false);
                    setSelectedTournament(null);
                }}
                onConfirm={ConfirmDelete}
            />
        </Box>
    );
};