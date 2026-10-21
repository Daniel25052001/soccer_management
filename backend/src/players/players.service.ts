import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Registra un nuevo jugador validando la existencia del equipo y la unicidad del documento.
   */
  async create(createPlayerDto: CreatePlayerDto) {
    await this.verifyTeamExists(createPlayerDto.teamId);
    await this.verifyDocumentIsUnique(createPlayerDto.documentId);

    return this.prisma.player.create({
      data: createPlayerDto,
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
    await this.verifyTeamExists(teamId);

    return this.prisma.player.findMany({
      where: { teamId },
      orderBy: { defaultDorsal: 'asc' },
    });
  }

  /**
   * Obtiene el detalle de un jugador por su ID numérico.
   */
  async findOne(id: number) {
    const player = await this.prisma.player.findUnique({
      where: { id },
      include: {
        team: true,
        sanctions: true,
      },
    });

    if (!player) {
      throw new NotFoundException(`El jugador con ID ${id} no existe.`);
    }

    return player;
  }

  /**
   * Actualiza los datos de un jugador o lo transfiere de equipo.
   */
  async update(id: number, updatePlayerDto: UpdatePlayerDto) {
    const currentPlayer = await this.findOne(id);

    // Si se modifica el equipo, verificar que el nuevo equipo exista
    if (updatePlayerDto.teamId && updatePlayerDto.teamId !== currentPlayer.teamId) {
      await this.verifyTeamExists(updatePlayerDto.teamId);
    }

    // Si se modifica el documento, verificar que el nuevo documento no pertenezca a otro jugador
    if (
      updatePlayerDto.documentId &&
      updatePlayerDto.documentId !== currentPlayer.documentId
    ) {
      await this.verifyDocumentIsUnique(updatePlayerDto.documentId);
    }

    return this.prisma.player.update({
      where: { id },
      data: updatePlayerDto,
      include: {
        team: true,
      },
    });
  }

  /**
   * Elimina un jugador por su ID.
   */
  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.player.delete({
      where: { id },
    });
  }

  /**
   * Auxiliar: Valida que el equipo exista en la base de datos.
   */
  private async verifyTeamExists(teamId: number): Promise<void> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException(`El equipo con ID ${teamId} no existe.`);
    }
  }

  /**
   * Auxiliar: Valida que el documento de identidad no esté registrado.
   */
  private async verifyDocumentIsUnique(documentId: string): Promise<void> {
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