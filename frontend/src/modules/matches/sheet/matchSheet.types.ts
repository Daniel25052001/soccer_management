
export interface RefereeOption {
    id: number;
    name: string;
    status?: string;
}

export interface PlayerSheetRowData {
    playerId: number;
    teamId: number;
    firstName: string;
    lastName: string;
    documentId: string;
    position: string | null;
    jerseyNumber: number;
    played: boolean;
    isStarter: boolean;
    isSuspended: boolean;
    goals: number;
    yellowCards: number;
    redCards: number;
}

export interface TeamSheetData {
    id: number;
    name: string;
    players: PlayerSheetRowData[];
}

export interface MatchSheetHeaderData {
    id: number;
    tournamentId: number;
    tournamentName: string;
    matchDate: string;
    venue: string;
    phase: string;
    sheetNumber: string;
    status: string;
    refereeId: number | null;
    referee: RefereeOption | null;
    homeScore: number;
    awayScore: number;
}

export interface MatchSheetResponse {
    match: MatchSheetHeaderData;
    homeTeam: TeamSheetData;
    awayTeam: TeamSheetData;
}

export interface SaveMatchSheetPayload {
    venue?: string;
    phase?: string;
    sheetNumber?: string;
    refereeId?: number | null;
    status?: string;
    players: Array<{
        playerId: number;
        teamId: number;
        jerseyNumber: number;
        played: boolean;
        isStarter: boolean;
        goals: number;
        yellowCards: number;
        redCards: number;
    }>;
}
