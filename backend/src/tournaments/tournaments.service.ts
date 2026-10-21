import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';

@Injectable()
export class TournamentsService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Crea un nuevo torneo en la base de datos.
   * @param createTournamentDto Datos del torneo a crear.
   */
  async create(createTournamentDto: CreateTournamentDto) {
    return this.prisma.tournament.create({
      data: {
        ...createTournamentDto,
        startDate: new Date(createTournamentDto.startDate),
        endDate: createTournamentDto.endDate ? new Date(createTournamentDto.endDate) : null,
      },
    });
  }

  /**
   * Obtiene la lista completa de torneos ordenados del más reciente al más antiguo,
   * incluyendo sus equipos y partidos asociados.
   */
  async findAll() {
    return this.prisma.tournament.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        teams: true,
        matches: true,
      },
    });
  }

  /**
   * Busca un torneo por su ID numérico.
   * @param id Identificador único del torneo.
   * @throws NotFoundException Si el torneo no existe.
   */
  async findOne(id: number) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
      include: {
        teams: true,
        matches: true,
      },
    });

    if (!tournament) {
      throw new NotFoundException(`El torneo con ID ${id} no fue encontrado.`);
    }

    return tournament;
  }

  /**
   * Actualiza la información de un torneo existente.
   * @param id Identificador único del torneo.
   * @param updateTournamentDto Campos a actualizar.
   */
  async update(id: number, updateTournamentDto: UpdateTournamentDto) {
    // Validar existencia previa antes de intentar actualizar
    await this.findOne(id);

    return this.prisma.tournament.update({
      where: { id },
      data: {
        ...updateTournamentDto,
        startDate: updateTournamentDto.startDate
          ? new Date(updateTournamentDto.startDate)
          : undefined,
        endDate: updateTournamentDto.endDate
          ? new Date(updateTournamentDto.endDate)
          : undefined,
      },
    });
  }

  /**
   * Elimina un torneo por su ID.
   * @param id Identificador único del torneo.
   */
  async remove(id: number) {
    // Validar existencia previa antes de intentar eliminar
    await this.findOne(id);

    return this.prisma.tournament.delete({
      where: { id },
    });
  }
}