import { apiClient } from '../../../api/apiClient';
import type { CreatePlayerDto, Player } from '../../../types';

/**
 * Obtiene la lista completa de jugadores desde la API REST.
 */
export const getPlayers = async (): Promise<Player[]> => {
    const response = await apiClient.get<Player[]>('/players');
    return response.data;
};

/**
 * Registra un nuevo jugador en la base de datos.
 */
export const createPlayer = async (data: CreatePlayerDto): Promise<Player> => {
    const response = await apiClient.post<Player>('/players', data);
    return response.data;
};

/**
 * Actualiza parcialmente los datos de un jugador existente.
 */
export const updatePlayer = async (
    id: number,
    data: Partial<CreatePlayerDto>,
): Promise<Player> => {
    const response = await apiClient.patch<Player>(`/players/${id}`, data);
    return response.data;
};

/**
 * Elimina un jugador por su identificador único.
 */
export const deletePlayer = async (id: number): Promise<void> => {
    await apiClient.delete(`/players/${id}`);
};