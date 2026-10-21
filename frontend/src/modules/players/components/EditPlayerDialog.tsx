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
import type { CreatePlayerDto, Player, PlayerPosition, Team } from '../../../types';
import { updatePlayer } from '../services/players.service';

interface EditPlayerDialogProps {
    open: boolean;
    player: Player | null;
    teams: Team[];
    onClose: () => void;
    onSuccess: () => void;
}

export const EditPlayerDialog: React.FC<EditPlayerDialogProps> = ({
    open,
    player,
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

    useEffect(() => {
        if (player) {
            setFormData({
                teamId: player.teamId || '',
                firstName: player.firstName || '',
                lastName: player.lastName || '',
                documentId: player.documentId || '',
                defaultDorsal: player.defaultDorsal !== null && player.defaultDorsal !== undefined
                    ? String(player.defaultDorsal)
                    : '',
                position: player.position || '',
            });
        }
    }, [player]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!player) return;

        try {
            setLoading(true);
            setError(null);

            const payload: Partial<CreatePlayerDto> = {
                teamId: Number(formData.teamId),
                firstName: formData.firstName,
                lastName: formData.lastName,
                documentId: formData.documentId ? formData.documentId : null,
                defaultDorsal: formData.defaultDorsal !== '' ? Number(formData.defaultDorsal) : null,
                position: formData.position ? (formData.position as PlayerPosition) : null,
            };

            await updatePlayer(player.id, payload);
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Error al actualizar jugador:', err);
            const serverMessage = err?.response?.data?.message;
            setError(serverMessage || 'No se pudieron actualizar los datos del jugador.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Editar Jugador</DialogTitle>
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