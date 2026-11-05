// Importa React y hooks necesarios para gestionar el estado local y efectos del componente.
import React, { useState, useEffect } from 'react';

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

// Importa tipos de TypeScript definidos globalmente para partidos, DTOs, equipos y torneos.
import type { Match, CreateMatchDto, Team, Tournament } from '../../../types';

// Importa las funciones de servicio encargadas de realizar las peticiones HTTP para crear y actualizar partidos.
import { createMatch, updateMatch } from '../services/matches.service';

// Define la interfaz con las propiedades (props) que recibe el componente CreateMatchDialog.
interface CreateMatchDialogProps {
    open: boolean;                 // Controla si el diálogo está abierto o cerrado.
    tournaments: Tournament[];     // Lista de torneos disponibles para seleccionar.
    teams: Team[];                 // Lista de todos los equipos disponibles.
    onClose: () => void;           // Función callback para cerrar el diálogo.
    onSuccess: () => void;         // Función callback que se ejecuta al guardar con éxito.
    matchToEdit?: Match | null;    // Partido opcional a editar; si es null/undefined, se trata de una creación.
}

// Declaración del componente funcional CreateMatchDialog tipado con React.FC y las props anteriores.
export const CreateMatchDialog: React.FC<CreateMatchDialogProps> = ({
    open,
    tournaments,
    teams,
    onClose,
    onSuccess,
    matchToEdit,
}) => {
    // Declara el estado local 'formData' para almacenar los valores del formulario.
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

    // Declara un estado booleano 'loading' para indicar si hay una petición en curso.
    const [loading, setLoading] = useState<boolean>(false);

    // Declara un estado 'error' para almacenar mensajes de error en caso de fallo.
    const [error, setError] = useState<string | null>(null);

    // Efecto para precargar los datos en el formulario cuando se pasa un partido a editar
    useEffect(() => {
        if (matchToEdit) {
            // Formatea la fecha al formato requerido por 'datetime-local' (YYYY-MM-DDTHH:mm)
            const formattedDate = matchToEdit.matchDate
                ? new Date(matchToEdit.matchDate).toISOString().slice(0, 16)
                : '';

            setFormData({
                tournamentId: matchToEdit.tournamentId ?? '',
                homeTeamId: matchToEdit.homeTeamId ?? '',
                awayTeamId: matchToEdit.awayTeamId ?? '',
                matchDate: formattedDate,
                location: matchToEdit.location ?? '',
                fieldNumber: matchToEdit.fieldNumber ?? '',
            });
        } else {
            // Si no hay partido a editar, resetea el formulario para uno nuevo
            setFormData({
                tournamentId: '',
                homeTeamId: '',
                awayTeamId: '',
                matchDate: '',
                location: '',
                fieldNumber: '',
            });
        }
    }, [matchToEdit, open]);

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
                status: matchToEdit ? matchToEdit.status : 'SCHEDULED',
            };

            if (matchToEdit) {
                // Si existe matchToEdit, actualiza el registro existente mediante PUT/PATCH
                await updateMatch(matchToEdit.id, payload);
            } else {
                // Si no existe, crea un partido nuevo
                await createMatch(payload);
            }

            onSuccess();   // Ejecuta la función de éxito proporcionada por el componente padre.
            handleClose(); // Cierra y limpia el diálogo.
        } catch (err: any) {
            console.error('Error al guardar partido:', err);
            const serverMsg = err?.response?.data?.message;

            // Maneja y formatea los distintos tipos de mensajes de error devueltos por el servidor.
            if (Array.isArray(serverMsg)) {
                setError(serverMsg.join(', '));
            } else if (typeof serverMsg === 'string') {
                setError(serverMsg);
            } else {
                setError('No se pudo guardar el encuentro.');
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
            {/* Título dinámico dependiendo de si se está editando o creando */}
            <DialogTitle sx={{ fontWeight: 'bold' }}>
                {matchToEdit ? 'Editar Partido' : 'Programar Partido'}
            </DialogTitle>

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
                    {/* Botón de envío del formulario dinámico */}
                    <Button type="submit" variant="contained" color="primary" disabled={loading}>
                        {loading ? 'Guardando...' : matchToEdit ? 'Actualizar Partido' : 'Programar Partido'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};