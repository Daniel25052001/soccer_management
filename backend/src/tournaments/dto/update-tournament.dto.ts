import { PartialType } from '@nestjs/mapped-types';
import { CreateTournamentDto } from './create-tournament.dto';

/**
 * Data Transfer Object (DTO) para la actualización de un Torneo.
 * Extiende PartialType de CreateTournamentDto, volviendo opcionales todos los campos.
 */
export class UpdateTournamentDto extends PartialType(CreateTournamentDto) { }