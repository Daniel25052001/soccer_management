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
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

/**
 * Controlador principal para la gestión de partidos (Matches) del torneo.
 * Maneja la programación, consulta, actualización de marcadores, asignación de árbitros y eliminación.
 */
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) { }

  /**
   * Registra un nuevo partido en la programación del torneo.
   * @route POST /matches
   */
  @Post()
  create(@Body() createMatchDto: CreateMatchDto) {
    return this.matchesService.create(createMatchDto);
  }

  /**
   * Obtiene la lista global de todos los partidos registrados.
   * @route GET /matches
   */
  @Get()
  findAll() {
    return this.matchesService.findAll();
  }

  /**
   * Obtiene todos los partidos pertenecientes a un torneo específico.
   * @route GET /matches/tournament/:tournamentId
   * @param tournamentId ID numérico del torneo
   */
  @Get('tournament/:tournamentId')
  findByTournament(@Param('tournamentId', ParseIntPipe) tournamentId: number) {
    return this.matchesService.findByTournament(tournamentId);
  }

  /**
   * Consulta los detalles de un partido específico por su ID.
   * @route GET /matches/:id
   * @param id ID numérico del partido
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.matchesService.findOne(id);
  }

  /**
   * Actualiza la información general de un partido (fechas, marcadores, estado, etc.).
   * @route PATCH /matches/:id
   * @param id ID numérico del partido
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMatchDto: UpdateMatchDto,
  ) {
    return this.matchesService.update(id, updateMatchDto);
  }

  /**
   * Asigna o desasigna un árbitro / juez principal a un partido.
   * @route PATCH /matches/:id/assign-referee
   * @param id ID numérico del partido
   * @param body Objeto con el `refereeId` (number para asignar, null para remover)
   */
  @Patch(':id/assign-referee')
  assignReferee(
    @Param('id', ParseIntPipe) id: number,
    @Body('refereeId') refereeId: number | null,
  ) {
    return this.matchesService.assignReferee(id, refereeId);
  }

  /**
   * Elimina un partido del sistema.
   * @route DELETE /matches/:id
   * @param id ID numérico del partido
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.matchesService.remove(id);
  }
}