import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import { fetchMatchSheet, saveMatchSheet } from './matchSheet.api';
import type {
    MatchSheetHeaderData,
    PlayerSheetRowData,
    RefereeOption,
} from './matchSheet.types';
import { PlayerSheetRow, type StatField } from './PlayerSheetRow';

interface MatchSheetViewProps {
    matchId: number;
    referees?: RefereeOption[];
    onSaved?: () => void;
}

export const MatchSheetView: React.FC<MatchSheetViewProps> = ({
    matchId,
    referees = [],
    onSaved,
}) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [header, setHeader] = useState<MatchSheetHeaderData | null>(null);
    const [homeTeamName, setHomeTeamName] = useState<string>('Local');
    const [awayTeamName, setAwayTeamName] = useState<string>('Visitante');

    const [venue, setVenue] = useState<string>('');
    const [phase, setPhase] = useState<string>('');
    const [sheetNumber, setSheetNumber] = useState<string>('');
    const [refereeId, setRefereeId] = useState<number | ''>('');
    const [status, setStatus] = useState<string>('SCHEDULED');

    const [homePlayers, setHomePlayers] = useState<PlayerSheetRowData[]>([]);
    const [awayPlayers, setAwayPlayers] = useState<PlayerSheetRowData[]>([]);

    const loadSheet = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSuccessMsg(null);
        try {
            const data = await fetchMatchSheet(matchId);
            setHeader(data.match);
            setHomeTeamName(data.homeTeam.name);
            setAwayTeamName(data.awayTeam.name);
            setVenue(data.match.venue || '');
            setPhase(data.match.phase || '');
            setSheetNumber(data.match.sheetNumber || '');
            setRefereeId(data.match.refereeId ?? '');
            setStatus(data.match.status || 'SCHEDULED');
            setHomePlayers(data.homeTeam.players);
            setAwayPlayers(data.awayTeam.players);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : 'No se pudo cargar la planilla del partido.';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [matchId]);

    useEffect(() => {
        loadSheet();
    }, [loadSheet]);

    const homeStats = useMemo(() => {
        return homePlayers.reduce(
            (acc, p) => {
                acc.goals += p.goals;
                acc.yellows += p.yellowCards;
                acc.reds += p.redCards;
                if (p.played) acc.playedCount += 1;
                return acc;
            },
            { goals: 0, yellows: 0, reds: 0, playedCount: 0 },
        );
    }, [homePlayers]);

    const awayStats = useMemo(() => {
        return awayPlayers.reduce(
            (acc, p) => {
                acc.goals += p.goals;
                acc.yellows += p.yellowCards;
                acc.reds += p.redCards;
                if (p.played) acc.playedCount += 1;
                return acc;
            },
            { goals: 0, yellows: 0, reds: 0, playedCount: 0 },
        );
    }, [awayPlayers]);

    const updateTeamList = useCallback(
        (side: 'home' | 'away', updater: (prev: PlayerSheetRowData[]) => PlayerSheetRowData[]) => {
            if (side === 'home') {
                setHomePlayers(updater);
            } else {
                setAwayPlayers(updater);
            }
        },
        [],
    );

    const handleTogglePlayed = useCallback(
        (side: 'home' | 'away', playerId: number, checked: boolean) => {
            updateTeamList(side, (prev) =>
                prev.map((p) => (p.playerId === playerId ? { ...p, played: checked } : p)),
            );
        },
        [updateTeamList],
    );

    const handleChangeJersey = useCallback(
        (side: 'home' | 'away', playerId: number, jerseyNumber: number) => {
            updateTeamList(side, (prev) =>
                prev.map((p) => (p.playerId === playerId ? { ...p, jerseyNumber } : p)),
            );
        },
        [updateTeamList],
    );

    const handleStepStat = useCallback(
        (side: 'home' | 'away', playerId: number, field: StatField, delta: number) => {
            updateTeamList(side, (prev) =>
                prev.map((p) => {
                    if (p.playerId !== playerId) return p;
                    const nextVal = Math.max(0, p[field] + delta);
                    const nextPlayed = delta > 0 && nextVal > 0 ? true : p.played;
                    return {
                        ...p,
                        [field]: nextVal,
                        played: nextPlayed,
                    };
                }),
            );
        },
        [updateTeamList],
    );

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccessMsg(null);
        try {
            const updated = await saveMatchSheet(matchId, {
                venue,
                phase,
                sheetNumber,
                refereeId: refereeId === '' ? null : Number(refereeId),
                status,
                players: [...homePlayers, ...awayPlayers].map((p) => ({
                    playerId: p.playerId,
                    teamId: p.teamId,
                    jerseyNumber: p.jerseyNumber,
                    played: p.played,
                    isStarter: p.isStarter,
                    goals: p.goals,
                    yellowCards: p.yellowCards,
                    redCards: p.redCards,
                })),
            });

            setHeader(updated.match);
            setHomePlayers(updated.homeTeam.players);
            setAwayPlayers(updated.awayTeam.players);
            setSuccessMsg('Planilla guardada correctamente. Participación y eventos sincronizados.');
            onSaved?.();
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : 'Ocurrió un error al guardar la planilla.';
            setError(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    const renderTeamCard = (
        side: 'home' | 'away',
        teamName: string,
        players: PlayerSheetRowData[],
        stats: { goals: number; yellows: number; reds: number; playedCount: number },
    ) => (
        <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1.5,
                    gap: 1,
                    flexWrap: 'wrap',
                }}
            >
                <Box>
                    <Typography component="div" variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {teamName} ({side === 'home' ? 'Local' : 'Visitante'})
                    </Typography>
                    <Typography component="div" variant="caption" color="text.secondary">
                        Jugaron: {stats.playedCount} de {players.length} inscritos
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Typography component="span" variant="body2" sx={{ fontWeight: 700 }}>
                        Goles: {stats.goals}
                    </Typography>
                    <Typography
                        component="span"
                        variant="body2"
                        color="warning.main"
                        sx={{ fontWeight: 600 }}
                    >
                        Amarillas: {stats.yellows}
                    </Typography>
                    <Typography
                        component="span"
                        variant="body2"
                        color="error.main"
                        sx={{ fontWeight: 600 }}
                    >
                        Rojas: {stats.reds}
                    </Typography>
                </Box>
            </Box>

            <TableContainer sx={{ maxHeight: 460 }}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox" align="center">
                                Jugó
                            </TableCell>
                            <TableCell align="center" sx={{ width: 68 }}>
                                #
                            </TableCell>
                            <TableCell>Jugador</TableCell>
                            <TableCell align="center">Gol</TableCell>
                            <TableCell align="center">Ama</TableCell>
                            <TableCell align="center">Roj</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {players.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    <Typography component="div" variant="body2" color="text.secondary">
                                        No hay jugadores registrados en este equipo.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            players.map((player) => (
                                <PlayerSheetRow
                                    key={player.playerId}
                                    side={side}
                                    player={player}
                                    onTogglePlayed={handleTogglePlayed}
                                    onChangeJersey={handleChangeJersey}
                                    onStepStat={handleStepStat}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );

    return (
        <Stack component="div" spacing={2.5}>
            <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', md: 'center' },
                        gap: 2,
                    }}
                >
                    <Box>
                        <Typography component="div" variant="caption" color="text.secondary">
                            {header?.tournamentName ? `Torneo: ${header.tournamentName}` : 'Planilla de Juego'}
                        </Typography>
                        <Typography component="h2" variant="h6" sx={{ fontWeight: 700 }}>
                            {homeTeamName} {homeStats.goals} — {awayStats.goals} {awayTeamName}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={loadSheet}
                            disabled={loading || saving}
                        >
                            Recargar
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? 'Guardando...' : 'Guardar Planilla'}
                        </Button>
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                            label="Cancha / Escenario"
                            size="small"
                            fullWidth
                            value={venue}
                            onChange={(e) => setVenue(e.target.value)}
                            placeholder="Ej. Cancha Marte #1"
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                        <TextField
                            label="Fase / Jornada"
                            size="small"
                            fullWidth
                            value={phase}
                            onChange={(e) => setPhase(e.target.value)}
                            placeholder="Ej. Fecha 3 / Cuartos"
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <TextField
                            label="N° Planilla"
                            size="small"
                            fullWidth
                            value={sheetNumber}
                            onChange={(e) => setSheetNumber(e.target.value)}
                            placeholder="Ej. 0045"
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                        <FormControl size="small" fullWidth>
                            <InputLabel id="referee-select-label">Árbitro</InputLabel>
                            <Select
                                labelId="referee-select-label"
                                label="Árbitro"
                                value={refereeId}
                                onChange={(e) => {
                                    const raw = String(e.target.value);
                                    setRefereeId(raw === '' ? '' : Number(raw));
                                }}
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
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <FormControl size="small" fullWidth>
                            <InputLabel id="status-select-label">Estado</InputLabel>
                            <Select
                                labelId="status-select-label"
                                label="Estado"
                                value={status}
                                onChange={(e) => setStatus(String(e.target.value))}
                            >
                                <MenuItem value="SCHEDULED">Programado</MenuItem>
                                <MenuItem value="IN_PROGRESS">En curso</MenuItem>
                                <MenuItem value="FINISHED">Finalizado</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {error && <Alert severity="error">{error}</Alert>}
            {successMsg && <Alert severity="success">{successMsg}</Alert>}

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, lg: 6 }}>
                    {renderTeamCard('home', homeTeamName, homePlayers, homeStats)}
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                    {renderTeamCard('away', awayTeamName, awayPlayers, awayStats)}
                </Grid>
            </Grid>
        </Stack>
    );
};