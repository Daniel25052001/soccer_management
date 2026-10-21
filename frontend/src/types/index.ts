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
 * Se incluyen tipos de unión con 'null' para compatibilidad estricta con Prisma ORM.
 */
export interface Tournament {
    /** Identificador único autonumérico del torneo */
    id: number;
    /** Nombre oficial del torneo */
    name: string;
    /** Descripción opcional o detalles organizativos */
    description?: string | null;
    /** Fecha estimada o real de inicio (ISO String) */
    startDate: string;
    /** Fecha estimada de finalización (ISO String) */
    endDate?: string | null;
    /** Estado del torneo dentro de la competencia */
    status: TournamentStatus;
    /** Marca de tiempo de creación en la base de datos */
    createdAt: string;
}

/**
 * Representa la estructura de datos requerida para crear o actualizar un torneo.
 */
export type CreateTournamentDto = Omit<Tournament, 'id' | 'createdAt'>;

/**
 * Representa un equipo participante registrado en la plataforma.
 */
export interface Team {
    /** Identificador único autonumérico del equipo */
    id: number;
    /** ID opcional del torneo al cual se inscribe */
    tournamentId?: number | null;
    /** Nombre representativo del club o equipo */
    name: string;
    /** Nombre del delegado o representante principal */
    delegateName?: string | null;
    /** Teléfono de contacto del delegado */
    delegatePhone?: string | null;
    /** Fecha de registro en el sistema */
    createdAt: string;
}