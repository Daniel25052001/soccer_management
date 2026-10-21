import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { SanctionsService } from './sanctions.service';
import { CreateSanctionDto } from './dto/create-sanction.dto';
import { UpdateSanctionDto } from './dto/update-sanction.dto';

@Controller('sanctions')
export class SanctionsController {
  constructor(private readonly sanctionsService: SanctionsService) { }

  @Post()
  create(@Body() createSanctionDto: CreateSanctionDto) {
    return this.sanctionsService.create(createSanctionDto);
  }

  @Get()
  findAll() {
    return this.sanctionsService.findAll();
  }

  @Get('player/:playerId')
  findByPlayer(@Param('playerId', ParseIntPipe) playerId: number) {
    return this.sanctionsService.findByPlayer(playerId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sanctionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSanctionDto: UpdateSanctionDto,
  ) {
    return this.sanctionsService.update(id, updateSanctionDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sanctionsService.remove(id);
  }
}