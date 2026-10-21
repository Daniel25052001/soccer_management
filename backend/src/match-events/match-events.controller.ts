import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { MatchEventsService } from './match-events.service';
import { CreateMatchEventDto } from './dto/create-match-event.dto';

@Controller('match-events')
export class MatchEventsController {
  constructor(private readonly matchEventsService: MatchEventsService) { }

  @Post()
  create(@Body() createMatchEventDto: CreateMatchEventDto) {
    return this.matchEventsService.create(createMatchEventDto);
  }

  @Get('match/:matchId')
  findByMatch(@Param('matchId', ParseIntPipe) matchId: number) {
    return this.matchEventsService.findByMatch(matchId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.matchEventsService.remove(id);
  }
}