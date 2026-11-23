import { CreateMatchRosterDto } from './create-match-roster.dto';

export class UpdateMatchRosterDto implements Partial<CreateMatchRosterDto> {
    matchId?: number;
    teamId?: number;
    playerId?: number;
    isStarting?: boolean;
    shirtNumber?: number;
}