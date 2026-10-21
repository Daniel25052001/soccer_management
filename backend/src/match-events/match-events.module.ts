import { Module } from '@nestjs/common';
import { MatchEventsService } from './match-events.service';
import { MatchEventsController } from './match-events.controller';

@Module({
  controllers: [MatchEventsController],
  providers: [MatchEventsService],
})
export class MatchEventsModule {}
