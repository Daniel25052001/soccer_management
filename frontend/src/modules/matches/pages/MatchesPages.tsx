import React, { useCallback, useEffect, useState } from 'react';
import {
    Typography,
    Button,
    Paper,
    Box,
    CircularProgress,
    Alert,
    IconButton,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Menu,
    MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SportsIcon from '@mui/icons-material/Sports';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import type { Match, Team, Tournament, MatchStatus } from '../../../types';
import { deleteMatch, getMatches, updateMatch } from '../services/matches.service';
import { getTeams } from '../../teams/services/teams.service';
import { getTournaments } from '../../tournaments/services/tournaments.service';
import { CreateMatchDialog } from '../components/CreateMatchDialog';
import { ConfirmDeleteDialog } from '../../../components/ConfirmDeleteDialog';
import { MatchEventsModal } from '../components/MatchEventsModal';

export const MatchesPage: React.FC = () => {
    // Estados principales para la gestión de datos
    const [matches, setMatches] = useState<Match[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Estados para modales de creación, edición y eliminación de partidos
    const [openCreateModal, setOpenCreateModal] = useState<boolean>(false);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [matchToEdit, setMatchToEdit] = useState<Match | null>(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);

    // Estados para controlar el modal del Acta de Eventos en vivo
    const [openEventsModal, setOpenEventsModal] = useState<boolean>(false);
    const [matchForEvents, setMatchForEvents] = useState<Match | null>(null);

    // Estado para el menú desplegable de cambio manual de estado
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [statusMatchTarget, setStatusMatchTarget] = useState<Match | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setErrorMessage(null);
            const [matchesData, teamsData, tournamentsData] = await Promise.all([
                getMatches(),
                getTeams(),
                getTournaments(),
            ]);
            setMatches(matchesData);
            setTeams(teamsData);
            setTournaments(tournamentsData);
        } catch (error) {
            console.error('Error al cargar partidos:', error);
            setErrorMessage('No se pudieron obtener los datos de los partidos.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStatusMenuOpen = (event: React.MouseEvent<HTMLElement>, match: Match) => {
        setAnchorEl(event.currentTarget);
        setStatusMatchTarget(match);
    };

    const handleStatusMenuClose = () => {
        setAnchorEl(null);
        setStatusMatchTarget(null);
    };

    // Función para cambiar manualmente el estado del partido
    const handleStatusChange = async (newStatus: MatchStatus) => {
        if (!statusMatchTarget) return;
        try {
            setErrorMessage(null);
            await updateMatch(statusMatchTarget.id, { status: newStatus });
            handleStatusMenuClose();
            fetchData();
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            setErrorMessage('No se pudo cambiar el estado del partido.');
            handleStatusMenuClose();
        }
    };

    const confirmDelete = async () => {
        if (!selectedMatch) return;
        try {
            setDeleting(true);
            setErrorMessage(null);
            await deleteMatch(selectedMatch.id);
            setOpenDeleteDialog(false);
            setSelectedMatch(null);
            fetchData();
        } catch (error: any) {
            console.error('Error al eliminar partido:', error);
            const backendMessage = error?.response?.data?.message;
            setErrorMessage(
                typeof backendMessage === 'string'
                    ? backendMessage
                    : 'No se pudo eliminar el partido seleccionado.'
            );
            setOpenDeleteDialog(false);
        } finally {
            setDeleting(false);
        }
    };

    const getStatusChip = (status: string) => {
        switch (status) {
            case 'FINISHED':
                return <Chip label="Finalizado" color="success" size="small" />;
            case 'IN_PROGRESS':
                return <Chip label="En Juego" color="secondary" size="small" />;
            case 'POSTPONED':
                return <Chip label="Aplazado" color="warning" size="small" />;
            default:
                return <Chip label="Programado" color="default" size="small" />;
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Calendario de Partidos
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setMatchToEdit(null);
                        setOpenCreateModal(true);
                    }}
                >
                    Programar Partido
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
                                <TableCell><b>Fecha y Hora</b></TableCell>
                                <TableCell><b>Torneo</b></TableCell>
                                <TableCell align="right"><b>Local</b></TableCell>
                                <TableCell align="center"><b>Resultado</b></TableCell>
                                <TableCell align="left"><b>Visitante</b></TableCell>
                                <TableCell align="center"><b>Estado</b></TableCell>
                                <TableCell align="center"><b>Acciones</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {matches.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No hay partidos programados en el sistema.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                matches.map((match) => (
                                    <TableRow key={match.id} hover>
                                        <TableCell>
                                            {new Date(match.matchDate).toLocaleString('es-CO', {
                                                dateStyle: 'short',
                                                timeStyle: 'short',
                                            })}
                                        </TableCell>
                                        <TableCell>{match.tournament?.name || `Torneo #${match.tournamentId}`}</TableCell>
                                        <TableCell align="right"><b>{match.homeTeam?.name}</b></TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                {match.status === 'SCHEDULED'
                                                    ? 'vs'
                                                    : `${match.homeScore} - ${match.awayScore}`}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="left"><b>{match.awayTeam?.name}</b></TableCell>

                                        {/* Estado con opción de despliegue al hacer clic */}
                                        <TableCell align="center">
                                            <Box
                                                sx={{ cursor: 'pointer', display: 'inline-block' }}
                                                onClick={(e) => handleStatusMenuOpen(e, match)}
                                                title="Cambiar estado manualmente"
                                            >
                                                {getStatusChip(match.status)}
                                            </Box>
                                        </TableCell>

                                        <TableCell align="center">
                                            <Tooltip title="Acta del Partido (Eventos)">
                                                <IconButton
                                                    color="secondary"
                                                    onClick={() => {
                                                        setMatchForEvents(match);
                                                        setOpenEventsModal(true);
                                                    }}
                                                >
                                                    <SportsIcon />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Editar Partido">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => {
                                                        setMatchToEdit(match);
                                                        setOpenCreateModal(true);
                                                    }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Eliminar Partido">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => {
                                                        setSelectedMatch(match);
                                                        setOpenDeleteDialog(true);
                                                    }}
                                                >
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

            {/* Menú flotante para cambio manual de estado */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleStatusMenuClose}
            >
                <MenuItem onClick={() => handleStatusChange('SCHEDULED')}>
                    <ScheduleIcon fontSize="small" sx={{ mr: 1 }} /> Programar
                </MenuItem>
                <MenuItem onClick={() => handleStatusChange('IN_PROGRESS')}>
                    <PlayArrowIcon fontSize="small" sx={{ mr: 1, color: 'secondary.main' }} /> En Juego
                </MenuItem>
                <MenuItem onClick={() => handleStatusChange('FINISHED')}>
                    <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} /> Finalizar
                </MenuItem>
            </Menu>

            <CreateMatchDialog
                open={openCreateModal}
                tournaments={tournaments}
                teams={teams}
                matchToEdit={matchToEdit}
                onClose={() => {
                    setOpenCreateModal(false);
                    setMatchToEdit(null);
                }}
                onSuccess={() => {
                    fetchData();
                    setOpenCreateModal(false);
                    setMatchToEdit(null);
                }}
            />

            <MatchEventsModal
                open={openEventsModal}
                match={matchForEvents}
                onClose={() => {
                    setOpenEventsModal(false);
                    setMatchForEvents(null);
                }}
                onScoreUpdated={fetchData}
            />

            <ConfirmDeleteDialog
                open={openDeleteDialog}
                title="¿Eliminar Partido?"
                description={`¿Estás seguro de que deseas eliminar el enfrentamiento entre "${selectedMatch?.homeTeam?.name}" y "${selectedMatch?.awayTeam?.name}"?`}
                loading={deleting}
                onClose={() => {
                    setOpenDeleteDialog(false);
                    setSelectedMatch(null);
                }}
                onConfirm={confirmDelete}
            />
        </Box>
    );
};