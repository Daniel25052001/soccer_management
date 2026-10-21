import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Programa un partido de fútbol validando torneo, equipos y conflicto de rivales.
   */
  async create(createMatchDto: CreateMatchDto) {
    if (createMatchDto.homeTeamId === createMatchDto.awayTeamId) {
      throw new BadRequestException(
        'El equipo local y el equipo visitante no pueden ser el mismo.',
      );
    }

    await this.verifyTournamentExists(createMatchDto.tournamentId);
    await this.verifyTeamExists(createMatchDto.homeTeamId, 'local');
    await this.verifyTeamExists(createMatchDto.awayTeamId, 'visitante');

    return this.prisma.match.create({
      data: {
        ...createMatchDto,
        matchDate: new Date(createMatchDto.matchDate),
      },
      include: {
        tournament: true,
        homeTeam: true,
        awayTeam: true,
      },
    });
  }

  /**
   * Obtiene todos los partidos ordenados por fecha.
   */
  async findAll() {
    return this.prisma.match.findMany({
      orderBy: { matchDate: 'asc' },
      include: {
        tournament: true,
        homeTeam: true,
        awayTeam: true,
      },
    });
  }

  /**
   * Obtiene el fixture completo de un torneo específico.
   */
  async findByTournament(tournamentId: number) {
    await this.verifyTournamentExists(tournamentId);

    return this.prisma.match.findMany({
      where: { tournamentId },
      orderBy: { matchDate: 'asc' },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });
  }

  /**
   * Obtiene el detalle de un partido por su ID numérico.
   */
  async findOne(id: number) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: {
        tournament: true,
        homeTeam: true,
        awayTeam: true,
        rosters: { include: { player: true } },
        events: { include: { player: true } },
        substitutions: true,
        sanctions: true,
      },
    });

    if (!match) {
      throw new NotFoundException(`El partido con ID ${id} no fue encontrado.`);
    }

    return match;
  }

  /**
   * Actualiza el partido (marcador, estado, arbitrajes, etc.).
   */
  async update(id: number, updateMatchDto: UpdateMatchDto) {
    await this.findOne(id);

    if (
      updateMatchDto.homeTeamId &&
      updateMatchDto.awayTeamId &&
      updateMatchDto.homeTeamId === updateMatchDto.awayTeamId
    ) {
      throw new BadRequestException(
        'El equipo local y el equipo visitante no pueden ser el mismo.',
      );
    }

    return this.prisma.match.update({
      where: { id },
      data: {
        ...updateMatchDto,
        matchDate: updateMatchDto.matchDate
          ? new Date(updateMatchDto.matchDate)
          : undefined,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });
  }

  /**
   * Elimina un partido programado por su ID.
   */
  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.match.delete({
      where: { id },
    });
  }

  /**
   * Auxiliar: Verifica que el torneo exista.
   */
  private async verifyTournamentExists(tournamentId: number): Promise<void> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      throw new NotFoundException(`El torneo con ID ${tournamentId} no existe.`);
    }
  }

  /**
   * Auxiliar: Verifica que un equipo exista.
   */
  private async verifyTeamExists(
    teamId: number,
    role: string,
  ): Promise<void> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException(
        `El equipo ${role} con ID ${teamId} no existe.`,
      );
    }
  }
}