import { PartialType } from '@nestjs/mapped-types';
import { CreateMatchRosterDto } from './create-match-roster.dto';

export class UpdateMatchRosterDto extends PartialType(CreateMatchRosterDto) { }