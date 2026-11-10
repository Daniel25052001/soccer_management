import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RefereesService {
    constructor(private prisma: PrismaService) { }

    findAll() {
        return this.prisma.referee.findMany({
            orderBy: { name: 'asc' },
        });
    }

    create(data: { name: string; phone?: string; email?: string }) {
        return this.prisma.referee.create({ data });
    }

    update(id: number, data: { name?: string; phone?: string; email?: string; status?: string }) {
        return this.prisma.referee.update({
            where: { id },
            data,
        });
    }

    remove(id: number) {
        return this.prisma.referee.delete({
            where: { id },
        });
    }
}