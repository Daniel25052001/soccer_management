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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SportsIcon from '@mui/icons-material/Sports'; // Icono para abrir el Acta de Eventos
import type { Match, Team, Tournament } from '../../../types';
import { deleteMatch, getMatches } from '../services/matches.service';
import { getTeams } from '../../teams/services/teams.service';
import { getTournaments } from '../../tournaments/services/tournaments.service';
import { CreateMatchDialog } from '../components/CreateMatchDialog';
import { ConfirmDeleteDialog } from '../../../components/ConfirmDeleteDialog';
import { MatchEventsModal } from '../components/MatchEventsModal';// Importamos el modal del acta en tiempo real

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

    /**
     * Carga de forma asíncrona los partidos, equipos y torneos concurrentemente.
     */
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

    /**
     * Ejecuta la eliminación lógica/física de un partido validando restricciones del backend.
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
     * Retorna un componente Chip estilizado según el estado actual del partido.
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

    return (
        <Box>
            {/* Cabecera de la vista con título y botón de acción principal */}
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

            {/* Alerta de errores globales */}
            {errorMessage && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage(null)}>
                    {errorMessage}
                </Alert>
            )}

            {/* Contenido principal: Indicador de carga o tabla de datos */}
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
                                                {match.status === 'SCHEDULED' ? 'vs' : `${match.homeScore} - ${match.awayScore}`}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="left"><b>{match.awayTeam?.name}</b></TableCell>
                                        <TableCell align="center">{getStatusChip(match.status)}</TableCell>
                                        <TableCell align="center">
                                            {/* Botón para abrir el Acta de Eventos en vivo (Goles/Tarjetas) */}
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

                                            {/* Botón de Editar Partido */}
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

                                            {/* Botón de Eliminar Partido */}
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

            {/* Diálogo unificado para Crear y Editar Partidos */}
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

            {/* Modal para gestionar el Acta de Eventos en Tiempo Real (Goles y Tarjetas) */}
            <MatchEventsModal
                open={openEventsModal}
                match={matchForEvents}
                onClose={() => {
                    setOpenEventsModal(false);
                    setMatchForEvents(null);
                }}
                onScoreUpdated={fetchData}
            />

            {/* Diálogo de confirmación para eliminar un partido */}
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