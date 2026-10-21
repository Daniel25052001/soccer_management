import React, { useState } from 'react';
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
} from '@mui/material';
import type { CreateMatchDto, Team, Tournament } from '../../../types';
import { createMatch } from '../services/matches.service';

interface CreateMatchDialogProps {
    open: boolean;
    tournaments: Tournament[];
    teams: Team[];
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateMatchDialog: React.FC<CreateMatchDialogProps> = ({
    open,
    tournaments,
    teams,
    onClose,
    onSuccess,
}) => {
    const [formData, setFormData] = useState<{
        tournamentId: number | '';
        homeTeamId: number | '';
        awayTeamId: number | '';
        matchDate: string;
        location: string;
        fieldNumber: string;
    }>({
        tournamentId: '',
        homeTeamId: '',
        awayTeamId: '',
        matchDate: '',
        location: '',
        fieldNumber: '',
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Filtrar equipos pertenecientes al torneo seleccionado
    const filteredTeams = formData.tournamentId
        ? teams.filter((t) => t.tournamentId === Number(formData.tournamentId))
        : teams;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.tournamentId || !formData.homeTeamId || !formData.awayTeamId) {
            setError('Torneo, equipo local y equipo visitante son obligatorios.');
            return;
        }

        if (formData.homeTeamId === formData.awayTeamId) {
            setError('El equipo local y el equipo visitante no pueden ser el mismo.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const payload: CreateMatchDto = {
                tournamentId: Number(formData.tournamentId),
                homeTeamId: Number(formData.homeTeamId),
                awayTeamId: Number(formData.awayTeamId),
                matchDate: formData.matchDate ? new Date(formData.matchDate).toISOString() : null,
                location: formData.location || null,
                fieldNumber: formData.fieldNumber || null,
                status: 'SCHEDULED',
            };

            await createMatch(payload);
            onSuccess();
            handleClose();
        } catch (err: any) {
            console.error('Error al programar partido:', err);
            const serverMsg = err?.response?.data?.message;
            setError(serverMsg || 'No se pudo programar el encuentro.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            tournamentId: '',
            homeTeamId: '',
            awayTeamId: '',
            matchDate: '',
            location: '',
            fieldNumber: '',
        });
        setError(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Programar Partido</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            select
                            label="Torneo"
                            name="tournamentId"
                            value={formData.tournamentId}
                            onChange={handleChange}
                            required
                            fullWidth
                        >
                            {tournaments.map((t) => (
                                <MenuItem key={t.id} value={t.id}>
                                    {t.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                select
                                label="Equipo Local"
                                name="homeTeamId"
                                value={formData.homeTeamId}
                                onChange={handleChange}
                                required
                                fullWidth
                            >
                                {filteredTeams.map((t) => (
                                    <MenuItem key={t.id} value={t.id}>
                                        {t.name}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                label="Equipo Visitante"
                                name="awayTeamId"
                                value={formData.awayTeamId}
                                onChange={handleChange}
                                required
                                fullWidth
                            >
                                {filteredTeams.map((t) => (
                                    <MenuItem key={t.id} value={t.id}>
                                        {t.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <TextField
                            label="Fecha y Hora de Encuentro"
                            type="datetime-local"
                            name="matchDate"
                            value={formData.matchDate}
                            onChange={handleChange}
                            slotProps={{ inputLabel: { shrink: true } }}
                            fullWidth
                        />

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Cancha / Sede"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                fullWidth
                            />
                            <TextField
                                label="N° Cancha"
                                name="fieldNumber"
                                value={formData.fieldNumber}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleClose} color="inherit" disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="contained" color="primary" disabled={loading}>
                        {loading ? 'Guardando...' : 'Programar Partido'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};