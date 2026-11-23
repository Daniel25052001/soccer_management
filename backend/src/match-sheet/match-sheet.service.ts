
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveMatchSheetDto } from './dto/save-match-sheet.dto';

@Injectable()
export class MatchSheetService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Obtiene los datos de cabecera del partido y las plantillas de local y visitante
     * listas para diligenciar en la Planilla de Juego.
     */
    async getMatchSheet(matchId: number) {
        const match = await this.prisma.match.findUnique({
            where: { id: matchId },
            include: {
                tournament: { select: { id: true, name: true } },
                referee: true,
                homeTeam: {
                    include: {
                        players: {
                            orderBy: [{ defaultDorsal: 'asc' }, { lastName: 'asc' }],
                        },
                    },
                },
                awayTeam: {
                    include: {
                        players: {
                            orderBy: [{ defaultDorsal: 'asc' }, { lastName: 'asc' }],
                        },
                    },
                },
                rosters: true,
                events: true,
            },
        });

        if (!match) {
            throw new NotFoundException(`El partido con ID ${matchId} no existe.`);
        }

        // Cruza los jugadores registrados del equipo con su participación y eventos en el partido
        const mapTeamPlayers = (team: typeof match.homeTeam) =>
            team.players.map((player) => {
                const roster = match.rosters.find((r) => r.playerId === player.id);
                const playerEvents = match.events.filter((e) => e.playerId === player.id);

                const goals = playerEvents.filter((e) => e.type === 'GOAL').length;
                const yellowCards = playerEvents.filter((e) => e.type === 'YELLOW_CARD').length;
                const redCards = playerEvents.filter(
                    (e) => e.type === 'RED_CARD' || e.type === 'DOUBLE_YELLOW_RED',
                ).length;

                return {
                    playerId: player.id,
                    teamId: team.id,
                    firstName: player.firstName,
                    lastName: player.lastName,
                    documentId: player.documentId,
                    position: player.position,
                    jerseyNumber: roster?.jerseyNumber ?? player.defaultDorsal ?? 0,
                    played: roster?.played ?? false,
                    isStarter: roster?.isStarter ?? false,
                    isSuspended: roster?.isSuspended ?? false,
                    goals,
                    yellowCards,
                    redCards,
                };
            });

        return {
            match: {
                id: match.id,
                tournamentId: match.tournamentId,
                tournamentName: match.tournament.name,
                matchDate: match.matchDate,
                venue: match.venue ?? '',
                phase: match.phase ?? '',
                sheetNumber: match.sheetNumber ?? '',
                status: match.status,
                refereeId: match.refereeId,
                referee: match.referee,
                homeScore: match.homeScore,
                awayScore: match.awayScore,
            },
            homeTeam: {
                id: match.homeTeam.id,
                name: match.homeTeam.name,
                players: mapTeamPlayers(match.homeTeam),
            },
            awayTeam: {
                id: match.awayTeam.id,
                name: match.awayTeam.name,
                players: mapTeamPlayers(match.awayTeam),
            },
        };
    }

    /**
     * Guarda la Planilla de Juego completa en una transacción atómica:
     * 1. Valida pertenencia de los equipos y calcula marcador desde los goles de cada equipo.
     * 2. Actualiza cabecera y marcador en Match.
     * 3. Registra participación (played), titularidad y dorsal en MatchRoster.
     * 4. Reemplaza y sincroniza los eventos (goles, amarillas, rojas) en MatchEvent.
     */
    async saveMatchSheet(matchId: number, dto: SaveMatchSheetDto) {
        const existingMatch = await this.prisma.match.findUnique({
            where: { id: matchId },
        });

        if (!existingMatch) {
            throw new NotFoundException(`El partido con ID ${matchId} no existe.`);
        }

        const allowedTeams = new Set([existingMatch.homeTeamId, existingMatch.awayTeamId]);
        for (const item of dto.players) {
            if (!allowedTeams.has(item.teamId)) {
                throw new BadRequestException(
                    `El equipo ${item.teamId} no pertenece al partido ${matchId}.`,
                );
            }
        }

        const homeScore = dto.players
            .filter((p) => p.teamId === existingMatch.homeTeamId)
            .reduce((sum, p) => sum + p.goals, 0);

        const awayScore = dto.players
            .filter((p) => p.teamId === existingMatch.awayTeamId)
            .reduce((sum, p) => sum + p.goals, 0);

        await this.prisma.$transaction(async (tx) => {
            await tx.match.update({
                where: { id: matchId },
                data: {
                    venue: dto.venue?.trim() || null,
                    phase: dto.phase?.trim() || null,
                    sheetNumber: dto.sheetNumber?.trim() || null,
                    refereeId: dto.refereeId !== undefined ? dto.refereeId : existingMatch.refereeId,
                    status: dto.status ?? existingMatch.status,
                    homeScore,
                    awayScore,
                },
            });

            for (const item of dto.players) {
                // Si tuvo participación activa (titular, gol o tarjeta), aseguramos played = true
                const effectivePlayed =
                    item.played ||
                    item.isStarter ||
                    item.goals > 0 ||
                    item.yellowCards > 0 ||
                    item.redCards > 0;

                await tx.matchRoster.upsert({
                    where: {
                        matchId_playerId: {
                            matchId,
                            playerId: item.playerId,
                        },
                    },
                    update: {
                        jerseyNumber: item.jerseyNumber,
                        played: effectivePlayed,
                        isStarter: item.isStarter,
                    },
                    create: {
                        matchId,
                        teamId: item.teamId,
                        playerId: item.playerId,
                        jerseyNumber: item.jerseyNumber,
                        played: effectivePlayed,
                        isStarter: item.isStarter,
                    },
                });
            }

            // Sincroniza eventos administrados desde la planilla evitando duplicados al re-guardar
            await tx.matchEvent.deleteMany({
                where: {
                    matchId,
                    type: { in: ['GOAL', 'YELLOW_CARD', 'RED_CARD', 'DOUBLE_YELLOW_RED'] },
                },
            });

            const eventsToCreate: Array<{
                matchId: number;
                teamId: number;
                playerId: number;
                type: string;
            }> = [];

            for (const item of dto.players) {
                for (let i = 0; i < item.goals; i++) {
                    eventsToCreate.push({
                        matchId,
                        teamId: item.teamId,
                        playerId: item.playerId,
                        type: 'GOAL',
                    });
                }
                for (let i = 0; i < item.yellowCards; i++) {
                    eventsToCreate.push({
                        matchId,
                        teamId: item.teamId,
                        playerId: item.playerId,
                        type: 'YELLOW_CARD',
                    });
                }
                for (let i = 0; i < item.redCards; i++) {
                    eventsToCreate.push({
                        matchId,
                        teamId: item.teamId,
                        playerId: item.playerId,
                        type: 'RED_CARD',
                    });
                }
            }

            if (eventsToCreate.length > 0) {
                await tx.matchEvent.createMany({ data: eventsToCreate });
            }
        });

        return this.getMatchSheet(matchId);
    }
}
