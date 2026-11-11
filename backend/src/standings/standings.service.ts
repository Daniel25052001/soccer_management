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

export interface TopScorer {
    playerId: number;
    playerName: string;
    teamName: string;
    goals: number;
}

@Injectable()
export class StandingsService {
    constructor(private readonly prisma: PrismaService) { }

    async getStandings(tournamentId: number): Promise<TeamStanding[]> {
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

        const tableMap: { [key: number]: TeamStanding } = {};

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

        for (const match of finishedMatches) {
            const homeId = match.homeTeamId;
            const awayId = match.awayTeamId;
            const homeName = match.homeTeam?.name || 'Local';
            const awayName = match.awayTeam?.name || 'Visitante';

            ensureTeamInTable(homeId, homeName);
            ensureTeamInTable(awayId, awayName);

            const homeScore = match.homeScore ?? 0;
            const awayScore = match.awayScore ?? 0;

            tableMap[homeId].played += 1;
            tableMap[awayId].played += 1;

            tableMap[homeId].goalsFor += homeScore;
            tableMap[homeId].goalsAgainst += awayScore;

            tableMap[awayId].goalsFor += awayScore;
            tableMap[awayId].goalsAgainst += homeScore;

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

        Object.values(tableMap).forEach((stats) => {
            stats.goalDifference = stats.goalsFor - stats.goalsAgainst;
        });

        return Object.values(tableMap).sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            return b.goalsFor - a.goalsFor;
        });
    }

    async getBestDefense(tournamentId: number): Promise<TeamStanding | null> {
        const standings = await this.getStandings(tournamentId);
        if (standings.length === 0) return null;

        const sortedByDefense = [...standings].sort((a, b) => {
            if (a.goalsAgainst !== b.goalsAgainst) {
                return a.goalsAgainst - b.goalsAgainst;
            }
            return b.played - a.played;
        });

        return sortedByDefense[0];
    }

    async getTopScorers(tournamentId: number): Promise<TopScorer[]> {
        const parsedTournamentId = Number(tournamentId);

        const goals = await this.prisma.matchEvent.findMany({
            where: {
                type: 'GOAL',
                match: {
                    tournamentId: parsedTournamentId,
                    status: 'FINISHED',
                },
            },
            include: {
                player: true,
                team: true,
            },
        });

        const scorerMap: { [key: number]: { playerName: string; teamName: string; goals: number } } = {};

        for (const g of goals) {
            const playerId = g.playerId;
            if (!playerId) continue;

            const playerName = g.player
                ? `${g.player.firstName} ${g.player.lastName}`.trim()
                : `Jugador #${playerId}`;
            const teamName = g.team?.name || 'Sin Equipo';

            if (!scorerMap[playerId]) {
                scorerMap[playerId] = { playerName, teamName, goals: 0 };
            }
            scorerMap[playerId].goals += 1;
        }

        return Object.entries(scorerMap)
            .map(([playerId, data]) => ({
                playerId: Number(playerId),
                ...data,
            }))
            .sort((a, b) => b.goals - a.goals)
            .slice(0, 3);
    }
}