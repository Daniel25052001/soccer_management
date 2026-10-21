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
    Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Match, MatchStatus, Team, Tournament } from '../../../types';
import { deleteMatch, getMatches } from '../services/matches.service';
import { getTournaments } from '../../tournaments/services/tournaments.service';
import { getTeams } from '../../teams/services/teams.service';
import { CreateMatchDialog } from '../components/CreateMatchDialog';
import { UpdateScoreDialog } from '../components/UpdateScoreDialog';
import { ConfirmDeleteDialog } from '../../../components/ConfirmDeleteDialog';

export const MatchesPage: React.FC = () => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Modales
    const [openCreateModal, setOpenCreateModal] = useState<boolean>(false);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [openScoreModal, setOpenScoreModal] = useState<boolean>(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setErrorMessage(null);
            const [matchesData, tournsData, teamsData] = await Promise.all([
                getMatches(),
                getTournaments(),
                getTeams(),
            ]);
            setMatches(matchesData);
            setTournaments(tournsData);
            setTeams(teamsData);
        } catch (error) {
            console.error('Error al cargar fixture:', error);
            setErrorMessage('No se pudo establecer comunicación con el servidor de GolAdmin.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getTeamName = (teamId: number, teamRelation?: Team) => {
        if (teamRelation) return teamRelation.name;
        const found = teams.find((t) => t.id === teamId);
        return found ? found.name : `Equipo #${teamId}`;
    };

    const renderStatusChip = (status: MatchStatus) => {
        switch (status) {
            case 'SCHEDULED':
                return <Chip label="Programado" color="info" size="small" />;
            case 'IN_PROGRESS':
                return <Chip label="En Juego" color="warning" size="small" />;
            case 'FINISHED':
                return <Chip label="Finalizado" color="success" size="small" />;
            case 'POSTPONED':
                return <Chip label="Aplazado" color="default" size="small" />;
            case 'CANCELLED':
                return <Chip label="Cancelado" color="error" size="small" />;
            default:
                return <Chip label={status} size="small" />;
        }
    };

    const handleOpenScore = (match: Match) => {
        setSelectedMatch(match);
        setOpenScoreModal(true);
    };

    const handleOpenDelete = (match: Match) => {
        setSelectedMatch(match);
        setOpenDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!selectedMatch) return;
        try {
            setDeleting(true);
            await deleteMatch(selectedMatch.id);
            setOpenDeleteDialog(false);
            setSelectedMatch(null);
            fetchData();
        } catch (error) {
            console.error('Error al eliminar partido:', error);
            setErrorMessage('No se pudo eliminar el partido seleccionado.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Programación y Fixture
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenCreateModal(true)}
                >
                    Programar Partido
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
                                <TableCell><b>Fecha / Hora</b></TableCell>
                                <TableCell align="right"><b>Local</b></TableCell>
                                <TableCell align="center"><b>Marcador</b></TableCell>
                                <TableCell align="left"><b>Visitante</b></TableCell>
                                <TableCell><b>Sede / Cancha</b></TableCell>
                                <TableCell align="center"><b>Estado</b></TableCell>
                                <TableCell align="center"><b>Acciones</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {matches.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No hay partidos programados en la base de datos.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                matches.map((m) => (
                                    <TableRow key={m.id} hover>
                                        <TableCell>
                                            {m.matchDate
                                                ? new Date(m.matchDate).toLocaleString('es-CO', {
                                                    dateStyle: 'short',
                                                    timeStyle: 'short',
                                                })
                                                : 'Por definir'}
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                            {getTeamName(m.homeTeamId, m.homeTeam)}
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            {m.homeScore ?? '-'} : {m.awayScore ?? '-'}
                                        </TableCell>
                                        <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                                            {getTeamName(m.awayTeamId, m.awayTeam)}
                                        </TableCell>
                                        <TableCell>
                                            {m.location ? `${m.location} ${m.fieldNumber ? `(Cancha ${m.fieldNumber})` : ''}` : '-'}
                                        </TableCell>
                                        <TableCell align="center">{renderStatusChip(m.status)}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Actualizar Marcador">
                                                <IconButton color="primary" onClick={() => handleOpenScore(m)}>
                                                    <SportsScoreIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Eliminar">
                                                <IconButton color="error" onClick={() => handleOpenDelete(m)}>
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

            <CreateMatchDialog
                open={openCreateModal}
                tournaments={tournaments}
                teams={teams}
                onClose={() => setOpenCreateModal(false)}
                onSuccess={fetchData}
            />

            <UpdateScoreDialog
                open={openScoreModal}
                match={selectedMatch}
                onClose={() => {
                    setOpenScoreModal(false);
                    setSelectedMatch(null);
                }}
                onSuccess={fetchData}
            />

            <ConfirmDeleteDialog
                open={openDeleteDialog}
                title="¿Eliminar Partido?"
                description="¿Estás seguro de que deseas eliminar la programación de este partido?"
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