import { CreateTeamDto } from './create-team.dto';

export class UpdateTeamDto implements Partial<CreateTeamDto> {
    name?: string;
    tournamentId?: number;
    delegateName?: string;
    delegatePhone?: string;
}