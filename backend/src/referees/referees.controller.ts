import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { RefereesService } from './referees.service';

@Controller('referees')
export class RefereesController {
    constructor(private readonly refereesService: RefereesService) { }

    @Get()
    findAll() {
        return this.refereesService.findAll();
    }

    @Post()
    create(@Body() data: { name: string; phone?: string; email?: string }) {
        return this.refereesService.create(data);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: { name?: string; phone?: string; email?: string; status?: string }) {
        return this.refereesService.update(Number(id), data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.refereesService.remove(Number(id));
    }
}