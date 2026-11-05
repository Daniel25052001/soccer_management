import { Controller, Get, Param } from '@nestjs/common';
import { StandingsService } from './standings.service';

@Controller('standings')
export class StandingsController {
    constructor(private readonly standingsService: StandingsService) { }

    @Get(':tournamentId/best-defense')
    async getBestDefense(@Param('tournamentId') tournamentId: string) {
        console.log('GET /standings/:tournamentId/best-defense hit with id:', tournamentId);
        return this.standingsService.getBestDefense(Number(tournamentId));
    }

    @Get(':tournamentId/top-scorers')
    async getTopScorers(@Param('tournamentId') tournamentId: string) {
        console.log('GET /standings/:tournamentId/top-scorers hit with id:', tournamentId);
        return this.standingsService.getTopScorers(Number(tournamentId));
    }

    @Get(':tournamentId')
    async getStandings(@Param('tournamentId') tournamentId: string) {
        console.log('GET /standings/:tournamentId hit with id:', tournamentId);
        return this.standingsService.getStandings(Number(tournamentId));
    }
}