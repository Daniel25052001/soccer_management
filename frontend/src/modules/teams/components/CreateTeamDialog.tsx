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
import type { Tournament } from '../../../types';
import { createTeam, type CreateTeamDto } from '../services/teams.service';

interface CreateTeamDialogProps {
    /** Controla si el diálogo está abierto */
    open: boolean;
    /** Lista de torneos disponibles para asociar el equipo */
    tournaments: Tournament[];
    /** Callback al cerrar el diálogo */
    onClose: () => void;
    /** Callback para notificar que se creó el equipo */
    onSuccess: () => void;
}

/**
 * Diálogo modal para el registro de nuevos equipos participantes.
 * 
 * @param {CreateTeamDialogProps} props Propiedades del componente.
 * @returns {JSX.Element} Componente Modal.
 */
export const CreateTeamDialog: React.FC<CreateTeamDialogProps> = ({
    open,
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            setError('El nombre del equipo es obligatorio.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const payload: CreateTeamDto = {
                name: formData.name,
                delegateName: formData.delegateName || null,
                delegatePhone: formData.delegatePhone || null,
                tournamentId: formData.tournamentId ? Number(formData.tournamentId) : null,
            };

            await createTeam(payload);
            onSuccess();
            handleClose();
        } catch (err) {
            console.error('Error al registrar equipo:', err);
            setError('No se pudo guardar el equipo. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            delegateName: '',
            delegatePhone: '',
            tournamentId: '',
        });
        setError(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Registrar Nuevo Equipo</DialogTitle>
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
                    <Button onClick={handleClose} color="inherit" disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="contained" color="primary" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Equipo'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};