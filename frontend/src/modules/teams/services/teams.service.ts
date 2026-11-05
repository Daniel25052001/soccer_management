import { apiClient } from '../../../api/apiClient';
import type { Team } from '../../../types';

/**
 * DTO para la creación o edición de un equipo en la API.
 */
export type CreateTeamDto = Omit<Team, 'id' | 'createdAt'>;

/**
 * Obtiene el listado completo de equipos desde la API REST.
 * 
 * @returns {Promise<Team[]>} Promesa que resuelve con la lista de equipos.
 */
export const getTeams = async (): Promise<Team[]> => {
    const response = await apiClient.get<Team[]>('/teams');
    return response.data;
};

/**
 * Registra un nuevo equipo en el sistema.
 * 
 * @param {CreateTeamDto} data Objeto con la información del equipo.
 * @returns {Promise<Team>} Promesa con el equipo registrado.
 */
export const createTeam = async (data: CreateTeamDto): Promise<Team> => {
    const response = await apiClient.post<Team>('/teams', data);
    return response.data;
};

/**
 * Actualiza los datos de un equipo existente.
 * 
 * @param {number} id Identificador del equipo.
 * @param {Partial<CreateTeamDto>} data Datos a modificar.
 * @returns {Promise<Team>} Promesa con el equipo actualizado.
 */
export const updateTeam = async (id: number, data: Partial<CreateTeamDto>): Promise<Team> => {
    const response = await apiClient.patch<Team>(`/teams/${id}`, data);
    return response.data;
};

/**
 * Elimina un equipo del sistema por su ID.
 * 
 * @param {number} id Identificador único del equipo.
 * @returns {Promise<void>} Promesa vacía al completar el borrado.
 */
export const deleteTeam = async (id: number): Promise<void> => {
    await apiClient.delete(`/teams/${id}`);
};