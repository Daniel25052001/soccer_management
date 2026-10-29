import { apiClient } from '../../../api/apiClient';

/**
 * Interfaz que representa un evento registrado en un partido (gol, tarjeta, etc.).
 */
export interface MatchEvent {
    id: number;
    matchId: number;
    teamId: number;
    playerId: number;
    type: 'GOAL' | 'OWN_GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'DOUBLE_YELLOW_RED' | 'ASSIST';
    minute: number;
    player?: {
        id: number;
        firstName: string;
        lastName: string;
        defaultDorsal?: number;
    };
    team?: {
        id: number;
        name: string;
    };
}

/**
 * Obtiene la cronología completa de los eventos registrados en un partido específico.
 */
export const getMatchEvents = async (matchId: number): Promise<MatchEvent[]> => {
    const response = await apiClient.get<MatchEvent[]>(`/match-events/match/${matchId}`);
    return response.data;
};

/**
 * Registra una nueva incidencia (gol, tarjeta, etc.) en un partido.
 */
export const createMatchEvent = async (data: {
    matchId: number;
    teamId: number;
    playerId: number;
    eventType: string;
    minute: number;
}): Promise<MatchEvent> => {
    const payload = {
        matchId: data.matchId,
        teamId: data.teamId,
        playerId: data.playerId,
        eventType: data.eventType,
        minute: data.minute,
    };
    const response = await apiClient.post<MatchEvent>('/match-events', payload);
    return response.data;
};

/**
 * Elimina un evento previamente registrado.
 */
export const deleteMatchEvent = async (eventId: number): Promise<void> => {
    await apiClient.delete(`/match-events/${eventId}`);
};