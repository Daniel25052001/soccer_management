import { CreateTournamentDto } from './create-tournament.dto';

export class UpdateTournamentDto implements Partial<CreateTournamentDto> {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
}