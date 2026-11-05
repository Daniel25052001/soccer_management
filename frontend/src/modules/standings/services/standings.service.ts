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

export interface TopScorer {
    playerId: number;
    playerName: string;
    teamName: string;
    goals: number;
}

export interface BestDefense {
    teamName: string;
    goalsAgainst: number;
    played: number;
}

/**
 * Obtiene la tabla de posiciones calculada para un torneo específico.
 */
export const getStandings = async (tournamentId: number): Promise<TeamStanding[]> => {
    const response = await apiClient.get<TeamStanding[]>(`/standings/${tournamentId}`);
    return response.data;
};

/**
 * Obtiene la valla menos vencida de un torneo.
 */
export const getBestDefense = async (tournamentId: number): Promise<BestDefense | null> => {
    const response = await apiClient.get<BestDefense>(`/standings/${tournamentId}/best-defense`);
    return response.data;
};

/**
 * Obtiene el top de goleadores de un torneo.
 */
export const getTopScorers = async (tournamentId: number) => {
    const response = await fetch(`http://localhost:3000/api/standings/${tournamentId}/top-scorers`);
    return await response.json();
};