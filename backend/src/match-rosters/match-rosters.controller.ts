import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { MatchRostersService } from './match-rosters.service';
import { CreateMatchRosterDto } from './dto/create-match-roster.dto';
import { BulkMatchRosterDto } from './dto/bulk-match-roster.dto';

@Controller('match-rosters')
export class MatchRostersController {
  constructor(private readonly matchRostersService: MatchRostersService) { }

  @Post()
  create(@Body() createMatchRosterDto: CreateMatchRosterDto) {
    return this.matchRostersService.create(createMatchRosterDto);
  }

  @Post('bulk')
  createBulk(@Body() bulkMatchRosterDto: BulkMatchRosterDto) {
    return this.matchRostersService.createBulk(bulkMatchRosterDto);
  }

  @Get('match/:matchId')
  findByMatch(@Param('matchId', ParseIntPipe) matchId: number) {
    return this.matchRostersService.findByMatch(matchId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.matchRostersService.remove(id);
  }
}