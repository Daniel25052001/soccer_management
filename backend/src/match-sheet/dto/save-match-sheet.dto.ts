
import {
    IsArray,
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Representa la fila de un jugador en la Planilla de Juego.
 * Permite registrar participación (quién jugó), titularidad, dorsal y estadísticas.
 */
export class PlayerSheetItemDto {
    @IsInt()
    playerId: number;

    @IsInt()
    teamId: number;

    @IsInt()
    @Min(0)
    jerseyNumber: number;

    @IsBoolean()
    played: boolean;

    @IsBoolean()
    isStarter: boolean;

    @IsInt()
    @Min(0)
    goals: number;

    @IsInt()
    @Min(0)
    yellowCards: number;

    @IsInt()
    @Min(0)
    redCards: number;
}

/**
 * Payload principal para guardar o actualizar la Planilla de Juego completa.
 */
export class SaveMatchSheetDto {
    @IsOptional()
    @IsString()
    venue?: string;

    @IsOptional()
    @IsString()
    phase?: string;

    @IsOptional()
    @IsString()
    sheetNumber?: string;

    @IsOptional()
    @IsInt()
    refereeId?: number | null;

    @IsOptional()
    @IsString()
    status?: string; // 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED'

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PlayerSheetItemDto)
    players: PlayerSheetItemDto[];
}
