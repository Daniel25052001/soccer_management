import { PartialType } from '@nestjs/mapped-types';
import { CreateSanctionDto } from './create-sanction.dto';

export class UpdateSanctionDto extends PartialType(CreateSanctionDto) { }