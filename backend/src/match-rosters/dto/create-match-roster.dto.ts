import { IsInt, IsNotEmpty, IsBoolean, IsOptional, Min, Max } from 'class-validator';

/**
 * DTO para inscribir a un jugador individual en la planilla de un partido.
 */
export class CreateMatchRosterDto {
    /**
     * ID del partido.
     * @example 1
     */
    @IsInt({ message: 'El ID del partido debe ser un número entero.' })
    @IsNotEmpty({ message: 'El ID del partido es obligatorio.' })
    matchId: number;

    /**
     * ID del equipo al que pertenece el jugador en este encuentro.
     * @example 1
     */
    @IsInt({ message: 'El ID del equipo debe ser un número entero.' })
    @IsNotEmpty({ message: 'El ID del equipo es obligatorio.' })
    teamId: number;

    /**
     * ID del jugador a inscribir.
     * @example 1
     */
    @IsInt({ message: 'El ID del jugador debe ser un número entero.' })
    @IsNotEmpty({ message: 'El ID del jugador es obligatorio.' })
    playerId: number;

    /**
     * Número de dorsal asignado para este partido.
     * @example 8
     */
    @IsInt({ message: 'El número de camiseta debe ser un entero.' })
    @Min(1)
    @Max(99)
    @IsNotEmpty({ message: 'El número de camiseta es obligatorio.' })
    jerseyNumber: number;

    /**
     * Define si arranca en el 11 titular.
     * @default false
     */
    @IsBoolean()
    @IsOptional()
    isStarter?: boolean;

    /**
     * Indica si el jugador está inhabilitado por sanción.
     * @default false
     */
    @IsBoolean()
    @IsOptional()
    isSuspended?: boolean;
}