import React, { useState, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Box,
    Typography,
    Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { Team } from '../../../types';
import { createBulkPlayers } from '../services/players.service';
import { PlayerRow } from './PlayerRow';

export interface BulkPlayerDto {
    firstName: string;
    lastName: string;
    documentId: string;
    defaultDorsal?: number;
    position?: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    teams: Team[];
    onSuccess: () => void;
}

export const CreateBulkPlayersDialog: React.FC<Props> = ({
    open,
    onClose,
    teams,
    onSuccess,
}) => {
    const [selectedTeamId, setSelectedTeamId] = useState<number | ''>('');
    const [players, setPlayers] = useState<BulkPlayerDto[]>([
        { firstName: '', lastName: '', documentId: '', defaultDorsal: undefined, position: '' },
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAddRow = () => {
        setPlayers((prev) => [
            ...prev,
            { firstName: '', lastName: '', documentId: '', defaultDorsal: undefined, position: '' },
        ]);
    };

    const handleRemoveRow = useCallback((index: number) => {
        setPlayers((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
    }, []);

    const handleChange = useCallback((index: number, field: keyof BulkPlayerDto, value: any) => {
        setPlayers((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    }, []);

    const handleSubmit = async () => {
        if (!selectedTeamId) {
            setError('Por favor selecciona un equipo al cual registrar los jugadores.');
            return;
        }

        for (const p of players) {
            if (!p.firstName || !p.lastName || !p.documentId) {
                setError('Por favor completa los campos obligatorios (Nombre, Apellido y Documento) en todas las filas.');
                return;
            }
        }

        try {
            setLoading(true);
            setError(null);
            await createBulkPlayers(Number(selectedTeamId), players);
            onSuccess();
            onClose();
            // Limpiar formulario
            setPlayers([{ firstName: '', lastName: '', documentId: '', defaultDorsal: undefined, position: '' }]);
            setSelectedTeamId('');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Ocurrió un error al registrar los jugadores en bloque.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>Carga Masiva de Jugadores</DialogTitle>
            <DialogContent dividers>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Selector de Equipo */}
                <TextField
                    select
                    label="Seleccionar Equipo *"
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(Number(e.target.value))}
                    fullWidth
                    size="small"
                    sx={{ mb: 3 }}
                >
                    {teams.map((team) => (
                        <MenuItem key={team.id} value={team.id}>
                            {team.name}
                        </MenuItem>
                    ))}
                </TextField>

                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Agrega los jugadores que necesites a la lista. Todos se registrarán en el equipo seleccionado.
                </Typography>

                {players.map((player, index) => (
                    <PlayerRow
                        key={index}
                        index={index}
                        player={player}
                        onChange={handleChange}
                        onRemove={handleRemoveRow}
                        disableRemove={players.length === 1}
                    />
                ))}

                <Button
                    startIcon={<AddIcon />}
                    variant="outlined"
                    onClick={handleAddRow}
                    sx={{ mt: 1 }}
                >
                    Añadir otra fila
                </Button>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Cancelar
                </Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar Jugadores'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};