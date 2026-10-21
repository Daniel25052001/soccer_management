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
    Box,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Team, Tournament } from '../../../types';
import { deleteTeam, getTeams } from '../services/teams.service';
import { getTournaments } from '../../tournaments/services/tournaments.service';
import { CreateTeamDialog } from '../components/CreateTeamDialog';
import { EditTeamDialog } from '../components/EditTeamDialog';
import { ConfirmDeleteDialog } from '../../../components/ConfirmDeleteDialog';

export const TeamsPage: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Estados de Modales
    const [openCreateModal, setOpenCreateModal] = useState<boolean>(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [openEditModal, setOpenEditModal] = useState<boolean>(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setErrorMessage(null);
            const [teamsData, tournamentsData] = await Promise.all([
                getTeams(),
                getTournaments(),
            ]);
            setTeams(teamsData);
            setTournaments(tournamentsData);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            setErrorMessage('No se pudieron obtener los datos de equipos desde la API.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getTournamentName = (tournamentId?: number | null): string => {
        if (!tournamentId) return 'Sin torneo';
        const found = tournaments.find((t) => t.id === tournamentId);
        return found ? found.name : `Torneo #${tournamentId}`;
    };

    const handleOpenEdit = (team: Team) => {
        setSelectedTeam(team);
        setOpenEditModal(true);
    };

    const handleOpenDelete = (team: Team) => {
        setSelectedTeam(team);
        setOpenDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!selectedTeam) return;
        try {
            setDeleting(true);
            setErrorMessage(null);
            await deleteTeam(selectedTeam.id);
            setOpenDeleteDialog(false);
            setSelectedTeam(null);
            fetchData();
        } catch (error: any) {
            console.error('Error al eliminar equipo:', error);

            // Extraemos el mensaje personalizado que envía NestJS desde el backend
            const backendMessage = error.response?.data?.message;

            if (Array.isArray(backendMessage)) {
                setErrorMessage(backendMessage.join(', '));
            } else if (typeof backendMessage === 'string') {
                setErrorMessage(backendMessage);
            } else {
                setErrorMessage('No se pudo eliminar el equipo seleccionado.');
            }

            setOpenDeleteDialog(false);
            setSelectedTeam(null);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Gestión de Equipos
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenCreateModal(true)}
                >
                    Nuevo Equipo
                </Button>
            </Box>

            {errorMessage && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage(null)}>
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
                                <TableCell><b>Nombre del Equipo</b></TableCell>
                                <TableCell><b>Torneo</b></TableCell>
                                <TableCell><b>Delegado</b></TableCell>
                                <TableCell><b>Teléfono</b></TableCell>
                                <TableCell align="center"><b>Acciones</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {teams.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        No hay equipos registrados en la base de datos.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                teams.map((team) => (
                                    <TableRow key={team.id} hover>
                                        <TableCell>{team.id}</TableCell>
                                        <TableCell>{team.name}</TableCell>
                                        <TableCell>{getTournamentName(team.tournamentId)}</TableCell>
                                        <TableCell>{team.delegateName || '-'}</TableCell>
                                        <TableCell>{team.delegatePhone || '-'}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Editar">
                                                <IconButton color="primary" onClick={() => handleOpenEdit(team)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Eliminar">
                                                <IconButton color="error" onClick={() => handleOpenDelete(team)}>
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

            <CreateTeamDialog
                open={openCreateModal}
                tournaments={tournaments}
                onClose={() => setOpenCreateModal(false)}
                onSuccess={fetchData}
            />

            <EditTeamDialog
                open={openEditModal}
                team={selectedTeam}
                tournaments={tournaments}
                onClose={() => {
                    setOpenEditModal(false);
                    setSelectedTeam(null);
                }}
                onSuccess={fetchData}
            />

            <ConfirmDeleteDialog
                open={openDeleteDialog}
                title="¿Eliminar Equipo?"
                description={`¿Estás seguro de que deseas eliminar el equipo "${selectedTeam?.name}"? Se perderá la relación con los torneos.`}
                loading={deleting}
                onClose={() => {
                    setOpenDeleteDialog(false);
                    setSelectedTeam(null);
                }}
                onConfirm={confirmDelete}
            />
        </Box>
    );
};