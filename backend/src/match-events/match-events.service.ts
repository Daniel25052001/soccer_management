import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchEventDto } from './dto/create-match-event.dto';
import { EventType } from '@prisma/client';

@Injectable()
export class MatchEventsService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Registra un nuevo evento y actualiza el marcador si el evento es un gol.
   */
  async create(createMatchEventDto: CreateMatchEventDto) {
    const { matchId, teamId, playerId, eventType, minute } = createMatchEventDto;

    const match = await this.prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new NotFoundException(`El partido con ID ${matchId} no existe.`);

    const player = await this.prisma.player.findUnique({ where: { id: playerId } });
    if (!player) throw new NotFoundException(`El jugador con ID ${playerId} no existe.`);

    if (player.teamId !== teamId) {
      throw new BadRequestException(
        `El jugador ID ${playerId} no pertenece al equipo ID ${teamId}.`,
      );
    }

    // Persistir el evento mapeando eventType a type para Prisma
    const event = await this.prisma.matchEvent.create({
      data: {
        matchId,
        teamId,
        playerId,
        type: eventType,
        minute,
      },
      include: {
        player: true,
        team: true,
      },
    });

    // Si el evento fue un Gol, recalcular el marcador
    if (eventType === EventType.GOAL || eventType === EventType.OWN_GOAL) {
      await this.updateMatchScore(matchId);
    }

    return event;
  }

  /**
   * Obtiene la cronología completa de un partido ordenada por el minuto.
   */
  async findByMatch(matchId: number) {
    return this.prisma.matchEvent.findMany({
      where: { matchId },
      orderBy: { minute: 'asc' },
      include: {
        player: true,
        team: true,
      },
    });
  }

  /**
   * Elimina un evento y recalcula el marcador si se eliminó un gol.
   */
  async remove(id: number) {
    const event = await this.prisma.matchEvent.findUnique({ where: { id } });

    if (!event) {
      throw new NotFoundException(`El evento con ID ${id} no existe.`);
    }

    const deletedEvent = await this.prisma.matchEvent.delete({ where: { id } });

    if (
      event.type === EventType.GOAL ||
      event.type === EventType.OWN_GOAL
    ) {
      await this.updateMatchScore(event.matchId);
    }

    return deletedEvent;
  }

  /**
   * Recalcula automáticamente el marcador (homeScore / awayScore) basado en los goles registrados.
   */
  private async updateMatchScore(matchId: number): Promise<void> {
    const match = await this.prisma.match.findUnique({ where: { id: matchId } });
    if (!match) return;

    const events = await this.prisma.matchEvent.findMany({ where: { matchId } });

    let homeScore = 0;
    let awayScore = 0;

    for (const e of events) {
      if (e.type === EventType.GOAL) {
        if (e.teamId === match.homeTeamId) homeScore++;
        if (e.teamId === match.awayTeamId) awayScore++;
      } else if (e.type === EventType.OWN_GOAL) {
        // Un autogol suma un gol al rival
        if (e.teamId === match.homeTeamId) awayScore++;
        if (e.teamId === match.awayTeamId) homeScore++;
      }
    }

    await this.prisma.match.update({
      where: { id: matchId },
      data: { homeScore, awayScore },
    });
  }
}