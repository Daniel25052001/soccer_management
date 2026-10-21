import { apiClient } from '../../../api/apiClient';
import type { CreateMatchDto, Match, UpdateMatchDto } from '../../../types';

/**
 * Obtiene el listado de partidos. Permite filtrar opcionalmente por torneo.
 */
export const getMatches = async (tournamentId?: number): Promise<Match[]> => {
    const url = tournamentId ? `/matches?tournamentId=${tournamentId}` : '/matches';
    const response = await apiClient.get<Match[]>(url);
    return response.data;
};

/**
 * Programa un nuevo partido en el calendario.
 */
export const createMatch = async (data: CreateMatchDto): Promise<Match> => {
    const response = await apiClient.post<Match>('/matches', data);
    return response.data;
};

/**
 * Actualiza la información, marcador o estado de un partido.
 */
export const updateMatch = async (id: number, data: UpdateMatchDto): Promise<Match> => {
    const response = await apiClient.patch<Match>(`/matches/${id}`, data);
    return response.data;
};

/**
 * Elimina un partido programado de la base de datos.
 */
export const deleteMatch = async (id: number): Promise<void> => {
    await apiClient.delete(`/matches/${id}`);
};