import { PartialType } from '@nestjs/mapped-types';
import { CreateMatchDto } from './create-match.dto';

/**
 * DTO para actualizar el marcador, estado o métricas de un partido.
 */
export class UpdateMatchDto extends PartialType(CreateMatchDto) { }