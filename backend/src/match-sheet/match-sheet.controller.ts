
import { Body, Controller, Get, Param, ParseIntPipe, Put } from '@nestjs/common';
import { MatchSheetService } from './match-sheet.service';
import { SaveMatchSheetDto } from './dto/save-match-sheet.dto';

@Controller('matches')
export class MatchSheetController {
    constructor(private readonly matchSheetService: MatchSheetService) { }

    /**
     * Obtiene los datos completos de la planilla para un partido.
     */
    @Get(':id/sheet')
    getMatchSheet(@Param('id', ParseIntPipe) id: number) {
        return this.matchSheetService.getMatchSheet(id);
    }

    /**
     * Guarda o actualiza la planilla completa de un partido.
     */
    @Put(':id/sheet')
    saveMatchSheet(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: SaveMatchSheetDto,
    ) {
        return this.matchSheetService.saveMatchSheet(id, dto);
    }
}