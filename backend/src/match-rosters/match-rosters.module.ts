import { Module } from '@nestjs/common';
import { MatchRostersService } from './match-rosters.service';
import { MatchRostersController } from './match-rosters.controller';

@Module({
  controllers: [MatchRostersController],
  providers: [MatchRostersService],
})
export class MatchRostersModule {}
