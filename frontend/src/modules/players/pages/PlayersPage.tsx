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
    TablePagination,
    TextField,
    Paper,
    Box,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip,
    Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupAddIcon from '@mui/icons-material/GroupAdd'; // <-- Icono para carga masiva
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import VisibilityIcon from '@mui/icons-material/Visibility';
import type { Player, Team } from '../../../types';
import { deletePlayer, getPlayers } from '../services/players.service';
import { getTeams } from '../../teams/services/teams.service';
import { CreatePlayerDialog } from '../components/CreatePlayerDialog';
import { EditPlayerDialog } from '../components/EditPlayerDialog';
import { ConfirmDeleteDialog } from '../../../components/ConfirmDeleteDialog';
import { CreateBulkPlayersDialog } from '../components/CreateBulkPlayersDialog'; // <-- Importamos el componente masivo

export const PlayersPage: React.FC = () => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Modales
    const [openCreateModal, setOpenCreateModal] = useState<boolean>(false);
    const [openBulkModal, setOpenBulkModal] = useState<boolean>(false); // <-- Estado para el modal masivo
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [openEditModal, setOpenEditModal] = useState<boolean>(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);

    // Estados para Filtros y Paginación
    const [searchName, setSearchName] = useState<string>('');
    const [searchTeam, setSearchTeam] = useState<string>('');
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);

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

    // Funciones auxiliares para contar estadísticas a partir de los eventos del jugador
    const getPlayerGoals = (player: Player): number => {
        if (!player.events) return 0;
        return player.events.filter((e) => e.type === 'GOAL').length;
    };

    const getPlayerYellowCards = (player: Player): number => {
        if (!player.events) return 0;
        return player.events.filter((e) => e.type === 'YELLOW_CARD').length;
    };

    const getPlayerRedCards = (player: Player): number => {
        if (!player.events) return 0;
        return player.events.filter((e) => e.type === 'RED_CARD' || e.type === 'DOUBLE_YELLOW_RED').length;
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
            case 'FULLBACK': return 'Lateral';
            case 'MIDFIELDER': return 'Centrocampista';
            case 'FORWARD': return 'Delantero';
            default: return '-';
        }
    };

    // Lógica de Filtrado por Nombre del Jugador y por Equipo
    const filteredPlayers = players.filter((player) => {
        const fullName = `${player.firstName} ${player.lastName}`.toLowerCase();
        const matchesName = fullName.includes(searchName.toLowerCase());

        const teamName = getTeamName(player).toLowerCase();
        const matchesTeam = teamName.includes(searchTeam.toLowerCase());

        return matchesName && matchesTeam;
    });

    // Lógica de Paginación aplicada sobre los resultados filtrados
    const paginatedPlayers = filteredPlayers.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reinicia a la primera página al cambiar el número de filas
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Gestión de Jugadores
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    {/* Botón de Carga Masiva */}
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<GroupAddIcon />}
                        onClick={() => setOpenBulkModal(true)}
                    >
                        Carga Masiva
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenCreateModal(true)}
                    >
                        Nuevo Jugador
                    </Button>
                </Box>
            </Box>

            {/* Barra de Filtros por Nombre y Equipo */}
            <Paper elevation={2} sx={{ p: 2, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                    label="Filtrar por nombre de jugador"
                    variant="outlined"
                    size="small"
                    value={searchName}
                    onChange={(e) => {
                        setSearchName(e.target.value);
                        setPage(0);
                    }}
                    sx={{ flexGrow: 1, minWidth: '220px' }}
                />
                <TextField
                    label="Filtrar por equipo"
                    variant="outlined"
                    size="small"
                    value={searchTeam}
                    onChange={(e) => {
                        setSearchTeam(e.target.value);
                        setPage(0);
                    }}
                    sx={{ flexGrow: 1, minWidth: '220px' }}
                />
            </Paper>

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
                <Paper elevation={3}>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell><b>Dorsal</b></TableCell>
                                    <TableCell><b>Nombre Completo</b></TableCell>
                                    <TableCell><b>Equipo</b></TableCell>
                                    <TableCell><b>Posición</b></TableCell>
                                    <TableCell align="center"><b>Goles</b></TableCell>
                                    <TableCell align="center"><b>Amarillas</b></TableCell>
                                    <TableCell align="center"><b>Rojas</b></TableCell>
                                    <TableCell align="center"><b>Acciones</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedPlayers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            No se encontraron jugadores registrados con los filtros aplicados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedPlayers.map((p) => {
                                        const goals = getPlayerGoals(p);
                                        const yellows = getPlayerYellowCards(p);
                                        const reds = getPlayerRedCards(p);

                                        return (
                                            <TableRow key={p.id} hover>
                                                <TableCell>
                                                    {p.defaultDorsal ? <Chip label={`#${p.defaultDorsal}`} size="small" /> : '-'}
                                                </TableCell>
                                                <TableCell>{`${p.firstName} ${p.lastName}`}</TableCell>
                                                <TableCell>{getTeamName(p)}</TableCell>
                                                <TableCell>{getPositionLabel(p.position)}</TableCell>

                                                {/* Columnas de Estadísticas */}
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                                        <SportsSoccerIcon fontSize="small" color="primary" />
                                                        <b>{goals}</b>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={yellows}
                                                        size="small"
                                                        sx={{ backgroundColor: '#ffeb3b', fontWeight: 'bold' }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={reds}
                                                        size="small"
                                                        color="error"
                                                        sx={{ fontWeight: 'bold' }}
                                                    />
                                                </TableCell>

                                                <TableCell align="center">
                                                    <Tooltip title="Ver Eventos / Historial">
                                                        <IconButton
                                                            color="info"
                                                            onClick={() => {
                                                                console.log("Eventos de:", p.firstName, p.events);
                                                            }}
                                                        >
                                                            <VisibilityIcon />
                                                        </IconButton>
                                                    </Tooltip>
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
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Componente de Paginación */}
                    <TablePagination
                        component="div"
                        count={filteredPlayers.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25]}
                        labelRowsPerPage="Filas por página:"
                        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`}
                    />
                </Paper>
            )}

            <CreatePlayerDialog
                open={openCreateModal}
                teams={teams}
                onClose={() => setOpenCreateModal(false)}
                onSuccess={fetchData}
            />

            {/* Diálogo para Carga Masiva (requiere seleccionar un equipo dentro del diálogo o pasarle uno por defecto) */}
            {teams.length > 0 && (
                <CreateBulkPlayersDialog
                    open={openBulkModal}
                    teams={teams} // Asegúrate de que tu CreateBulkPlayersDialog acepte la lista de equipos para elegir a cuál cargar
                    onClose={() => setOpenBulkModal(false)}
                    onSuccess={fetchData}
                />
            )}

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