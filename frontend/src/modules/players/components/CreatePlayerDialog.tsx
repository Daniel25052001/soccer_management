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
import type { CreatePlayerDto, PlayerPosition, Team } from '../../../types';
import { createPlayer } from '../services/players.service';

interface CreatePlayerDialogProps {
    open: boolean;
    teams: Team[];
    onClose: () => void;
    onSuccess: () => void;
}

export const CreatePlayerDialog: React.FC<CreatePlayerDialogProps> = ({
    open,
    teams,
    onClose,
    onSuccess,
}) => {
    const [formData, setFormData] = useState<{
        teamId: number | '';
        firstName: string;
        lastName: string;
        documentId: string;
        defaultDorsal: string;
        position: PlayerPosition | '';
    }>({
        teamId: '',
        firstName: '',
        lastName: '',
        documentId: '',
        defaultDorsal: '',
        position: '',
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
        if (!formData.teamId || !formData.firstName.trim() || !formData.lastName.trim() || !formData.documentId.trim()) {
            setError('El equipo, nombre, apellido y documento de identidad son obligatorios.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const payload: CreatePlayerDto = {
                teamId: Number(formData.teamId),
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                documentId: formData.documentId.trim(),
                defaultDorsal: formData.defaultDorsal ? Number(formData.defaultDorsal) : null,
            };

            await createPlayer(payload);
            onSuccess();
            handleClose();
        } catch (err: any) {
            console.error('Error al registrar jugador:', err);
            const serverMessage = err?.response?.data?.message;
            setError(serverMessage || 'No se pudo registrar el jugador.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            teamId: '',
            firstName: '',
            lastName: '',
            documentId: '',
            defaultDorsal: '',
            position: '',
        });
        setError(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Registrar Nuevo Jugador</DialogTitle>
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
                            label="Equipo"
                            name="teamId"
                            value={formData.teamId}
                            onChange={handleChange}
                            required
                            fullWidth
                        >
                            {teams.map((t) => (
                                <MenuItem key={t.id} value={t.id}>
                                    {t.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Nombre"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                fullWidth
                            />
                            <TextField
                                label="Apellido"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                fullWidth
                            />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Documento (Cédula/DNI)"
                                name="documentId"
                                value={formData.documentId}
                                onChange={handleChange}
                                required
                                fullWidth
                            />
                            <TextField
                                label="Dorsal (#)"
                                name="defaultDorsal"
                                type="number"
                                value={formData.defaultDorsal}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Box>

                        <TextField
                            select
                            label="Posición"
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            fullWidth
                        >
                            <MenuItem value="">
                                <em>Sin definir</em>
                            </MenuItem>
                            <MenuItem value="GOALKEEPER">Portero</MenuItem>
                            <MenuItem value="DEFENDER">Defensa</MenuItem>
                            <MenuItem value="MIDFIELDER">Centrocampista</MenuItem>
                            <MenuItem value="FORWARD">Delantero</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleClose} color="inherit" disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="contained" color="primary" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Jugador'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};