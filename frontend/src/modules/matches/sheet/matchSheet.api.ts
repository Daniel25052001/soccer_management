import { apiClient } from '../../../api/apiClient';
import type { MatchSheetResponse, SaveMatchSheetPayload } from './matchSheet.types';

/**
 * Obtiene la planilla completa de un partido (cabecera y plantillas de ambos equipos).
 */
export async function fetchMatchSheet(matchId: number): Promise<MatchSheetResponse> {
    const { data } = await apiClient.get<MatchSheetResponse>(`/matches/${matchId}/sheet`);
    return data;
}

/**
 * Guarda o actualiza la planilla completa de un partido en una sola transacción.
 */
export async function saveMatchSheet(
    matchId: number,
    payload: SaveMatchSheetPayload,
): Promise<MatchSheetResponse> {
    const { data } = await apiClient.put<MatchSheetResponse>(
        `/matches/${matchId}/sheet`,
        payload,
    );
    return data;
}