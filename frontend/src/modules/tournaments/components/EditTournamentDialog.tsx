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
import type { Tournament, TournamentStatus } from '../../../types';
import { updateTournament } from '../services/tournaments.service';

interface EditTournamentDialogProps {
    open: boolean;
    tournament: Tournament | null;
    onClose: () => void;
    onSuccess: () => void;
}

/**
 * Diálogo modal para la actualización de datos de un torneo existente.
 * 
 * @param {EditTournamentDialogProps} props Propiedades del componente.
 * @returns {JSX.Element} Componente Modal.
 */
export const EditTournamentDialog: React.FC<EditTournamentDialogProps> = ({
    open,
    tournament,
    onClose,
    onSuccess,
}) => {
    const [formData, setFormData] = useState<{
        name: string;
        description: string;
        startDate: string;
        endDate: string;
        status: TournamentStatus;
    }>({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'DRAFT',
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (tournament) {
            setFormData({
                name: tournament.name || '',
                description: tournament.description || '',
                startDate: tournament.startDate ? tournament.startDate.split('T')[0] : '',
                endDate: tournament.endDate ? tournament.endDate.split('T')[0] : '',
                status: tournament.status || 'DRAFT',
            });
        }
    }, [tournament]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tournament) return;

        try {
            setLoading(true);
            setError(null);

            await updateTournament(tournament.id, {
                name: formData.name,
                description: formData.description || null,
                startDate: formData.startDate,
                endDate: formData.endDate || null,
                status: formData.status,
            });

            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error al actualizar torneo:', err);
            setError('No se pudieron guardar los cambios del torneo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Editar Torneo</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Nombre del Torneo"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            fullWidth
                        />

                        <TextField
                            label="Descripción"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            multiline
                            rows={3}
                            fullWidth
                        />

                        <TextField
                            select
                            label="Estado del Torneo"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            fullWidth
                        >
                            <MenuItem value="DRAFT">Borrador (DRAFT)</MenuItem>
                            <MenuItem value="IN_PROGRESS">En Progreso (IN_PROGRESS)</MenuItem>
                            <MenuItem value="FINISHED">Finalizado (FINISHED)</MenuItem>
                            <MenuItem value="CANCELLED">Cancelado (CANCELLED)</MenuItem>
                        </TextField>

                        <TextField
                            label="Fecha de Inicio"
                            name="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={handleChange}
                            slotProps={{ inputLabel: { shrink: true } }}
                            required
                            fullWidth
                        />

                        <TextField
                            label="Fecha de Finalización"
                            name="endDate"
                            type="date"
                            value={formData.endDate}
                            onChange={handleChange}
                            slotProps={{ inputLabel: { shrink: true } }}
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