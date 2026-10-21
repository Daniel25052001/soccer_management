import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { TournamentStatus } from '@prisma/client';

/**
 * Data Transfer Object (DTO) para la creación de un Torneo.
 */
export class CreateTournamentDto {
    /**
     * Nombre oficial del torneo.
     * @example "Torneo Municipal de Fútbol 11 - 2026"
     */
    @IsString()
    @IsNotEmpty({ message: 'El nombre del torneo es obligatorio.' })
    name: string;

    /**
     * Descripción o detalles adicionales del torneo (opcional).
     * @example "Categoría Libre Masculina"
     */
    @IsString()
    @IsOptional()
    description?: string;

    /**
     * Fecha de inicio en formato ISO 8601.
     * @example "2026-11-01T00:00:00.000Z"
     */
    @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha ISO válida.' })
    @IsNotEmpty({ message: 'La fecha de inicio es obligatoria.' })
    startDate: string;

    /**
     * Fecha de finalización tentativa en formato ISO 8601 (opcional).
     * @example "2026-12-20T00:00:00.000Z"
     */
    @IsDateString({}, { message: 'La fecha de fin debe ser una fecha ISO válida.' })
    @IsOptional()
    endDate?: string;

    /**
     * Estado actual del torneo (DRAFT, IN_PROGRESS, FINISHED, CANCELLED).
     * Por defecto toma el valor DRAFT en la base de datos si se omite.
     */
    @IsEnum(TournamentStatus, { message: 'El estado debe ser un valor válido de TournamentStatus.' })
    @IsOptional()
    status?: TournamentStatus;
}