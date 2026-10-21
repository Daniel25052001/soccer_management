import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchRosterDto } from './dto/create-match-roster.dto';
import { BulkMatchRosterDto } from './dto/bulk-match-roster.dto';

@Injectable()
export class MatchRostersService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Inscribe un jugador en la planilla de un partido.
   */
  async create(createMatchRosterDto: CreateMatchRosterDto) {
    const { matchId, teamId, playerId } = createMatchRosterDto;

    await this.verifyMatchExists(matchId);
    await this.verifyTeamExists(teamId);
    await this.verifyPlayerBelongsToTeam(playerId, teamId);

    // Verificar si el jugador ya está inscrito en este partido
    const existingRoster = await this.prisma.matchRoster.findUnique({
      where: {
        matchId_playerId: { matchId, playerId },
      },
    });

    if (existingRoster) {
      throw new ConflictException(
        'El jugador ya se encuentra registrado en la planilla de este partido.',
      );
    }

    return this.prisma.matchRoster.create({
      data: createMatchRosterDto,
      include: {
        player: true,
        team: true,
      },
    });
  }

  /**
   * Carga masiva de planilla para agilizar el proceso pre-partido.
   */
  async createBulk(bulkDto: BulkMatchRosterDto) {
    const results = [];
    for (const item of bulkDto.rosters) {
      const roster = await this.create(item);
      results.push(roster);
    }
    return results;
  }

  /**
   * Consulta la planilla completa de un partido dividida en titulares y suplentes.
   */
  async findByMatch(matchId: number) {
    await this.verifyMatchExists(matchId);

    return this.prisma.matchRoster.findMany({
      where: { matchId },
      orderBy: [{ teamId: 'asc' }, { isStarter: 'desc' }, { jerseyNumber: 'asc' }],
      include: {
        player: true,
        team: true,
      },
    });
  }

  /**
   * Elimina un registro de la planilla.
   */
  async remove(id: number) {
    const roster = await this.prisma.matchRoster.findUnique({
      where: { id },
    });

    if (!roster) {
      throw new NotFoundException(`El registro de planilla con ID ${id} no existe.`);
    }

    return this.prisma.matchRoster.delete({
      where: { id },
    });
  }

  // Métodos auxiliares de validación
  private async verifyMatchExists(matchId: number): Promise<void> {
    const match = await this.prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new NotFoundException(`El partido con ID ${matchId} no existe.`);
  }

  private async verifyTeamExists(teamId: number): Promise<void> {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException(`El equipo con ID ${teamId} no existe.`);
  }

  private async verifyPlayerBelongsToTeam(
    playerId: number,
    teamId: number,
  ): Promise<void> {
    const player = await this.prisma.player.findUnique({ where: { id: playerId } });

    if (!player) {
      throw new NotFoundException(`El jugador con ID ${playerId} no existe.`);
    }

    if (player.teamId !== teamId) {
      throw new BadRequestException(
        `El jugador ID ${playerId} no pertenece al equipo ID ${teamId}.`,
      );
    }
  }
}