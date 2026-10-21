import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSanctionDto } from './dto/create-sanction.dto';
import { UpdateSanctionDto } from './dto/update-sanction.dto';

@Injectable()
export class SanctionsService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Registra una nueva sanción disciplinaria o financiera.
   */
  async create(createSanctionDto: CreateSanctionDto) {
    const { playerId, matchId } = createSanctionDto;

    const player = await this.prisma.player.findUnique({ where: { id: playerId } });
    if (!player) throw new NotFoundException(`El jugador con ID ${playerId} no existe.`);

    const match = await this.prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new NotFoundException(`El partido con ID ${matchId} no existe.`);

    return this.prisma.sanction.create({
      data: createSanctionDto,
      include: {
        player: true,
        match: true,
      },
    });
  }

  /**
   * Obtiene todas las sanciones registradas.
   */
  async findAll() {
    return this.prisma.sanction.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        player: true,
        match: true,
      },
    });
  }

  /**
   * Obtiene las sanciones asociadas a un jugador en específico.
   */
  async findByPlayer(playerId: number) {
    return this.prisma.sanction.findMany({
      where: { playerId },
      orderBy: { createdAt: 'desc' },
      include: {
        match: true,
      },
    });
  }

  /**
   * Obtiene el detalle de una sanción por su ID.
   */
  async findOne(id: number) {
    const sanction = await this.prisma.sanction.findUnique({
      where: { id },
      include: {
        player: true,
        match: true,
      },
    });

    if (!sanction) {
      throw new NotFoundException(`La sanción con ID ${id} no fue encontrada.`);
    }

    return sanction;
  }

  /**
   * Actualiza el estado de la sanción (ej: abonar pago o registrar fecha cumplida).
   */
  async update(id: number, updateSanctionDto: UpdateSanctionDto) {
    const currentSanction = await this.findOne(id);

    if (
      updateSanctionDto.matchesServed !== undefined &&
      updateSanctionDto.matchesServed >
      (updateSanctionDto.matchesSuspended ?? currentSanction.matchesSuspended)
    ) {
      throw new BadRequestException(
        'Los partidos cumplidos no pueden superar el total de partidos suspendidos.',
      );
    }

    return this.prisma.sanction.update({
      where: { id },
      data: updateSanctionDto,
      include: {
        player: true,
      },
    });
  }

  /**
   * Elimina un registro de sanción.
   */
  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.sanction.delete({
      where: { id },
    });
  }
}