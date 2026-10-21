import {
    IsInt,
    IsNotEmpty,
    IsDateString,
    IsOptional,
    IsEnum,
    IsBoolean,
    Min,
} from 'class-validator';
import { MatchStatus } from '@prisma/client';

/**
 * DTO para la creación/programación de un partido de Fútbol 11.
 */
export class CreateMatchDto {
    /**
     * ID del torneo al cual pertenece el encuentro.
     * @example 1
     */
    @IsInt({ message: 'El ID del torneo debe ser un número entero.' })
    @IsNotEmpty({ message: 'El torneo es obligatorio.' })
    tournamentId: number;

    /**
     * ID del equipo que juega en condición de local.
     * @example 1
     */
    @IsInt({ message: 'El ID del equipo local debe ser un número entero.' })
    @IsNotEmpty({ message: 'El equipo local es obligatorio.' })
    homeTeamId: number;

    /**
     * ID del equipo que juega en condición de visitante.
     * @example 2
     */
    @IsInt({ message: 'El ID del equipo visitante debe ser un número entero.' })
    @IsNotEmpty({ message: 'El equipo visitante es obligatorio.' })
    awayTeamId: number;

    /**
     * Fecha y hora programada del partido en formato ISO 8601.
     * @example "2026-11-15T15:00:00.000Z"
     */
    @IsDateString({}, { message: 'La fecha del partido debe ser un ISO String válido.' })
    @IsNotEmpty({ message: 'La fecha del partido es obligatoria.' })
    matchDate: string;

    /**
     * Estado inicial del juego (por defecto SCHEDULED).
     */
    @IsEnum(MatchStatus, { message: 'El estado del partido no es válido.' })
    @IsOptional()
    status?: MatchStatus;

    /**
     * Marcador del equipo local.
     * @example 0
     */
    @IsInt({ message: 'El marcador debe ser un entero.' })
    @Min(0)
    @IsOptional()
    homeScore?: number;

    /**
     * Marcador del equipo visitante.
     * @example 0
     */
    @IsInt({ message: 'El marcador debe ser un entero.' })
    @Min(0)
    @IsOptional()
    awayScore?: number;

    /**
     * Indica si el equipo local pagó su tasa de arbitraje.
     */
    @IsBoolean()
    @IsOptional()
    homeArbitragePaid?: boolean;

    /**
     * Indica si el equipo visitante pagó su tasa de arbitraje.
     */
    @IsBoolean()
    @IsOptional()
    awayArbitragePaid?: boolean;
}