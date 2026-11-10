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
import { TournamentStandingsModule } from './tournament-standings/tournament-standings.module';
import { RefereesModule } from './referees/referees.module';

/**
 * Módulo raíz de la aplicación NestJS (GolAdmin Backend).
 * Agrupa y centraliza todos los submódulos de la arquitectura del torneo,
 * la conexión a la base de datos (Prisma) y los servicios globales.
 */
@Module({
  imports: [
    // Módulo de Base de Datos
    PrismaModule,

    // Submódulos de gestión principal
    TournamentsModule,
    TeamsModule,
    PlayersModule,
    MatchesModule,
    MatchRostersModule,
    MatchEventsModule,
    SanctionsModule,
    StandingsModule,
    TournamentStandingsModule,
    RefereesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }