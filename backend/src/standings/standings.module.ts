import { Module } from '@nestjs/common';
import { StandingsService } from './standings.service';
import { StandingsController } from './standings.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Dependiendo de tu ruta

@Module({
  imports: [PrismaModule],
  controllers: [StandingsController],
  providers: [StandingsService],
})
export class StandingsModule { }