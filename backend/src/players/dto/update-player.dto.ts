import { PartialType } from '@nestjs/mapped-types';
import { CreatePlayerDto } from './create-player.dto';

/**
 * DTO para la actualización de datos de un jugador.
 */
export class UpdatePlayerDto extends PartialType(CreatePlayerDto) { }