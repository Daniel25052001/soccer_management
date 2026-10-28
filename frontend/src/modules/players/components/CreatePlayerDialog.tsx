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

/**
 * Interfaz que define las propiedades (props) requeridas por el componente.
 */
interface CreatePlayerDialogProps {
    open: boolean;         // Controla la visibilidad del modal (abierto/cerrado)
    teams: Team[];         // Listado de equipos disponibles para asociar al jugador
    onClose: () => void;   // Función ejecutada al cerrar el modal sin guardar
    onSuccess: () => void; // Función ejecutada al completar con éxito el registro (refresca la tabla)
}

export const CreatePlayerDialog: React.FC<CreatePlayerDialogProps> = ({
    open,
    teams,
    onClose,
    onSuccess,
}) => {
    // Estado local que almacena los datos ingresados en el formulario de creación
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

    // Estados para manejar el indicador de carga y la visualización de errores
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Manejador genérico para actualizar dinámicamente los campos del formulario
     * cada vez que el usuario escribe o selecciona una opción.
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    /**
     * Manejador para procesar el envío de los datos hacia la API.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validación previa en frontend para asegurar campos obligatorios mínimos
        if (!formData.teamId || !formData.firstName.trim() || !formData.lastName.trim() || !formData.documentId.trim()) {
            setError('El equipo, nombre, apellido y documento de identidad son obligatorios.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Construcción del payload con tipado estricto (CreatePlayerDto)
            const payload: CreatePlayerDto = {
                teamId: Number(formData.teamId),
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                documentId: formData.documentId.trim(),
                defaultDorsal: formData.defaultDorsal ? Number(formData.defaultDorsal) : null,
                position: formData.position || undefined, // Envía la posición seleccionada o undefined si está vacía
            };

            // Llamada al servicio HTTP para registrar el jugador en el backend
            await createPlayer(payload);

            onSuccess();   // Dispara la recarga de datos en la vista principal
            handleClose(); // Restablece el formulario y cierra el diálogo
        } catch (err: any) {
            console.error('Error al registrar jugador:', err);
            const serverMessage = err?.response?.data?.message;
            setError(serverMessage || 'No se pudo registrar el jugador.');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Limpia los estados del formulario y cierra el diálogo de manera segura.
     */
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
                    {/* Componente de alerta condicional para mostrar errores de validación o del servidor */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Selector desplegable para asociar el equipo */}
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

                        {/* Fila de campos para Nombre y Apellido */}
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

                        {/* Fila de campos para Documento de identidad y Dorsal numérico */}
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

                        {/* Selector desplegable para definir la posición táctica del jugador */}
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

                {/* Acciones del pie de página del modal */}
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