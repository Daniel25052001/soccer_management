import { CreateMatchEventDto } from './create-match-event.dto';

export class UpdateMatchEventDto implements Partial<CreateMatchEventDto> {
    matchId?: number;
    playerId?: number;
    type?: string; // Ejemplo: 'GOAL', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION'
    minute?: number;
    description?: string;
}