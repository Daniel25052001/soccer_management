import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

/**
 * DTO para la creación de un nuevo equipo en el sistema.
 */
export class CreateTeamDto {
    /**
     * Nombre oficial del equipo.
     * @example "Deportivo La 80"
     */
    @IsString({ message: 'El nombre debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El nombre del equipo es obligatorio.' })
    name: string;

    /**
     * Nombre completo del delegado o representante legal del equipo (opcional).
     * @example "Juan Fernando Quintero"
     */
    @IsString({ message: 'El nombre del delegado debe ser texto.' })
    @IsOptional()
    delegateName?: string;

    /**
     * Número telefónico o celular de contacto del delegado (opcional).
     * @example "+57 311 987 6543"
     */
    @IsString({ message: 'El teléfono del delegado debe ser texto.' })
    @IsOptional()
    delegatePhone?: string;

    /**
     * ID del torneo al cual se inscribe el equipo (opcional).
     * @example 1
     */
    @IsInt({ message: 'El ID del torneo debe ser un número entero.' })
    @IsOptional()
    tournamentId?: number;
}