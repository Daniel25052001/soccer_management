import { apiClient } from '../../../api/apiClient';

export interface TeamStanding {
    teamId: number;
    teamName: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
}

/**
 * Obtiene la tabla de posiciones calculada para un torneo específico.
 */
export const getStandings = async (tournamentId: number): Promise<TeamStanding[]> => {
    const response = await apiClient.get<TeamStanding[]>(`/standings/${tournamentId}`);
    return response.data;
};