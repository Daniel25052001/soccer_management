import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TournamentStandingsService {
  private readonly logger = new Logger(TournamentStandingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene la tabla de posiciones de un torneo específico,
   * asegurando un recálculo previo para mantener la consistencia de los datos.
   * 
   * @param tournamentId ID del torneo
   * @returns Lista de posiciones ordenada por Pts, DG y GF
   */
  async getStandingsByTournament(tournamentId: number) {
    try {
      // Recalcula antes de entregar la información para asegurar consistencia en tiempo real
      await this.calculateStandings(tournamentId);

      return await this.prisma.standing.findMany({
        where: { tournamentId },
        include: {
          team: {
            select: {
              id: true,
              name: true,
              delegateName: true,
            },
          },
        },
        orderBy: [
          { points: 'desc' },
          { goalDifference: 'desc' },
          { goalsFor: 'desc' },
        ],
      });
    } catch (error) {
      this.logger.error(`Error al obtener la tabla de posiciones para el torneo ${tournamentId}`, error);
      throw error;
    }
  }

  /**
   * Procesa los partidos finalizados de un torneo y actualiza (upsert)
   * las estadísticas de cada equipo participante.
   * 
   * @param tournamentId ID del torneo a recalcular
   */
  async calculateStandings(tournamentId: number): Promise<void> {
    // 1. Obtener todos los equipos inscritos en el torneo
    const teams = await this.prisma.team.findMany({
      where: { tournamentId },
    });

    if (!teams.length) return;

    // 2. Obtener únicamente los partidos que ya han finalizado
    const finishedMatches = await this.prisma.match.findMany({
      where: {
        tournamentId,
        status: 'FINISHED',
      },
    });

    // 3. Inicializar un mapa de estadísticas temporales en memoria por cada equipo
    const statsMap = new Map<number, {
      played: number;
      won: number;
      drawn: number;
      lost: number;
      goalsFor: number;
      goalsAgainst: number;
      points: number;
    }>();

    teams.forEach((team) => {
      statsMap.set(team.id, {
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      });
    });

    // 4. Acumular estadísticas iterando sobre los partidos finalizados
    for (const match of finishedMatches) {
      const homeStats = statsMap.get(match.homeTeamId);
      const awayStats = statsMap.get(match.awayTeamId);

      if (!homeStats || !awayStats) continue;

      const homeGoals = match.homeScore ?? 0;
      const awayGoals = match.awayScore ?? 0;

      // Partidos jugados
      homeStats.played += 1;
      awayStats.played += 1;

      // Goles a favor y en contra
      homeStats.goalsFor += homeGoals;
      homeStats.goalsAgainst += awayGoals;
      awayStats.goalsFor += awayGoals;
      awayStats.goalsAgainst += homeGoals;

      // Definición de puntos (3 por victoria, 1 por empate, 0 por derrota)
      if (homeGoals > awayGoals) {
        homeStats.won += 1;
        homeStats.points += 3;
        awayStats.lost += 1;
      } else if (homeGoals < awayGoals) {
        awayStats.won += 1;
        awayStats.points += 3;
        homeStats.lost += 1;
      } else {
        homeStats.drawn += 1;
        homeStats.points += 1;
        awayStats.drawn += 1;
        awayStats.points += 1;
      }
    }

    // 5. Persistir o actualizar los resultados calculados en la base de datos de manera transaccional
    for (const [teamId, stats] of statsMap.entries()) {
      const goalDifference = stats.goalsFor - stats.goalsAgainst;

      await this.prisma.standing.upsert({
        where: {
          tournamentId_teamId: {
            tournamentId,
            teamId,
          },
        },
        update: {
          played: stats.played,
          won: stats.won,
          drawn: stats.drawn,
          lost: stats.lost,
          goalsFor: stats.goalsFor,
          goalsAgainst: stats.goalsAgainst,
          goalDifference,
          points: stats.points,
        },
        create: {
          tournamentId,
          teamId,
          played: stats.played,
          won: stats.won,
          drawn: stats.drawn,
          lost: stats.lost,
          goalsFor: stats.goalsFor,
          goalsAgainst: stats.goalsAgainst,
          goalDifference,
          points: stats.points,
        },
      });
    }
  }
}