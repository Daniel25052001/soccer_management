import { Module } from '@nestjs/common';
import { TournamentStandingsController } from './tournament-standings.controller';
import { TournamentStandingsService } from './tournament-standings.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TournamentStandingsController],
  providers: [TournamentStandingsService],
  exports: [TournamentStandingsService],
})
export class TournamentStandingsModule { }