import { IsInt, IsNotEmpty, IsEnum, Min, Max } from 'class-validator';
import { EventType } from '@prisma/client';

/**
 * DTO para registrar un evento cronológico dentro de un partido.
 */
export class CreateMatchEventDto {
    /**
     * ID del partido.
     * @example 1
     */
    @IsInt({ message: 'El ID del partido debe ser un entero.' })
    @IsNotEmpty({ message: 'El partido es obligatorio.' })
    matchId: number;

    /**
     * ID del equipo que genera o se ve afectado por el evento.
     * @example 1
     */
    @IsInt({ message: 'El ID del equipo debe ser un entero.' })
    @IsNotEmpty({ message: 'El equipo es obligatorio.' })
    teamId: number;

    /**
     * ID del jugador involucrado.
     * @example 1
     */
    @IsInt({ message: 'El ID del jugador debe ser un entero.' })
    @IsNotEmpty({ message: 'El jugador es obligatorio.' })
    playerId: number;

    /**
     * Tipo de incidencia (GOAL, YELLOW_CARD, RED_CARD, ASSIST, etc.).
     */
    @IsEnum(EventType, { message: 'El tipo de evento no es válido.' })
    @IsNotEmpty({ message: 'El tipo de evento es obligatorio.' })
    eventType: EventType;

    /**
     * Minuto en el que ocurrió el evento (1 - 130).
     * @example 23
     */
    @IsInt({ message: 'El minuto debe ser un número entero.' })
    @Min(1, { message: 'El minuto mínimo es 1.' })
    @Max(130, { message: 'El minuto máximo es 130.' })
    @IsNotEmpty({ message: 'El minuto es obligatorio.' })
    minute: number;
}