import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Alert,
    FormControlLabel,
    Checkbox,
} from '@mui/material';
import type { Team, CreatePlayerDto, Player } from '../../../types';
import { createPlayer, updatePlayer } from '../services/players.service';

interface CreatePlayerDialogProps {
    open: boolean;
    teams: Team[];
    playerToEdit?: Player | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreatePlayerDialog: React.FC<CreatePlayerDialogProps> = ({
    open,
    teams,
    playerToEdit,
    onClose,
    onSuccess,
}) => {
    const [teamId, setTeamId] = useState<number | ''>('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [documentId, setDocumentId] = useState('');
    const [defaultDorsal, setDefaultDorsal] = useState<number | ''>('');
    const [position, setPosition] = useState<string>('');
    const [isPaid, setIsPaid] = useState<boolean>(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (playerToEdit) {
            setTeamId(playerToEdit.teamId || '');
            setFirstName(playerToEdit.firstName || '');
            setLastName(playerToEdit.lastName || '');
            setDocumentId(playerToEdit.documentId || '');
            setDefaultDorsal(playerToEdit.defaultDorsal ?? '');
            setPosition(playerToEdit.position || '');
            setIsPaid(playerToEdit.isPaid ?? true);
        } else {
            setTeamId('');
            setFirstName('');
            setLastName('');
            setDocumentId('');
            setDefaultDorsal('');
            setPosition('');
            setIsPaid(true);
        }
        setError(null);
    }, [playerToEdit, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamId || !firstName.trim() || !lastName.trim() || !documentId.trim()) {
            setError('Por favor completa todos los campos obligatorios.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const payload: CreatePlayerDto = {
                teamId: Number(teamId),
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                documentId: documentId.trim(),
                defaultDorsal: defaultDorsal !== '' ? Number(defaultDorsal) : undefined,
                position: position ? position : undefined,
                isPaid: isPaid,
            };

            if (playerToEdit) {
                await updatePlayer(playerToEdit.id, payload);
            } else {
                await createPlayer(payload);
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Error al guardar jugador:', err);
            setError(err.response?.data?.message || 'Ocurrió un error al guardar el jugador.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{playerToEdit ? 'Editar Jugador' : 'Registrar Nuevo Jugador'}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <TextField
                        select
                        label="Equipo *"
                        value={teamId}
                        onChange={(e) => setTeamId(Number(e.target.value))}
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                    >
                        {teams.map((team) => (
                            <MenuItem key={team.id} value={team.id}>
                                {team.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Nombres *"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        label="Apellidos *"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        label="Documento de Identidad *"
                        value={documentId}
                        onChange={(e) => setDocumentId(e.target.value)}
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        label="Dorsal (Número)"
                        type="number"
                        value={defaultDorsal}
                        onChange={(e) => setDefaultDorsal(e.target.value !== '' ? Number(e.target.value) : '')}
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        select
                        label="Posición"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                    >
                        <MenuItem value="">
                            <em>Ninguna / Sin especificar</em>
                        </MenuItem>
                        <MenuItem value="GOALKEEPER">Arquero</MenuItem>
                        <MenuItem value="DEFENDER">Defensa</MenuItem>
                        <MenuItem value="MIDFIELDER">Mediocampista</MenuItem>
                        <MenuItem value="FORWARD">Delantero</MenuItem>
                    </TextField>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isPaid}
                                onChange={(e) => setIsPaid(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Inscripción pagada"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit" disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? 'Guardando...' : playerToEdit ? 'Actualizar' : 'Registrar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CreatePlayerDialog;