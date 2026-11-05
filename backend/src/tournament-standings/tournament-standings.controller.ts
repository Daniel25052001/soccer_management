import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TournamentStandingsService } from './tournament-standings.service';

@Controller('tournament-standings')
export class TournamentStandingsController {
    constructor(private readonly standingsService: TournamentStandingsService) { }

    /**
     * Endpoint GET para recuperar la tabla de posiciones de un torneo
     * Ruta: /api/tournament-standings/tournament/:tournamentId
     */
    @Get('tournament/:tournamentId')
    async getStandingsByTournament(
        @Param('tournamentId', ParseIntPipe) tournamentId: number,
    ) {
        return this.standingsService.getStandingsByTournament(tournamentId);
    }
}