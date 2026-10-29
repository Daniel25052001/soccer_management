import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { TeamsModule } from './teams/teams.module';
import { PlayersModule } from './players/players.module';
import { MatchesModule } from './matches/matches.module';
import { MatchRostersModule } from './match-rosters/match-rosters.module';
import { MatchEventsModule } from './match-events/match-events.module';
import { SanctionsModule } from './sanctions/sanctions.module';
import { StandingsModule } from './standings/standings.module';

@Module({
  imports: [PrismaModule, TournamentsModule, TeamsModule, PlayersModule, MatchesModule, MatchRostersModule, MatchEventsModule, SanctionsModule, StandingsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
