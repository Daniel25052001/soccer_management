// Importa React y el hook useState para gestionar el estado local del componente.
import React, { useState } from 'react';

// Importa componentes de interfaz de usuario desde la librería Material-UI (MUI).
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

// Importa tipos de TypeScript definidos globalmente para DTOs de creación de partidos, equipos y torneos.
import type { Match, CreateMatchDto, Team, Tournament } from '../../../types';

// Importa la función de servicio encargada de realizar la petición HTTP para crear un partido.
import { createMatch } from '../services/matches.service';

// Define la interfaz con las propiedades (props) que recibe el componente CreateMatchDialog.
interface CreateMatchDialogProps {
    open: boolean;             // Controla si el diálogo está abierto o cerrado.
    tournaments: Tournament[]; // Lista de torneos disponibles para seleccionar.
    teams: Team[];             // Lista de todos los equipos disponibles.
    onClose: () => void;       // Función callback para cerrar el diálogo.
    onSuccess: () => void;
    matchToEdit?: Match | null;   // Función callback que se ejecuta al guardar con éxito.
}

// Declaración del componente funcional CreateMatchDialog tipado con React.FC y las props anteriores.
export const CreateMatchDialog: React.FC<CreateMatchDialogProps> = ({
    open,
    tournaments,
    teams,
    onClose,
    onSuccess,
}) => {
    // Declara el estado local 'formData' para almacenar los valores del formulario con su estructura inicial vacía.
    const [formData, setFormData] = useState<{
        tournamentId: number | '';
        homeTeamId: number | '';
        awayTeamId: number | '';
        matchDate: string;
        location: string;
        fieldNumber: string;
    }>({
        tournamentId: '',
        homeTeamId: '',
        awayTeamId: '',
        matchDate: '',
        location: '',
        fieldNumber: '',
    });

    // Declara un estado booleano 'loading' para indicar si hay una petición en curso (deshabilita botones).
    const [loading, setLoading] = useState<boolean>(false);

    // Declara un estado 'error' para almacenar mensajes de error en caso de fallo (string o null).
    const [error, setError] = useState<string | null>(null);

    // Filtra los equipos según el torneo seleccionado; si no hay torneo seleccionado, muestra todos los equipos.
    const filteredTeams = formData.tournamentId
        ? teams.filter((t) => t.tournamentId === Number(formData.tournamentId))
        : teams;

    // Función manejadora de cambios en los inputs del formulario.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const nextState = { ...prev, [name]: value };

            // Si se cambia el torneo seleccionado, resetea las selecciones previas de equipo local y visitante.
            if (name === 'tournamentId') {
                nextState.homeTeamId = '';
                nextState.awayTeamId = '';
            }

            return nextState;
        });
    };

    // Función manejadora del envío del formulario de manera asíncrona.
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Previene el comportamiento por defecto de recarga del formulario.

        // Valida que los campos obligatorios principales no estén vacíos.
        if (!formData.tournamentId || !formData.homeTeamId || !formData.awayTeamId || !formData.matchDate) {
            setError('Torneo, equipos y la fecha del partido son obligatorios.');
            return;
        }

        // Valida que el equipo local y el visitante no sean exactamente el mismo.
        if (formData.homeTeamId === formData.awayTeamId) {
            setError('El equipo local y el equipo visitante no pueden ser el mismo.');
            return;
        }

        try {
            setLoading(true);  // Activa el estado de carga.
            setError(null);    // Limpia errores previos.

            // Construye el objeto DTO con los tipos de datos requeridos por el backend.
            const payload: CreateMatchDto = {
                tournamentId: Number(formData.tournamentId),
                homeTeamId: Number(formData.homeTeamId),
                awayTeamId: Number(formData.awayTeamId),
                matchDate: new Date(formData.matchDate).toISOString(), // Convierte la fecha a formato ISO string.
                status: 'SCHEDULED',
            };

            // Llama al servicio para crear el partido en la API.
            await createMatch(payload);
            onSuccess();   // Ejecuta la función de éxito proporcionada por el componente padre.
            handleClose(); // Cierra y limpia el diálogo.
        } catch (err: any) {
            console.error('Error al programar partido:', err);
            const serverMsg = err?.response?.data?.message;

            // Maneja y formatea los distintos tipos de mensajes de error devueltos por el servidor.
            if (Array.isArray(serverMsg)) {
                setError(serverMsg.join(', '));
            } else if (typeof serverMsg === 'string') {
                setError(serverMsg);
            } else {
                setError('No se pudo programar el encuentro.');
            }
        } finally {
            setLoading(false); // Desactiva el estado de carga sin importar si hubo éxito o error.
        }
    };

    // Función para cerrar el diálogo, reiniciando el formulario y limpiando los errores.
    const handleClose = () => {
        setFormData({
            tournamentId: '',
            homeTeamId: '',
            awayTeamId: '',
            matchDate: '',
            location: '',
            fieldNumber: '',
        });
        setError(null);
        onClose();
    };

    // Renderizado visual del componente utilizando componentes de Material-UI.
    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            {/* Título de la ventana de diálogo */}
            <DialogTitle sx={{ fontWeight: 'bold' }}>Programar Partido</DialogTitle>

            {/* Contenedor de formulario que ejecuta handleSubmit al enviar */}
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    {/* Renderiza condicionalmente una alerta si existe un mensaje de error */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Contenedor flexible en columna para los campos de entrada */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Campo desplegable (Select) para seleccionar el Torneo */}
                        <TextField
                            select
                            label="Torneo"
                            name="tournamentId"
                            value={formData.tournamentId}
                            onChange={handleChange}
                            required
                            fullWidth
                        >
                            {/* Mapea la lista de torneos disponibles en opciones MenuItem */}
                            {tournaments.map((t) => (
                                <MenuItem key={t.id} value={t.id}>
                                    {t.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Contenedor flexible en fila para los equipos local y visitante */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {/* Campo desplegable para seleccionar el Equipo Local */}
                            <TextField
                                select
                                label="Equipo Local"
                                name="homeTeamId"
                                value={formData.homeTeamId}
                                onChange={handleChange}
                                required
                                fullWidth
                                disabled={!formData.tournamentId} // Deshabilitado si no hay un torneo seleccionado
                            >
                                {filteredTeams.map((t) => (
                                    <MenuItem
                                        key={t.id}
                                        value={t.id}
                                        disabled={t.id === formData.awayTeamId} // Deshabilita si ya fue seleccionado como visitante
                                    >
                                        {t.name}
                                    </MenuItem>
                                ))}
                            </TextField>

                            {/* Campo desplegable para seleccionar el Equipo Visitante */}
                            <TextField
                                select
                                label="Equipo Visitante"
                                name="awayTeamId"
                                value={formData.awayTeamId}
                                onChange={handleChange}
                                required
                                fullWidth
                                disabled={!formData.tournamentId} // Deshabilitado si no hay un torneo seleccionado
                            >
                                {filteredTeams.map((t) => (
                                    <MenuItem
                                        key={t.id}
                                        value={t.id}
                                        disabled={t.id === formData.homeTeamId} // Deshabilita si ya fue seleccionado como local
                                    >
                                        {t.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        {/* Campo de entrada de tipo fecha y hora para el encuentro */}
                        <TextField
                            label="Fecha y Hora de Encuentro"
                            type="datetime-local"
                            name="matchDate"
                            value={formData.matchDate}
                            onChange={handleChange}
                            slotProps={{ inputLabel: { shrink: true } }}
                            required
                            fullWidth
                        />

                        {/* Contenedor flexible para los campos de ubicación y número de cancha */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {/* Campo de texto para la Cancha / Sede */}
                            <TextField
                                label="Cancha / Sede"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                fullWidth
                            />
                            {/* Campo de texto para el Número de Cancha */}
                            <TextField
                                label="N° Cancha"
                                name="fieldNumber"
                                value={formData.fieldNumber}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Box>
                    </Box>
                </DialogContent>

                {/* Acciones o botones de pie de página del diálogo */}
                <DialogActions sx={{ p: 2 }}>
                    {/* Botón para cancelar y cerrar el diálogo */}
                    <Button onClick={handleClose} color="inherit" disabled={loading}>
                        Cancelar
                    </Button>
                    {/* Botón de envío del formulario */}
                    <Button type="submit" variant="contained" color="primary" disabled={loading}>
                        {loading ? 'Guardando...' : 'Programar Partido'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};