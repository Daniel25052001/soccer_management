/**
 * Estados posibles para la gestión del ciclo de vida de un torneo municipal.
 * Se define como un objeto inmutable (as const) para ser compatible con erasableSyntaxOnly.
 */
export const TournamentStatus = {
    DRAFT: 'DRAFT',
    IN_PROGRESS: 'IN_PROGRESS',
    FINISHED: 'FINISHED',
    CANCELLED: 'CANCELLED',
} as const;

export type TournamentStatus = typeof TournamentStatus[keyof typeof TournamentStatus];

/**
 * Representa la entidad Torneo retornada por la API REST de NestJS.
 */
export interface Tournament {
    id: number;
    name: string;
    description?: string | null;
    startDate: string;
    endDate?: string | null;
    status: TournamentStatus;
    createdAt: string;
}

export type CreateTournamentDto = Omit<Tournament, 'id' | 'createdAt'>;

/**
 * Representa un equipo participante registrado en la plataforma.
 */
export interface Team {
    id: number;
    tournamentId?: number | null;
    name: string;
    delegateName?: string | null;
    delegatePhone?: string | null;
    createdAt: string;
}

export type CreateTeamDto = Omit<Team, 'id' | 'createdAt'>;

/**
 * Posiciones tácticas para jugadores de fútbol.
 */
export const PlayerPosition = {
    GOALKEEPER: 'GOALKEEPER',
    DEFENDER: 'DEFENDER',
    MIDFIELDER: 'MIDFIELDER',
    FORWARD: 'FORWARD',
} as const;

export type PlayerPosition = typeof PlayerPosition[keyof typeof PlayerPosition];

/**
 * Representa a un jugador alineado con el esquema de Prisma en NestJS.
 */
export interface Player {
    id: number;
    teamId: number;
    firstName: string;
    lastName: string;
    documentId?: string | null;
    defaultDorsal?: number | null;
    position?: PlayerPosition | null;
    createdAt: string;
    team?: Team;
}

export type CreatePlayerDto = Omit<Player, 'id' | 'createdAt' | 'team'>;

/**
 * Estados del ciclo de vida de un partido.
 */
export const MatchStatus = {
    SCHEDULED: 'SCHEDULED',
    IN_PROGRESS: 'IN_PROGRESS',
    FINISHED: 'FINISHED',
    POSTPONED: 'POSTPONED',
    CANCELLED: 'CANCELLED',
} as const;

export type MatchStatus = typeof MatchStatus[keyof typeof MatchStatus];

/**
 * Entidad Partido que representa un encuentro programado o jugado.
 */
export interface Match {
    id: number;
    tournamentId: number;
    homeTeamId: number;
    awayTeamId: number;
    matchDate: string;
    location?: string | null;
    fieldNumber?: string | null;
    homeScore: number;
    awayScore: number;
    homeSubsUsed?: number;
    homeWindowsUsed?: number;
    awaySubsUsed?: number;
    awayWindowsUsed?: number;
    homeArbitragePaid?: boolean;
    awayArbitragePaid?: boolean;
    status: MatchStatus;
    createdAt: string;
    // Relaciones pobladas desde la API
    tournament?: Tournament;
    homeTeam?: Team;
    awayTeam?: Team;
}

/**
 * DTO para la programación de un nuevo partido.
 */
export interface CreateMatchDto {
    tournamentId: number;
    homeTeamId: number;
    awayTeamId: number;
    matchDate: string;
    location?: string | null;
    fieldNumber?: string | null;
    status?: MatchStatus;
    homeArbitragePaid?: boolean;
    awayArbitragePaid?: boolean;
}

/**
 * DTO para la actualización de marcador, estado o estadísticas de un partido.
 */
export interface UpdateMatchDto extends Partial<CreateMatchDto> {
    homeScore?: number;
    awayScore?: number;
    homeSubsUsed?: number;
    homeWindowsUsed?: number;
    awaySubsUsed?: number;
    awayWindowsUsed?: number;
}