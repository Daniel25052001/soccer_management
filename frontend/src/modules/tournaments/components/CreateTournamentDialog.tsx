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
} from '@mui/material';
import type { CreateTournamentDto } from '../../../types';
import { createTournament } from '../services/tournaments.service';

interface CreateTournamentDialogProps {
    /** Controla la visibilidad del diálogo modal */
    open: boolean;
    /** Callback para cerrar el diálogo modal */
    onClose: () => void;
    /** Callback para notificar que se creó un torneo y refrescar la tabla */
    onSuccess: () => void;
}

/**
 * Diálogo modal para el registro de nuevos torneos en GolAdmin PWA.
 * 
 * @param {CreateTournamentDialogProps} props Propiedades del componente.
 * @returns {JSX.Element} Componente Modal con formulario estructurado.
 */
export const CreateTournamentDialog: React.FC<CreateTournamentDialogProps> = ({
    open,
    onClose,
    onSuccess,
}) => {
    const [formData, setFormData] = useState<CreateTournamentDto>({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'DRAFT',
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Actualiza el estado local del formulario según el campo modificado.
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    /**
     * Envía los datos del formulario a la API REST de NestJS.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.startDate) {
            setError('El nombre y la fecha de inicio son campos obligatorios.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Limpiar fechas vacías a null para la API
            const payload: CreateTournamentDto = {
                ...formData,
                description: formData.description || null,
                endDate: formData.endDate || null,
            };

            await createTournament(payload);
            onSuccess();
            handleClose();
        } catch (err) {
            console.error('Error al crear torneo:', err);
            setError('Ocurrió un error al intentar guardar el torneo.');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Reinicia el estado del formulario y cierra la ventana modal.
     */
    const handleClose = () => {
        setFormData({
            name: '',
            description: '',
            startDate: '',
            endDate: '',
            status: 'DRAFT',
        });
        setError(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Registrar Nuevo Torneo</DialogTitle>
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
                            value={formData.description || ''}
                            onChange={handleChange}
                            multiline
                            rows={3}
                            fullWidth
                        />

                        <TextField
                            label="Fecha de Inicio"
                            name="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={handleChange}
                            slotProps={{
                                inputLabel: { shrink: true },
                            }}
                            required
                            fullWidth
                        />

                        <TextField
                            label="Fecha de Finalización (Opcional)"
                            name="endDate"
                            type="date"
                            value={formData.endDate || ''}
                            onChange={handleChange}
                            slotProps={{
                                inputLabel: { shrink: true },
                            }}
                            fullWidth
                        />
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleClose} color="inherit" disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="contained" color="primary" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Torneo'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};