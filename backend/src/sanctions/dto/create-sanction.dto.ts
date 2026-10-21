import {
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsBoolean,
    IsOptional,
    Min,
} from 'class-validator';

/**
 * DTO para la creación de una sanción disciplinaria o económica.
 */
export class CreateSanctionDto {
    /**
     * ID del jugador sancionado.
     * @example 1
     */
    @IsInt({ message: 'El ID del jugador debe ser un entero.' })
    @IsNotEmpty({ message: 'El jugador es obligatorio.' })
    playerId: number;

    /**
     * ID del partido en el que ocurrió la infracción.
     * @example 1
     */
    @IsInt({ message: 'El ID del partido debe ser un entero.' })
    @IsNotEmpty({ message: 'El partido es obligatorio.' })
    matchId: number;

    /**
     * Valor en dinero de la multa impuesta.
     * @example 25000.00
     */
    @IsNumber({}, { message: 'El monto de la multa debe ser un valor numérico.' })
    @Min(0)
    @IsOptional()
    fineAmount?: number;

    /**
     * Estado del pago de la multa.
     * @default false
     */
    @IsBoolean()
    @IsOptional()
    isFinePaid?: boolean;

    /**
     * Número de fechas/partidos de suspensión otorgados.
     * @example 1
     */
    @IsInt({ message: 'Los partidos de suspensión deben ser un entero.' })
    @Min(0)
    @IsOptional()
    matchesSuspended?: number;

    /**
     * Número de fechas que el jugador ya ha cumplido sin jugar.
     * @default 0
     */
    @IsInt()
    @Min(0)
    @IsOptional()
    matchesServed?: number;
}