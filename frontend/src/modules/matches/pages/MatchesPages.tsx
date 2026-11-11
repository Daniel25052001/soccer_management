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
    Select,
    FormControl,
    TablePagination, // Componente de paginación de MUI
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SportsIcon from '@mui/icons-material/Sports';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';

import type { Match, Team, Tournament, MatchStatus, Referee } from '../../../types';
import { deleteMatch, getMatches, updateMatch } from '../services/matches.service';
import { getTeams } from '../../teams/services/teams.service';
import { getTournaments } from '../../tournaments/services/tournaments.service';
import { getReferees } from '../../referees/services/referees.service';
import { CreateMatchDialog } from '../components/CreateMatchDialog';
import { ConfirmDeleteDialog } from '../../../components/ConfirmDeleteDialog';
import { MatchEventsModal } from '../components/MatchEventsModal';
import { apiClient } from '../../../api/apiClient';

/**
 * Componente principal para la gestión del calendario de partidos, 
 * control de estados, actas de eventos, asignación de árbitros y paginación del torneo.
 */
export const MatchesPage: React.FC = () => {
    // Estados principales para la gestión de datos
    const [matches, setMatches] = useState<Match[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [referees, setReferees] = useState<Referee[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Estados para la paginación de la tabla
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);

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

    /**
     * Carga inicial sincronizada de partidos, equipos, torneos y árbitros desde el servidor.
     */
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setErrorMessage(null);
            const [matchesData, teamsData, tournamentsData, refereesData] = await Promise.all([
                getMatches(),
                getTeams(),
                getTournaments(),
                getReferees(),
            ]);
            setMatches(matchesData);
            setTeams(teamsData);
            setTournaments(tournamentsData);
            setReferees(refereesData);
        } catch (error) {
            console.error('Error al cargar datos del calendario:', error);
            setErrorMessage('No se pudieron obtener los datos necesarios del servidor.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    /**
     * Cambia de página en la tabla de partidos.
     */
    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    /**
     * Modifica la cantidad de filas mostradas por página y reinicia a la primera página.
     */
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleStatusMenuOpen = (event: React.MouseEvent<HTMLElement>, match: Match) => {
        setAnchorEl(event.currentTarget);
        setStatusMatchTarget(match);
    };

    const handleStatusMenuClose = () => {
        setAnchorEl(null);
        setStatusMatchTarget(null);
    };

    /**
     * Cambia manualmente el estado del partido (Programado, En Juego, Finalizado).
     */
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

    /**
     * Asigna o desasigna un árbitro a un partido específico de forma inmediata.
     */
    const handleAssignReferee = async (matchId: number, refereeId: number | null) => {
        try {
            setErrorMessage(null);
            await apiClient.patch(`/matches/${matchId}/assign-referee`, { refereeId });
            fetchData();
        } catch (error) {
            console.error('Error al asignar árbitro:', error);
            setErrorMessage('No se pudo actualizar el árbitro asignado al partido.');
        }
    };

    /**
     * Ejecuta la eliminación del partido seleccionado tras confirmación.
     */
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

    /**
     * Devuelve un chip estilizado según el estado actual del partido.
     */
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

    // Subconjunto de partidos correspondientes a la página actual
    const paginatedMatches = matches.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

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
                                <TableCell align="center"><b>Árbitro / Juez</b></TableCell>
                                <TableCell align="center"><b>Estado</b></TableCell>
                                <TableCell align="center"><b>Acciones</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {matches.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        No hay partidos programados en el sistema.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedMatches.map((match) => (
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
                                                    : `${match.homeScore ?? 0} - ${match.awayScore ?? 0}`}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="left"><b>{match.awayTeam?.name}</b></TableCell>

                                        {/* Columna de Asignación de Árbitro */}
                                        <TableCell align="center">
                                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                                <Select
                                                    value={match.refereeId || ''}
                                                    displayEmpty
                                                    onChange={(e) => handleAssignReferee(match.id, e.target.value ? Number(e.target.value) : null)}
                                                    sx={{ fontSize: '0.875rem' }}
                                                >
                                                    <MenuItem value="">
                                                        <em>Sin asignar</em>
                                                    </MenuItem>
                                                    {referees.map((ref) => (
                                                        <MenuItem key={ref.id} value={ref.id}>
                                                            {ref.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </TableCell>

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

                    {/* Controles de Paginación */}
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={matches.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Partidos por página:"
                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                    />
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

export default MatchesPage;