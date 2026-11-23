import { CreatePlayerDto } from './create-player.dto';

export class UpdatePlayerDto implements Partial<CreatePlayerDto> {
    firstName?: string;
    lastName?: string;
    documentId?: string;
    defaultDorsal?: number | null;
    position?: string | null;
    teamId?: number;
}