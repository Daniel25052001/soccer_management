import { apiClient } from '../../../api/apiClient';
import type { CreateTournamentDto, Tournament } from '../../../types';

/**
 * Consulta la lista completa de torneos registrados en el sistema.
 * 
 * @returns {Promise<Tournament[]>} Promesa que resuelve con la lista de torneos.
 */
export const getTournaments = async (): Promise<Tournament[]> => {
    const response = await apiClient.get<Tournament[]>('/tournaments');
    return response.data;
};

/**
 * Consulta los detalles de un torneo específico por su identificador único.
 * 
 * @param {number} id Identificador único del torneo.
 * @returns {Promise<Tournament>} Objeto del torneo encontrado.
 */
export const getTournamentById = async (id: number): Promise<Tournament> => {
    const response = await apiClient.get<Tournament>(`/tournaments/${id}`);
    return response.data;
};

/**
 * Registra un nuevo torneo en el sistema.
 * 
 * @param {CreateTournamentDto} data Payload de creación con campos requeridos y opcionales.
 * @returns {Promise<Tournament>} Objeto del torneo recién registrado.
 */
export const createTournament = async (data: CreateTournamentDto): Promise<Tournament> => {
    const response = await apiClient.post<Tournament>('/tournaments', data);
    return response.data;
};

/**
 * Actualiza parcialmente la información de un torneo existente.
 * 
 * @param {number} id Identificador del torneo a actualizar.
 * @param {Partial<CreateTournamentDto>} data Campos a modificar.
 * @returns {Promise<Tournament>} Objeto del torneo actualizado.
 */
export const updateTournament = async (
    id: number,
    data: Partial<CreateTournamentDto>,
): Promise<Tournament> => {
    const response = await apiClient.patch<Tournament>(`/tournaments/${id}`, data);
    return response.data;
};

/**
 * Elimina un torneo de la base de datos por su ID.
 * 
 * @param {number} id Identificador único del torneo a remover.
 * @returns {Promise<void>} Promesa resuelta tras completar la eliminación.
 */
export const deleteTournament = async (id: number): Promise<void> => {
    await apiClient.delete(`/tournaments/${id}`);
};