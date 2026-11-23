import { CreateMatchDto } from './create-match.dto';

export class UpdateMatchDto implements Partial<CreateMatchDto> {
    tournamentId?: number;
    homeTeamId?: number;
    awayTeamId?: number;
    matchDate?: string;
    stadium?: string;
    status?: string;
    homeScore?: number;
    awayScore?: number;
}