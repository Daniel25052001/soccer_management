import { apiClient } from '../../../api/apiClient';
import type { CreateTournamentDto, Tournament } from '../../../types';

/**
 * Consulta el listado completo de torneos desde la API REST.
 * 
 * @returns {Promise<Tournament[]>} Promesa que resuelve con la lista de torneos.
 */
export const getTournaments = async (): Promise<Tournament[]> => {
    const response = await apiClient.get<Tournament[]>('/tournaments');
    return response.data;
};

/**
 * Consulta un torneo por su identificador único.
 * 
 * @param {number} id Identificador del torneo.
 * @returns {Promise<Tournament>} Promesa con el torneo encontrado.
 */
export const getTournamentById = async (id: number): Promise<Tournament> => {
    const response = await apiClient.get<Tournament>(`/tournaments/${id}`);
    return response.data;
};

/**
 * Registra un nuevo torneo en la base de datos.
 * 
 * @param {CreateTournamentDto} data Payload de creación con campos opcionales permitidos.
 * @returns {Promise<Tournament>} Promesa con el torneo registrado.
 */
export const createTournament = async (data: CreateTournamentDto): Promise<Tournament> => {
    const response = await apiClient.post<Tournament>('/tournaments', data);
    return response.data;
};

/**
 * Actualiza los datos de un torneo existente.
 * 
 * @param {number} id Identificador del torneo.
 * @param {Partial<CreateTournamentDto>} data Campos a actualizar.
 * @returns {Promise<Tournament>} Promesa con el torneo modificado.
 */
export const updateTournament = async (
    id: number,
    data: Partial<CreateTournamentDto>,
): Promise<Tournament> => {
    const response = await apiClient.patch<Tournament>(`/tournaments/${id}`, data);
    return response.data;
};

/**
 * Elimina un torneo del sistema por su ID.
 * 
 * @param {number} id Identificador del torneo a remover.
 * @returns {Promise<void>} Promesa vacía al completar el borrado.
 */
export const deleteTournament = async (id: number): Promise<void> => {
    await apiClient.delete(`/tournaments/${id}`);
};