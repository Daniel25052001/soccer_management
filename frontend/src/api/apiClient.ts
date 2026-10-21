import axios from 'axios';

/**
 * Instancia centralizada de Axios configurada para consumir la API REST de NestJS.
 * Define la URL base de conexión local y las cabeceras por defecto para solicitudes JSON.
 */
export const apiClient = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});