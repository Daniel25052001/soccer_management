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
} from '@mui/material';
import type { Team, Tournament } from '../../../types';
import { updateTeam } from '../services/teams.service';

interface EditTeamDialogProps {
    open: boolean;
    team: Team | null;
    tournaments: Tournament[];
    onClose: () => void;
    onSuccess: () => void;
}

/**
 * Diálogo modal para la actualización de la información de un equipo.
 * 
 * @param {EditTeamDialogProps} props Propiedades del componente.
 * @returns {JSX.Element} Componente Modal.
 */
export const EditTeamDialog: React.FC<EditTeamDialogProps> = ({
    open,
    team,
    tournaments,
    onClose,
    onSuccess,
}) => {
    const [formData, setFormData] = useState<{
        name: string;
        delegateName: string;
        delegatePhone: string;
        tournamentId: number | '';
    }>({
        name: '',
        delegateName: '',
        delegatePhone: '',
        tournamentId: '',
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (team) {
            setFormData({
                name: team.name || '',
                delegateName: team.delegateName || '',
                delegatePhone: team.delegatePhone || '',
                tournamentId: team.tournamentId ?? '',
            });
        }
    }, [team]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!team) return;

        if (!formData.name) {
            setError('El nombre del equipo es obligatorio.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            await updateTeam(team.id, {
                name: formData.name,
                delegateName: formData.delegateName || null,
                delegatePhone: formData.delegatePhone || null,
                tournamentId: formData.tournamentId ? Number(formData.tournamentId) : null,
            });

            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error al actualizar equipo:', err);
            setError('Ocurrió un error al intentar actualizar el equipo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Editar Equipo</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Nombre del Equipo"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            fullWidth
                        />

                        <TextField
                            select
                            label="Torneo Asignado (Opcional)"
                            name="tournamentId"
                            value={formData.tournamentId}
                            onChange={handleChange}
                            fullWidth
                        >
                            <MenuItem value="">
                                <em>Sin torneo asignado</em>
                            </MenuItem>
                            {tournaments.map((t) => (
                                <MenuItem key={t.id} value={t.id}>
                                    {t.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Nombre del Delegado"
                            name="delegateName"
                            value={formData.delegateName}
                            onChange={handleChange}
                            fullWidth
                        />

                        <TextField
                            label="Teléfono del Delegado"
                            name="delegatePhone"
                            value={formData.delegatePhone}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} color="inherit" disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="contained" color="primary" disabled={loading}>
                        {loading ? 'Guardando...' : 'Actualizar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};