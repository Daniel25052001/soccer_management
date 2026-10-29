import { Controller, Get, Param } from '@nestjs/common';
import { StandingsService } from './standings.service';

@Controller('standings')
export class StandingsController {
    constructor(private readonly standingsService: StandingsService) { }

    @Get(':tournamentId')
    async getStandings(@Param('tournamentId') tournamentId: string) {
        return this.standingsService.getStandings(Number(tournamentId));
    }
}