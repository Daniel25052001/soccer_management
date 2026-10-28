import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';

/**
 * DTO para el registro de un nuevo jugador en la plataforma.
 */
export class CreatePlayerDto {
    /**
     * ID del equipo al que pertenecerá el jugador.
     * @example 1
     */
    @IsInt({ message: 'El ID del equipo debe ser un número entero.' })
    @IsNotEmpty({ message: 'El equipo asignado es obligatorio.' })
    teamId: number;

    /**
     * Nombres del jugador.
     * @example "Mateo"
     */
    @IsString({ message: 'El nombre debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El nombre del jugador es obligatorio.' })
    firstName: string;

    /**
     * Apellidos del jugador.
     * @example "Uribe"
     */
    @IsString({ message: 'El apellido debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El apellido del jugador es obligatorio.' })
    lastName: string;

    /**
     * Documento de identidad (Cédula/Tarjeta de Identidad/Pasaporte). Debe ser único en el sistema.
     * @example "1020304050"
     */
    @IsString({ message: 'El documento debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El documento de identidad es obligatorio.' })
    documentId: string;

    /**
     * Posición en el campo (ej: Portero, Defensa, Mediocampista, Delantero).
     * @example "Defensa"
     */
    @IsString({ message: 'La posición debe ser una cadena de texto.' })
    @IsOptional()
    position?: string;

    /**
     * Número de dorsal/camiseta habitual del jugador (1-99).
     * @example 8
     */
    @IsInt({ message: 'El dorsal debe ser un número entero.' })
    @Min(1, { message: 'El dorsal mínimo permitido es 1.' })
    @Max(99, { message: 'El dorsal máximo permitido es 99.' })
    @IsOptional()
    defaultDorsal?: number;
}