import { PartialType } from '@nestjs/mapped-types';
import { CreateTeamDto } from './create-team.dto';

/**
 * DTO para la actualización parcial de un equipo.
 * Convierte todos los campos de CreateTeamDto en opcionales.
 */
export class UpdateTeamDto extends PartialType(CreateTeamDto) { }