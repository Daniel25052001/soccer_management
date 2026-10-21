import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Registra un nuevo equipo verificando la existencia del torneo si se asigna uno.
   */
  async create(createTeamDto: CreateTeamDto) {
    if (createTeamDto.tournamentId) {
      await this.verifyTournamentExists(createTeamDto.tournamentId);
    }

    return this.prisma.team.create({
      data: createTeamDto,
      include: {
        tournament: true,
      },
    });
  }

  /**
   * Retorna la lista completa de equipos con sus relaciones.
   */
  async findAll() {
    return this.prisma.team.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        tournament: true,
        players: true,
      },
    });
  }

  /**
   * Obtiene un equipo por su ID.
   */
  async findOne(id: number) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        tournament: true,
        players: true,
      },
    });

    if (!team) {
      throw new NotFoundException(`El equipo con ID ${id} no existe.`);
    }

    return team;
  }

  /**
   * Actualiza la información de un equipo.
   */
  async update(id: number, updateTeamDto: UpdateTeamDto) {
    // Verificar que el equipo exista previamente
    await this.findOne(id);

    // Si se está intentando cambiar de torneo, verificar que el nuevo torneo exista
    if (updateTeamDto.tournamentId) {
      await this.verifyTournamentExists(updateTeamDto.tournamentId);
    }

    return this.prisma.team.update({
      where: { id },
      data: updateTeamDto,
      include: {
        tournament: true,
      },
    });
  }

  /**
   * Elimina un equipo por su ID.
   */
  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.team.delete({
      where: { id },
    });
  }

  /**
   * Método auxiliar privado para validar la existencia de un torneo.
   */
  private async verifyTournamentExists(tournamentId: number): Promise<void> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      throw new NotFoundException(
        `El torneo asignado con ID ${tournamentId} no existe.`,
      );
    }
  }
}