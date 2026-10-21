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
import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';

@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) { }

  /**
   * POST /tournaments
   * Crea un nuevo torneo.
   */
  @Post()
  create(@Body() createTournamentDto: CreateTournamentDto) {
    return this.tournamentsService.create(createTournamentDto);
  }

  /**
   * GET /tournaments
   * Obtiene todos los torneos registrados.
   */
  @Get()
  findAll() {
    return this.tournamentsService.findAll();
  }

  /**
   * GET /tournaments/:id
   * Obtiene un torneo específico por su ID.
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tournamentsService.findOne(id);
  }

  /**
   * PATCH /tournaments/:id
   * Actualiza parcialmente un torneo por su ID.
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTournamentDto: UpdateTournamentDto,
  ) {
    return this.tournamentsService.update(id, updateTournamentDto);
  }

  /**
   * DELETE /tournaments/:id
   * Elimina un torneo por su ID.
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tournamentsService.remove(id);
  }
}