import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Alert,
    MenuItem,
    Typography,
} from '@mui/material';
import type { Match, MatchStatus } from '../../../types';
import { updateMatch } from '../services/matches.service';

interface UpdateScoreDialogProps {
    open: boolean;
    match: Match | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const UpdateScoreDialog: React.FC<UpdateScoreDialogProps> = ({
    open,
    match,
    onClose,
    onSuccess,
}) => {
    const [homeScore, setHomeScore] = useState<string>('');
    const [awayScore, setAwayScore] = useState<string>('');
    const [status, setStatus] = useState<MatchStatus>('SCHEDULED');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (match) {
            setHomeScore(match.homeScore !== null && match.homeScore !== undefined ? String(match.homeScore) : '');
            setAwayScore(match.awayScore !== null && match.awayScore !== undefined ? String(match.awayScore) : '');
            setStatus(match.status || 'SCHEDULED');
        }
    }, [match]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!match) return;

        try {
            setLoading(true);
            setError(null);

            await updateMatch(match.id, {
                homeScore: homeScore !== '' ? Number(homeScore) : null,
                awayScore: awayScore !== '' ? Number(awayScore) : null,
                status,
            });

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Error al actualizar resultado:', err);
            const serverMsg = err?.response?.data?.message;
            setError(serverMsg || 'No se pudo actualizar el resultado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                Marcador del Partido
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {match && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, width: '100%' }}>
                                <Box sx={{ textAlign: 'center', flex: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                        {match.homeTeam?.name || `Equipo ${match.homeTeamId}`}
                                    </Typography>
                                    <TextField
                                        type="number"
                                        value={homeScore}
                                        onChange={(e) => setHomeScore(e.target.value)}
                                        slotProps={{
                                            htmlInput: {
                                                min: 0,
                                                style: { textAlign: 'center', fontSize: '1.2rem' },
                                            },
                                        }}
                                        sx={{ mt: 1, width: '80px' }}
                                    />
                                </Box>

                                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 2 }}>
                                    VS
                                </Typography>

                                <Box sx={{ textAlign: 'center', flex: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                        {match.awayTeam?.name || `Equipo ${match.awayTeamId}`}
                                    </Typography>
                                    <TextField
                                        type="number"
                                        value={awayScore}
                                        onChange={(e) => setAwayScore(e.target.value)}
                                        slotProps={{
                                            htmlInput: {
                                                min: 0,
                                                style: { textAlign: 'center', fontSize: '1.2rem' },
                                            },
                                        }}
                                        sx={{ mt: 1, width: '80px' }}
                                    />
                                </Box>

                                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 2 }}>
                                    VS
                                </Typography>

                                <Box sx={{ textAlign: 'center', flex: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                        {match.homeTeam?.name || `Equipo ${match.homeTeamId}`}
                                    </Typography>
                                    <TextField
                                        type="number"
                                        value={homeScore}
                                        onChange={(e) => setHomeScore(e.target.value)}
                                        slotProps={{
                                            htmlInput: {
                                                min: 0,
                                                style: { textAlign: 'center', fontSize: '1.2rem' },
                                            },
                                        }}
                                        sx={{ mt: 1, width: '80px' }}
                                    />
                                </Box>

                                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 2 }}>
                                    VS
                                </Typography>

                                <Box sx={{ textAlign: 'center', flex: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                        {match.awayTeam?.name || `Equipo ${match.awayTeamId}`}
                                    </Typography>
                                    <TextField
                                        type="number"
                                        value={awayScore}
                                        onChange={(e) => setAwayScore(e.target.value)}
                                        slotProps={{
                                            htmlInput: {
                                                min: 0,
                                                style: { textAlign: 'center', fontSize: '1.2rem' },
                                            },
                                        }}
                                        sx={{ mt: 1, width: '80px' }}
                                    />
                                </Box>
                            </Box>

                            <TextField
                                select
                                label="Estado del Partido"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as MatchStatus)}
                                fullWidth
                            >
                                <MenuItem value="SCHEDULED">Programado</MenuItem>
                                <MenuItem value="IN_PROGRESS">En Juego</MenuItem>
                                <MenuItem value="FINISHED">Finalizado</MenuItem>
                                <MenuItem value="POSTPONED">Aplazado</MenuItem>
                                <MenuItem value="CANCELLED">Cancelado</MenuItem>
                            </TextField>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} color="inherit" disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="contained" color="primary" disabled={loading}>
                        {loading ? 'Guardando...' : 'Actualizar Marcador'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};