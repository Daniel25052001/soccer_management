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
    logoUrl?: string | null;
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
    FULLBACK: 'FULLBACK',
    MIDFIELDER: 'MIDFIELDER',
    FORWARD: 'FORWARD',
} as const;

export type PlayerPosition = typeof PlayerPosition[keyof typeof PlayerPosition];

/**
 * Tipos de eventos posibles que pueden ocurrir durante un partido (goles, tarjetas, etc.).
 */
export const EventType = {
    GOAL: 'GOAL',
    OWN_GOAL: 'OWN_GOAL',
    YELLOW_CARD: 'YELLOW_CARD',
    RED_CARD: 'RED_CARD',
    DOUBLE_YELLOW_RED: 'DOUBLE_YELLOW_RED',
    ASSIST: 'ASSIST',
} as const;

export type EventType = typeof EventType[keyof typeof EventType];

/**
 * Representa un evento registrado en el acta de un partido (goles, tarjetas, etc.) asociado a un jugador.
 */
export interface MatchEvent {
    id: number;
    matchId: number;
    teamId: number;
    playerId: number;
    type: EventType;
    minute?: number | null;
    createdAt: string;
}

/**
 * Representa una sanción disciplinaria aplicada a un jugador.
 */
export interface Sanction {
    id: number;
    playerId: number;
    matchId?: number | null;
    reason: string;
    status: 'PENDING' | 'ACTIVE' | 'SERVED' | 'CANCELLED';
    createdAt: string;
}

/**
 * Representa a un jugador alineado con el esquema de Prisma en NestJS,
 * incluyendo propiedades de control de pago, habilitación y eventos.
 */
export interface Player {
    id: number;
    teamId: number;
    firstName: string;
    lastName: string;
    documentId?: string | null;
    defaultDorsal?: number | null;
    position?: string | null; // <-- Cámbialo de PlayerPosition a string
    isPaid: boolean;                    // Estado de pago de inscripción
    createdAt: string;
    team?: Team;
    events?: MatchEvent[];              // Para conteo de goles y tarjetas
    sanctions?: Sanction[];             // Para validación de sanciones activas
    // Propiedades calculadas dinámicamente en backend o frontend
    canPlay?: boolean;
    suspensionReason?: string | null;
    yellowCards?: number;
    redCards?: number;
}

export type CreatePlayerDto = Omit<Player, 'id' | 'createdAt' | 'team' | 'events' | 'sanctions' | 'canPlay' | 'suspensionReason' | 'yellowCards' | 'redCards'>;

export type UpdatePlayerDto = Partial<CreatePlayerDto>;

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
    refereeId?: number | null; // <-- Agrega esta línea
    referee?: Referee | null;   // <-- Agrega esta línea
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
    status?: MatchStatus;
}


/**
 * Entidad Árbitro (Referee).
 */
export interface Referee {
    id: number;
    name: string;
    phone?: string | null;
    email?: string | null;
    status: string;
    createdAt: string;
}
