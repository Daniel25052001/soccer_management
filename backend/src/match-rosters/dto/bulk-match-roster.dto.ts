import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateMatchRosterDto } from './create-match-roster.dto';

/**
 * DTO para cargar masivamente los jugadores de una planilla.
 */
export class BulkMatchRosterDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateMatchRosterDto)
    rosters: CreateMatchRosterDto[];
}