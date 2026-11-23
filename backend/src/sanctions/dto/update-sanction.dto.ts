import { CreateSanctionDto } from './create-sanction.dto';

export class UpdateSanctionDto implements Partial<CreateSanctionDto> {
    matchId?: number;
    playerId?: number;
    type?: string;
    description?: string;
    matchMinute?: number;
    matchesSuspended?: number;
    matchesServed?: number;
}