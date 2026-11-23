import React, { useState, useEffect, memo, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip,
    Box,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Team } from '../../../types';
import axios from 'axios';

interface BulkPlayerRowData {
    id: string;
    firstName: string;
    lastName: string;
    documentId: string;
    defaultDorsal: string;
    position: string;
}

interface CreateBulkPlayersDialogProps {
    open: boolean;
    teams: Team[];
    onClose: () => void;
    onSuccess: () => void;
}

interface PlayerRowProps {
    row: BulkPlayerRowData;
    index: number;
    onChange: (id: string, field: keyof BulkPlayerRowData, value: string) => void;
    onRemove: (id: string) => void;
    canDelete: boolean;
}

const PlayerRow = memo(({ row, index, onChange, onRemove, canDelete }: PlayerRowProps) => {
    return (
        <TableRow hover>
            <TableCell>
                <TextField
                    size="small"
                    variant="outlined"
                    fullWidth
                    value={row.firstName}
                    onChange={(e) => onChange(row.id, 'firstName', e.target.value)}
                    placeholder="Nombres"
                />
            </TableCell>
            <TableCell>
                <TextField
                    size="small"
                    variant="outlined"
                    fullWidth
                    value={row.lastName}
                    onChange={(e) => onChange(row.id, 'lastName', e.target.value)}
                    placeholder="Apellidos"
                />
            </TableCell>
            <TableCell>
                <TextField
                    size="small"
                    variant="outlined"
                    fullWidth
                    value={row.documentId}
                    onChange={(e) => onChange(row.id, 'documentId', e.target.value)}
                    placeholder="Documento"
                />
            </TableCell>
            <TableCell>
                <TextField
                    size="small"
                    type="number"
                    variant="outlined"
                    fullWidth
                    value={row.defaultDorsal}
                    onChange={(e) => onChange(row.id, 'defaultDorsal', e.target.value)}
                    placeholder="#"
                />
            </TableCell>
            <TableCell>
                <TextField
                    select
                    size="small"
                    variant="outlined"
                    fullWidth
                    value={row.position}
                    onChange={(e) => onChange(row.id, 'position', e.target.value)}
                >
                    <MenuItem value=""><em>N/D</em></MenuItem>
                    <MenuItem value="GOALKEEPER">Arquero</MenuItem>
                    <MenuItem value="DEFENDER">Defensa</MenuItem>
                    <MenuItem value="FULLBACK">Lateral</MenuItem>
                    <MenuItem value="MIDFIELDER">Mediocampista</MenuItem>
                    <MenuItem value="FORWARD">Delantero</MenuItem>
                </TextField>
            </TableCell>
            <TableCell align="center">
                <Tooltip title="Eliminar fila">
                    <span>
                        <IconButton
                            color="error"
                            size="small"
                            onClick={() => onRemove(row.id)}
                            disabled={!canDelete}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            </TableCell>
        </TableRow>
    );
});

PlayerRow.displayName = 'PlayerRow';

export const CreateBulkPlayersDialog: React.FC<CreateBulkPlayersDialogProps> = ({
    open,
    teams,
    onClose,
    onSuccess,
}) => {
    const [teamId, setTeamId] = useState<number | ''>('');
    const [rows, setRows] = useState<BulkPlayerRowData[]>([
        { id: Math.random().toString(36).substring(2, 9), firstName: '', lastName: '', documentId: '', defaultDorsal: '', position: '' }
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setTeamId('');
            setRows([
                { id: Math.random().toString(36).substring(2, 9), firstName: '', lastName: '', documentId: '', defaultDorsal: '', position: '' }
            ]);
            setError(null);
        }
    }, [open]);

    const handleAddRow = useCallback(() => {
        setRows((prev) => [
            ...prev,
            { id: Math.random().toString(36).substring(2, 9), firstName: '', lastName: '', documentId: '', defaultDorsal: '', position: '' }
        ]);
    }, []);

    const handleRemoveRow = useCallback((id: string) => {
        setRows((prev) => {
            if (prev.length === 1) return prev;
            return prev.filter((r) => r.id !== id);
        });
    }, []);

    const handleRowChange = useCallback((id: string, field: keyof BulkPlayerRowData, value: string) => {
        setRows((prev) =>
            prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
        );
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamId) {
            setError('Por favor selecciona un equipo para la carga masiva.');
            return;
        }

        for (let i = 0; i < rows.length; i++) {
            if (!rows[i].firstName.trim() || !rows[i].lastName.trim() || !rows[i].documentId.trim()) {
                setError(`La fila #${i + 1} tiene campos obligatorios vacíos (Nombres, Apellidos o Documento).`);
                return;
            }
        }

        try {
            setLoading(true);
            setError(null);

            const payload = {
                teamId: Number(teamId),
                players: rows.map((r) => ({
                    firstName: r.firstName.trim(),
                    lastName: r.lastName.trim(),
                    documentId: r.documentId.trim(),
                    defaultDorsal: r.defaultDorsal !== '' ? Number(r.defaultDorsal) : undefined,
                    position: r.position ? r.position : undefined,
                    isPaid: true,
                })),
            };

            await axios.post('http://localhost:3000/api/players/bulk', payload);

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Error en carga masiva:', err);
            setError(err.response?.data?.message || 'Ocurrió un error al registrar los jugadores.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Carga Masiva de Jugadores</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{ mb: 3 }}>
                        <TextField
                            select
                            label="Seleccionar Equipo para todos *"
                            value={teamId}
                            onChange={(e) => setTeamId(Number(e.target.value))}
                            fullWidth
                            size="small"
                        >
                            {teams.map((team) => (
                                <MenuItem key={team.id} value={team.id}>
                                    {team.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>

                    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: '380px' }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell><b>Nombres *</b></TableCell>
                                    <TableCell><b>Apellidos *</b></TableCell>
                                    <TableCell><b>Documento *</b></TableCell>
                                    <TableCell sx={{ width: '90px' }}><b>Dorsal</b></TableCell>
                                    <TableCell sx={{ width: '140px' }}><b>Posición</b></TableCell>
                                    <TableCell align="center" sx={{ width: '60px' }}><b>Acción</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row, index) => (
                                    <PlayerRow
                                        key={row.id}
                                        row={row}
                                        index={index}
                                        onChange={handleRowChange}
                                        onRemove={handleRemoveRow}
                                        canDelete={rows.length > 1}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start' }}>
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={handleAddRow}
                            size="small"
                        >
                            Agregar otra fila
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit" disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? 'Guardando...' : `Guardar ${rows.length} Jugador(es)`}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CreateBulkPlayersDialog;