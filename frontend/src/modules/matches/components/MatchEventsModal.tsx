import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    TextField,
    MenuItem,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    Alert,
    Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getMatchEvents, createMatchEvent, deleteMatchEvent, type MatchEvent } from '../services/match-events.service';
import { apiClient } from '../../../api/apiClient';
import type { Match } from '../../../types';

/**
 * Interfaz que representa un jugador perteneciente a un equipo.
 */
interface Player {
    id: number;
    firstName: string;
    lastName: string;
    defaultDorsal?: number;
}

/**
 * Propiedades que recibe el componente MatchEventsModal.
 */
interface MatchEventsModalProps {
    open: boolean;
    match: Match | null;
    onClose: () => void;
    onScoreUpdated: () => void;
}

/**
 * Componente modal para gestionar la planilla de juego (goles, tarjetas y cronología) en tiempo real.
 */
export const MatchEventsModal: React.FC<MatchEventsModalProps> = ({
    open,
    match,
    onClose,
    onScoreUpdated,
}) => {
    const [events, setEvents] = useState<MatchEvent[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Estados del formulario para registrar una nueva incidencia
    const [selectedTeamId, setSelectedTeamId] = useState<number | ''>('');
    const [selectedPlayerId, setSelectedPlayerId] = useState<number | ''>('');
    const [eventType, setEventType] = useState<string>('GOAL');
    const [minute, setMinute] = useState<number | ''>('');

    /**
     * Obtiene la cronología de eventos registrados para el partido actual.
     */
    const fetchEvents = useCallback(async () => {
        if (!match) return;
        try {
            setLoading(true);
            const data = await getMatchEvents(match.id);
            setEvents(data);
        } catch (err) {
            console.error('Error al cargar eventos:', err);
            setError('No se pudo cargar la cronología del partido.');
        } finally {
            setLoading(false);
        }
    }, [match]);

    /**
     * Carga exclusivamente los jugadores del equipo seleccionado haciendo uso de la relación del backend (/teams/{id}).
     */
    useEffect(() => {
        const fetchPlayersByTeam = async () => {
            if (!selectedTeamId) {
                setPlayers([]);
                return;
            }
            try {
                // Consulta directa al endpoint del equipo por ID, el cual incluye la propiedad 'players' gracias a Prisma
                const response = await apiClient.get<{ players?: Player[] }>(`/teams/${selectedTeamId}`);
                setPlayers(response.data.players || []);
            } catch (err) {
                console.error('Error al cargar jugadores del equipo:', err);
                setPlayers([]);
            }
        };
        fetchPlayersByTeam();
    }, [selectedTeamId]);

    /**
     * Reinicia los estados del formulario cada vez que se abre el modal para un partido.
     */
    useEffect(() => {
        if (open && match) {
            fetchEvents();
            setSelectedTeamId('');
            setSelectedPlayerId('');
            setMinute('');
        }
    }, [open, match, fetchEvents]);

    /**
     * Registra una nueva incidencia en el partido (gol, tarjeta, etc.).
     */
    const handleAddEvent = async () => {
        if (!match || !selectedTeamId || !selectedPlayerId || minute === '') {
            setError('Por favor completa todos los campos del evento.');
            return;
        }

        try {
            setError(null);
            await createMatchEvent({
                matchId: match.id,
                teamId: Number(selectedTeamId),
                playerId: Number(selectedPlayerId),
                eventType,
                minute: Number(minute),
            });

            // Limpiar campos de jugador y minuto, y refrescar datos
            setSelectedPlayerId('');
            setMinute('');
            fetchEvents();
            onScoreUpdated();
        } catch (err: any) {
            console.error('Error al registrar evento:', err);
            setError(err.response?.data?.message || 'Error al registrar el evento.');
        }
    };

    /**
     * Elimina un evento registrado previamente de la cronología.
     */
    const handleDeleteEvent = async (eventId: number) => {
        try {
            await deleteMatchEvent(eventId);
            fetchEvents();
            onScoreUpdated();
        } catch (err) {
            console.error('Error al eliminar evento:', err);
            setError('No se pudo eliminar el evento.');
        }
    };

    if (!match) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                Acta del Partido: {match.homeTeam?.name || 'Local'} vs {match.awayTeam?.name || 'Visitante'}
            </DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {/* Marcador actual del encuentro */}
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mr: 2 }}>{match.homeTeam?.name}</Typography>
                    <Chip label={`${match.homeScore} - ${match.awayScore}`} color="primary" sx={{ fontSize: '1.2rem', px: 2, py: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold', ml: 2 }}>{match.awayTeam?.name}</Typography>
                </Box>

                {/* Contenedor principal de dos columnas */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>

                    {/* Columna Izquierda: Formulario de registro de incidencias */}
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Registrar Incidencia</Typography>

                        <TextField
                            select
                            label="Equipo"
                            fullWidth
                            size="small"
                            value={selectedTeamId}
                            onChange={(e) => {
                                setSelectedTeamId(Number(e.target.value));
                                setSelectedPlayerId(''); // Reiniciar selección de jugador al cambiar de equipo
                            }}
                            sx={{ mb: 2 }}
                        >
                            <MenuItem value={match.homeTeamId}>{match.homeTeam?.name}</MenuItem>
                            <MenuItem value={match.awayTeamId}>{match.awayTeam?.name}</MenuItem>
                        </TextField>

                        <TextField
                            select
                            label="Jugador (Dorsal - Nombre)"
                            fullWidth
                            size="small"
                            value={selectedPlayerId}
                            onChange={(e) => setSelectedPlayerId(Number(e.target.value))}
                            disabled={!selectedTeamId}
                            sx={{ mb: 2 }}
                        >
                            {players.map((player) => (
                                <MenuItem key={player.id} value={player.id}>
                                    {player.defaultDorsal ? `#${player.defaultDorsal} - ` : ''}{player.firstName} {player.lastName}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Tipo de Evento"
                            fullWidth
                            size="small"
                            value={eventType}
                            onChange={(e) => setEventType(e.target.value)}
                            sx={{ mb: 2 }}
                        >
                            <MenuItem value="GOAL">Gol</MenuItem>
                            <MenuItem value="OWN_GOAL">Autogol</MenuItem>
                            <MenuItem value="YELLOW_CARD">Tarjeta Amarilla</MenuItem>
                            <MenuItem value="RED_CARD">Tarjeta Roja</MenuItem>
                        </TextField>

                        <TextField
                            label="Minuto"
                            fullWidth
                            size="small"
                            type="number"
                            value={minute}
                            onChange={(e) => setMinute(Number(e.target.value))}
                            sx={{ mb: 2 }}
                        />

                        <Button variant="contained" color="primary" fullWidth onClick={handleAddEvent}>
                            Registrar Evento
                        </Button>
                    </Box>

                    {/* Columna Derecha: Cronología de eventos del partido */}
                    <Box sx={{ flex: 1.2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Cronología del Partido</Typography>
                        {events.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">No hay eventos registrados en este partido.</Typography>
                        ) : (
                            <List dense sx={{ maxHeight: 320, overflow: 'auto', bgcolor: '#fafafa', borderRadius: 2, p: 1 }}>
                                {events.map((ev) => (
                                    <React.Fragment key={ev.id}>
                                        <ListItem>
                                            <ListItemText
                                                primary={`Minuto ${ev.minute || '0'}' - ${ev.player?.firstName} ${ev.player?.lastName} (${ev.team?.name})`}
                                                secondary={`Evento: ${ev.type}`}
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton edge="end" color="error" size="small" onClick={() => handleDeleteEvent(ev.id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                        <Divider />
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </Box>

                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained" color="inherit">Cerrar</Button>
            </DialogActions>
        </Dialog>
    );
};