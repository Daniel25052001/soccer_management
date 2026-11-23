
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MatchSheetController } from './match-sheet.controller';
import { MatchSheetService } from './match-sheet.service';

@Module({
    imports: [PrismaModule],
    controllers: [MatchSheetController],
    providers: [MatchSheetService],
    exports: [MatchSheetService],
})
export class MatchSheetModule { }
