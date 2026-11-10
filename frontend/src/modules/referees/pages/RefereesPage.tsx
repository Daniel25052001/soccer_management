import React, { useCallback, useEffect, useState } from 'react';
import {
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

import type { Referee } from '../../../types';
import { getReferees, createReferee, updateReferee, deleteReferee } from '../services/referees.service';
import { ConfirmDeleteDialog } from '../../../components/ConfirmDeleteDialog';

/**
 * Componente principal para la administración de árbitros y jueces del torneo.
 */
export const RefereesPage: React.FC = () => {
    const [referees, setReferees] = useState<Referee[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Estados para modales de Crear/Editar
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [editingReferee, setEditingReferee] = useState<Referee | null>(null);
    const [name, setName] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);

    // Estado para modal de Eliminar
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
    const [refereeToDelete, setRefereeToDelete] = useState<Referee | null>(null);
    const [deleting, setDeleting] = useState<boolean>(false);

    const fetchReferees = useCallback(async () => {
        try {
            setLoading(true);
            setErrorMessage(null);
            const data = await getReferees();
            setReferees(data);
        } catch (error) {
            console.error('Error al cargar árbitros:', error);
            setErrorMessage('No se pudo conectar con el servidor para obtener los árbitros.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReferees();
    }, [fetchReferees]);

    const handleOpenCreate = () => {
        setEditingReferee(null);
        setName('');
        setPhone('');
        setEmail('');
        setOpenDialog(true);
    };

    const handleOpenEdit = (referee: Referee) => {
        setEditingReferee(referee);
        setName(referee.name);
        setPhone(referee.phone || '');
        setEmail(referee.email || '');
        setOpenDialog(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            setSubmitting(true);
            if (editingReferee) {
                await updateReferee(editingReferee.id, { name, phone, email });
            } else {
                await createReferee({ name, phone, email });
            }
            setOpenDialog(false);
            fetchReferees();
        } catch (error) {
            console.error('Error al guardar árbitro:', error);
            setErrorMessage('No se pudo guardar la información del árbitro.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenDelete = (referee: Referee) => {
        setRefereeToDelete(referee);
        setOpenDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!refereeToDelete) return;
        try {
            setDeleting(true);
            await deleteReferee(refereeToDelete.id);
            setOpenDeleteDialog(false);
            setRefereeToDelete(null);
            fetchReferees();
        } catch (error) {
            console.error('Error al eliminar árbitro:', error);
            setErrorMessage('No se pudo eliminar el árbitro seleccionado.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Box>
            {/* Cabecera */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Gestión de Árbitros y Jueces
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                >
                    Nuevo Árbitro
                </Button>
            </Box>

            {errorMessage && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {errorMessage}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Paper elevation={3}>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell><b>Nombre del Árbitro</b></TableCell>
                                    <TableCell><b>Teléfono</b></TableCell>
                                    <TableCell><b>Correo Electrónico</b></TableCell>
                                    <TableCell align="center"><b>Estado</b></TableCell>
                                    <TableCell align="center"><b>Acciones</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {referees.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            No hay árbitros registrados en el sistema.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    referees.map((referee) => (
                                        <TableRow key={referee.id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <PersonIcon color="action" fontSize="small" />
                                                    <b>{referee.name}</b>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <PhoneIcon color="action" fontSize="small" />
                                                    {referee.phone || '-'}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <EmailIcon color="action" fontSize="small" />
                                                    {referee.email || '-'}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={referee.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                                    color={referee.status === 'ACTIVE' ? 'success' : 'default'}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Editar">
                                                    <IconButton color="primary" onClick={() => handleOpenEdit(referee)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Eliminar">
                                                    <IconButton color="error" onClick={() => handleOpenDelete(referee)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* Modal para Crear / Editar Árbitro */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleSave}>
                    <DialogTitle sx={{ fontWeight: 'bold' }}>
                        {editingReferee ? 'Editar Árbitro' : 'Registrar Nuevo Árbitro'}
                    </DialogTitle>
                    <DialogContent dividers>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <TextField
                                label="Nombre completo"
                                required
                                fullWidth
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <TextField
                                label="Teléfono de contacto"
                                fullWidth
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                            <TextField
                                label="Correo electrónico"
                                type="email"
                                fullWidth
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)} color="inherit">
                            Cancelar
                        </Button>
                        <Button type="submit" variant="contained" disabled={submitting}>
                            {submitting ? <CircularProgress size={24} /> : 'Guardar'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Modal de Confirmación de Eliminación */}
            <ConfirmDeleteDialog
                open={openDeleteDialog}
                title="¿Eliminar Árbitro?"
                description={`¿Estás seguro de que deseas eliminar al árbitro "${refereeToDelete?.name}"?`}
                loading={deleting}
                onClose={() => setOpenDeleteDialog(false)}
                onConfirm={confirmDelete}
            />
        </Box>
    );
};

export default RefereesPage;