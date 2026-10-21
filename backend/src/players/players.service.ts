import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Registra un nuevo jugador validando la existencia del equipo y la unicidad del documento.
   */
  async create(createPlayerDto: CreatePlayerDto) {
    if (createPlayerDto.teamId) {
      await this.verifyTeamExists(Number(createPlayerDto.teamId));
    }
    if (createPlayerDto.documentId) {
      await this.verifyDocumentIsUnique(createPlayerDto.documentId);
    }

    return this.prisma.player.create({
      data: {
        teamId: Number(createPlayerDto.teamId),
        firstName: createPlayerDto.firstName,
        lastName: createPlayerDto.lastName,
        documentId: createPlayerDto.documentId,
        defaultDorsal:
          createPlayerDto.defaultDorsal !== undefined &&
            createPlayerDto.defaultDorsal !== null &&
            String(createPlayerDto.defaultDorsal) !== ''
            ? Number(createPlayerDto.defaultDorsal)
            : null,
        position: createPlayerDto.position || null,
      },
      include: {
        team: true,
      },
    });
  }

  /**
   * Obtiene todos los jugadores registrados con su equipo asociado.
   */
  async findAll() {
    return this.prisma.player.findMany({
      orderBy: { lastName: 'asc' },
      include: {
        team: true,
      },
    });
  }

  /**
   * Obtiene la nómina de todos los jugadores pertenecientes a un equipo específico.
   */
  async findByTeam(teamId: number) {
    const numericTeamId = Number(teamId);
    await this.verifyTeamExists(numericTeamId);

    return this.prisma.player.findMany({
      where: { teamId: numericTeamId },
      orderBy: { defaultDorsal: 'asc' },
    });
  }

  /**
   * Obtiene el detalle de un jugador por su ID numérico.
   */
  async findOne(id: number) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new BadRequestException('El ID del jugador debe ser un número válido.');
    }

    const player = await this.prisma.player.findUnique({
      where: { id: numericId },
      include: { team: true },
    });

    if (!player) {
      throw new NotFoundException(`Jugador con ID ${numericId} no encontrado.`);
    }

    return player;
  }

  /**
   * Actualiza los datos de un jugador o lo transfiere de equipo.
   */
  async update(id: number, updatePlayerDto: UpdatePlayerDto) {
    const numericId = Number(id);
    const currentPlayer = await this.findOne(numericId);

    if (
      updatePlayerDto.teamId &&
      Number(updatePlayerDto.teamId) !== currentPlayer.teamId
    ) {
      await this.verifyTeamExists(Number(updatePlayerDto.teamId));
    }

    if (
      updatePlayerDto.documentId &&
      updatePlayerDto.documentId !== currentPlayer.documentId
    ) {
      await this.verifyDocumentIsUnique(updatePlayerDto.documentId);
    }

    const dataToUpdate: Prisma.PlayerUpdateInput = {};

    if (updatePlayerDto.teamId !== undefined) {
      dataToUpdate.team = { connect: { id: Number(updatePlayerDto.teamId) } };
    }
    if (updatePlayerDto.firstName !== undefined) {
      dataToUpdate.firstName = updatePlayerDto.firstName;
    }
    if (updatePlayerDto.lastName !== undefined) {
      dataToUpdate.lastName = updatePlayerDto.lastName;
    }
    if (updatePlayerDto.documentId !== undefined) {
      dataToUpdate.documentId = updatePlayerDto.documentId;
    }
    if (updatePlayerDto.defaultDorsal !== undefined) {
      dataToUpdate.defaultDorsal =
        updatePlayerDto.defaultDorsal !== null &&
          updatePlayerDto.defaultDorsal !== undefined &&
          String(updatePlayerDto.defaultDorsal) !== ''
          ? Number(updatePlayerDto.defaultDorsal)
          : null;
    }
    if (updatePlayerDto.position !== undefined) {
      dataToUpdate.position = updatePlayerDto.position || null;
    }

    try {
      return await this.prisma.player.update({
        where: { id: numericId },
        data: dataToUpdate,
        include: {
          team: true,
        },
      });
    } catch (error) {
      console.error('Error en PlayersService.update:', error);
      throw new InternalServerErrorException('Error al actualizar la información del jugador.');
    }
  }

  /**
   * Elimina un jugador por su ID.
   */
  async remove(id: number) {
    const numericId = Number(id);
    await this.findOne(numericId);

    try {
      return await this.prisma.player.delete({
        where: { id: numericId },
      });
    } catch (error: any) {
      console.error('Error en PlayersService.remove:', error);
      if (error?.code === 'P2003') {
        throw new BadRequestException(
          'No se puede eliminar el jugador porque está asociado a partidos o alineaciones.'
        );
      }
      throw new InternalServerErrorException('No se pudo eliminar el jugador seleccionado.');
    }
  }

  /**
   * Auxiliar: Valida que el equipo exista en la base de datos.
   */
  private async verifyTeamExists(teamId: number): Promise<void> {
    const team = await this.prisma.team.findUnique({
      where: { id: Number(teamId) },
    });

    if (!team) {
      throw new NotFoundException(`El equipo con ID ${teamId} no existe.`);
    }
  }

  /**
   * Auxiliar: Valida que el documento de identidad no esté registrado.
   */
  private async verifyDocumentIsUnique(documentId: string): Promise<void> {
    if (!documentId) return;

    const existingPlayer = await this.prisma.player.findUnique({
      where: { documentId },
    });

    if (existingPlayer) {
      throw new ConflictException(
        `Ya existe un jugador registrado con el documento ${documentId}.`,
      );
    }
  }
}