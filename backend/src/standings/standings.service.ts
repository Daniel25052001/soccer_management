import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface TeamStanding {
    teamId: number;
    teamName: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
}

@Injectable()
export class StandingsService {
    constructor(private readonly prisma: PrismaService) { }

    async getStandings(tournamentId: number): Promise<TeamStanding[]> {
        // 1. Obtener todos los partidos finalizados del torneo con sus respectivos equipos
        const finishedMatches = await this.prisma.match.findMany({
            where: {
                tournamentId: Number(tournamentId),
                status: 'FINISHED',
            },
            include: {
                homeTeam: true,
                awayTeam: true,
            },
        });

        // Objeto acumulador para almacenar las estadísticas por ID de equipo
        const tableMap: { [key: number]: TeamStanding } = {};

        // Función auxiliar para inicializar un equipo en la tabla si no existe
        const ensureTeamInTable = (teamId: number, teamName: string) => {
            if (!tableMap[teamId]) {
                tableMap[teamId] = {
                    teamId,
                    teamName,
                    played: 0,
                    won: 0,
                    drawn: 0,
                    lost: 0,
                    goalsFor: 0,
                    goalsAgainst: 0,
                    goalDifference: 0,
                    points: 0,
                };
            }
        };

        // 2. Procesar cada partido finalizado
        for (const match of finishedMatches) {
            const homeId = match.homeTeamId;
            const awayId = match.awayTeamId;
            const homeName = match.homeTeam?.name || 'Local';
            const awayName = match.awayTeam?.name || 'Visitante';

            ensureTeamInTable(homeId, homeName);
            ensureTeamInTable(awayId, awayName);

            const homeScore = match.homeScore ?? 0;
            const awayScore = match.awayScore ?? 0;

            // Actualizar partidos jugados
            tableMap[homeId].played += 1;
            tableMap[awayId].played += 1;

            // Actualizar goles
            tableMap[homeId].goalsFor += homeScore;
            tableMap[homeId].goalsAgainst += awayScore;

            tableMap[awayId].goalsFor += awayScore;
            tableMap[awayId].goalsAgainst += homeScore;

            // Definir ganador, perdedor o empate y asignar puntos
            if (homeScore > awayScore) {
                tableMap[homeId].won += 1;
                tableMap[homeId].points += 3;
                tableMap[awayId].lost += 1;
            } else if (homeScore < awayScore) {
                tableMap[awayId].won += 1;
                tableMap[awayId].points += 3;
                tableMap[homeId].lost += 1;
            } else {
                tableMap[homeId].drawn += 1;
                tableMap[homeId].points += 1;
                tableMap[awayId].drawn += 1;
                tableMap[awayId].points += 1;
            }
        }

        // 3. Calcular la diferencia de goles
        Object.values(tableMap).forEach((stats) => {
            stats.goalDifference = stats.goalsFor - stats.goalsAgainst;
        });

        // 4. Ordenar la tabla: Puntos -> Diferencia de Goles -> Goles a Favor
        const standings = Object.values(tableMap).sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            return b.goalsFor - a.goalsFor;
        });

        return standings;
    }
}