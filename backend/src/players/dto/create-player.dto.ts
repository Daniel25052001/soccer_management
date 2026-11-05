import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsInt,
    Min,
    Max,
    IsEnum,
} from 'class-validator';
import { PlayerPosition } from '@prisma/client';

export class CreatePlayerDto {
    @IsInt({ message: 'El ID del equipo debe ser un número entero.' })
    @IsNotEmpty({ message: 'El equipo asignado es obligatorio.' })
    teamId: number;

    @IsString({ message: 'El nombre debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El nombre del jugador es obligatorio.' })
    firstName: string;

    @IsString({ message: 'El apellido debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El apellido del jugador es obligatorio.' })
    lastName: string;

    @IsString({ message: 'El documento debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El documento de identidad es obligatorio.' })
    documentId: string;

    @IsInt({ message: 'El dorsal debe ser un número entero.' })
    @Min(1, { message: 'El dorsal mínimo permitido es 1.' })
    @Max(99, { message: 'El dorsal máximo permitido es 99.' })
    @IsOptional()
    defaultDorsal?: number;

    @IsEnum(PlayerPosition, { message: 'La posición ingresada no es válida.' })
    @IsOptional()
    position?: PlayerPosition;
}