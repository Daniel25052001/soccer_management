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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Player, Team } from '../../../types';
import { deletePlayer, getPlayers } from '../services/players.service';
import { getTeams } from '../../teams/services/teams.service';
import { CreatePlayerDialog } from '../components/CreatePlayerDialog';
import { EditPlayerDialog } from '../components/EditPlayerDialog';
import { ConfirmDeleteDialog } from '../../../components/ConfirmDeleteDialog';

export const PlayersPage: React.FC = () => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Modales
    const [openCreateModal, setOpenCreateModal] = useState<boolean>(false);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [openEditModal, setOpenEditModal] = useState<boolean>(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setErrorMessage(null);
            const [playersData, teamsData] = await Promise.all([getPlayers(), getTeams()]);
            setPlayers(playersData);
            setTeams(teamsData);
        } catch (error) {
            console.error('Error al cargar jugadores:', error);
            setErrorMessage('No se pudo establecer conexión con el servidor de GolAdmin.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getTeamName = (player: Player): string => {
        if (player.team) return player.team.name;
        const found = teams.find((t) => t.id === player.teamId);
        return found ? found.name : `Equipo #${player.teamId}`;
    };

    const handleOpenEdit = (player: Player) => {
        setSelectedPlayer(player);
        setOpenEditModal(true);
    };

    const handleOpenDelete = (player: Player) => {
        setSelectedPlayer(player);
        setOpenDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!selectedPlayer) return;
        try {
            setDeleting(true);
            await deletePlayer(selectedPlayer.id);
            setOpenDeleteDialog(false);
            setSelectedPlayer(null);
            fetchData();
        } catch (error) {
            console.error('Error al eliminar jugador:', error);
            setErrorMessage('No se pudo eliminar el jugador seleccionado.');
        } finally {
            setDeleting(false);
        }
    };

    const getPositionLabel = (pos?: string | null) => {
        switch (pos) {
            case 'GOALKEEPER': return 'Portero';
            case 'DEFENDER': return 'Defensa';
            case 'MIDFIELDER': return 'Centrocampista';
            case 'FORWARD': return 'Delantero';
            default: return '-';
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Gestión de Jugadores
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenCreateModal(true)}
                >
                    Nuevo Jugador
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
                                <TableCell><b>Dorsal</b></TableCell>
                                <TableCell><b>Nombre Completo</b></TableCell>
                                <TableCell><b>Documento</b></TableCell>
                                <TableCell><b>Equipo</b></TableCell>
                                <TableCell><b>Posición</b></TableCell>
                                <TableCell align="center"><b>Acciones</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {players.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        No hay jugadores registrados en la base de datos.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                players.map((p) => (
                                    <TableRow key={p.id} hover>
                                        <TableCell>
                                            {p.defaultDorsal ? <Chip label={`#${p.defaultDorsal}`} size="small" /> : '-'}
                                        </TableCell>
                                        <TableCell>{`${p.firstName} ${p.lastName}`}</TableCell>
                                        <TableCell>{p.documentId || '-'}</TableCell>
                                        <TableCell>{getTeamName(p)}</TableCell>
                                        <TableCell>{getPositionLabel(p.position)}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Editar">
                                                <IconButton color="primary" onClick={() => handleOpenEdit(p)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Eliminar">
                                                <IconButton color="error" onClick={() => handleOpenDelete(p)}>
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

            <CreatePlayerDialog
                open={openCreateModal}
                teams={teams}
                onClose={() => setOpenCreateModal(false)}
                onSuccess={fetchData}
            />

            <EditPlayerDialog
                open={openEditModal}
                player={selectedPlayer}
                teams={teams}
                onClose={() => {
                    setOpenEditModal(false);
                    setSelectedPlayer(null);
                }}
                onSuccess={fetchData}
            />

            <ConfirmDeleteDialog
                open={openDeleteDialog}
                title="¿Eliminar Jugador?"
                description={`¿Estás seguro de que deseas eliminar a "${selectedPlayer ? `${selectedPlayer.firstName} ${selectedPlayer.lastName}` : 'este jugador'}"?`}
                loading={deleting}
                onClose={() => {
                    setOpenDeleteDialog(false);
                    setSelectedPlayer(null);
                }}
                onConfirm={confirmDelete}
            />
        </Box>
    );
};
