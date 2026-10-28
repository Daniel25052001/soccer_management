import { apiClient } from '../../../api/apiClient';
import type { CreateMatchDto, Match, UpdateMatchDto } from '../../../types';

/**
 * Obtiene el listado de partidos. Permite filtrar opcionalmente por torneo.
 * 
 * @param {number} [tournamentId] ID del torneo opcional para filtrar los partidos.
 * @returns {Promise<Match[]>} Promesa que resuelve la lista de partidos.
 */
export const getMatches = async (tournamentId?: number): Promise<Match[]> => {
    const url = tournamentId ? `/matches?tournamentId=${tournamentId}` : '/matches';
    const response = await apiClient.get<Match[]>(url);
    return response.data;
};

/**
 * Programa un nuevo partido en el calendario.
 * 
 * @param {CreateMatchDto} data Datos del partido a crear.
 * @returns {Promise<Match>} Promesa con el partido creado.
 */
export const createMatch = async (data: CreateMatchDto): Promise<Match> => {
    const response = await apiClient.post<Match>('/matches', data);
    return response.data;
};

/**
 * Actualiza la información, marcador o estado de un partido.
 * 
 * @param {number} id ID del partido a actualizar.
 * @param {UpdateMatchDto} data Datos parciales a modificar.
 * @returns {Promise<Match>} Promesa con el partido actualizado.
 */
export const updateMatch = async (id: number, data: UpdateMatchDto) => {
    const response = await apiClient.patch(`/api/matches/${id}`, data);
    return response.data;
};
/**
 * Elimina un partido programado de la base de datos.
 * 
 * @param {number} id ID del partido a eliminar.
 * @returns {Promise<void>} Promesa vacía al completar el borrado.
 */
export const deleteMatch = async (id: number): Promise<void> => {
    await apiClient.delete(`/matches/${id}`);
};